// src/supabase/register-companyapi.ts
import { supabaseAdmin } from './serverClient'

export async function registerCompanyService(data: {
  email: string
  password: string
  displayName: string
  companyName: string
  domain: string
}) {
  try {
    // Generate tenant ID
    const tenantId = data.companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const rootDomain = import.meta.env.VITE_ROOT_DOMAIN
    if (!rootDomain) throw new Error('VITE_ROOT_DOMAIN not set')
    const fullDomain = `${data.domain}.${rootDomain}`

    // Create auth user with metadata
    const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          displayName: data.displayName,
          tenant_id: tenantId,
          role: 'admin'
        }
      }
    })
    if (signUpError) throw signUpError
    if (!signUpData.user) throw new Error('User signup failed')

    const userId = signUpData.user.id

    // Call RPC function to create tenant & admin
    const { error: rpcError } = await supabaseAdmin.rpc('register_company', {
      _tenant_id: tenantId,
      _tenant_name: data.companyName,
      _domain: fullDomain,
      _admin_id: userId,
      _admin_email: data.email,
      _admin_display_name: data.displayName
    })
    if (rpcError) throw rpcError

    // Remove any customer row (safety)
    await supabaseAdmin.from('customers').delete().eq('id', userId)

    return { tenantId, uid: userId }
  } catch (err: any) {
    console.error('Register company failed:', err)
    throw new Error(err.message || 'Failed to register company')
  }
}