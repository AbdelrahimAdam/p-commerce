import { supabaseAdmin } from './serverClient'

interface RegisterCompanyInput {
  email: string
  password: string
  displayName: string
  companyName: string
  domain: string
}

export async function registerCompanyService(input: RegisterCompanyInput) {
  const { email, password, displayName, companyName, domain } = input

  if (!email || !password || !displayName || !companyName || !domain) {
    throw new Error('Missing required fields')
  }

  try {
    // Generate tenant ID
    const tenantId = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const rootDomain = process.env.VITE_ROOT_DOMAIN
    if (!rootDomain) throw new Error('Root domain is not set')
    const fullDomain = `${domain}.${rootDomain}`

    // 1️⃣ Create the auth user (server-only)
    const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { displayName, tenant_id: tenantId, role: 'admin' },
      email_confirm: true
    })

    if (signUpError) throw signUpError
    const userId = signUpData.user?.id
    if (!userId) throw new Error('User creation failed')

    // 2️⃣ Call RPC to create tenant + admin
    const { error: rpcError } = await supabaseAdmin.rpc('register_company', {
      _tenant_id: tenantId,
      _tenant_name: companyName,
      _domain: fullDomain,
      _admin_id: userId,
      _admin_email: email,
      _admin_display_name: displayName
    })
    if (rpcError) throw rpcError

    // 3️⃣ Fallback: ensure admin row exists
    const { data: adminData, error: adminFetchError } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('id', userId)
      .single()

    if (adminFetchError || !adminData) {
      await supabaseAdmin.from('admins').insert({
        id: userId,
        tenant_id: tenantId,
        role: 'admin',
        email,
        display_name: displayName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        permissions: ['all']
      })
    }

    return { tenantId, uid: userId }
  } catch (err: any) {
    console.error('❌ registerCompanyService error:', err)
    throw new Error(err.message || 'Company registration failed')
  }
}