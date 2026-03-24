import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password, displayName, companyName, domain } = req.body

    // Use service role client (bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Generate unique tenant ID
    const baseSlug = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    const tenantId = `${baseSlug}-${Date.now()}`

    const rootDomain = process.env.VITE_ROOT_DOMAIN
    const fullDomain = `${domain}.${rootDomain}`

    // 1. Create the user (using service role)
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        displayName,
        tenant_id: tenantId,
        role: 'admin'
      }
    })

    if (userError) throw userError
    const userId = userData.user.id

    // 2. Create the tenant
    const { error: tenantError } = await supabaseAdmin
      .from('tenants')
      .insert({
        id: tenantId,
        name: companyName,
        domain: fullDomain,
        owner_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (tenantError) throw tenantError

    // 3. Create the admin
    const { error: adminError } = await supabaseAdmin
      .from('admins')
      .insert({
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

    if (adminError) throw adminError

    // Return success
    return res.status(200).json({ tenantId, uid: userId })
  } catch (error: any) {
    console.error('Registration error:', error)
    return res.status(500).json({ error: error.message || 'Registration failed' })
  }
}