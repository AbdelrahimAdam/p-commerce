// api/register-company.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password, displayName, companyName, domain } = req.body

    // Validate required fields
    if (!email || !password || !displayName || !companyName || !domain) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Initialize Supabase admin client with service role key
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

    // Generate unique tenant ID (slugified company name + timestamp)
    const baseSlug = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    const tenantId = `${baseSlug}-${Date.now()}`

    const rootDomain = process.env.VITE_ROOT_DOMAIN
    if (!rootDomain) {
      throw new Error('VITE_ROOT_DOMAIN environment variable is not set')
    }
    const fullDomain = `${domain}.${rootDomain}`

    // 1. Create the user (auto-confirm email)
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        displayName,
        tenant_id: tenantId,
        role: 'admin'
      }
    })

    if (userError) {
      console.error('User creation error:', userError)
      return res.status(400).json({ error: userError.message })
    }

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

    if (tenantError) {
      console.error('Tenant creation error:', tenantError)
      // Rollback: delete the created user
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return res.status(400).json({ error: tenantError.message })
    }

    // 3. Create the admin record
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

    if (adminError) {
      console.error('Admin creation error:', adminError)
      // Rollback: delete tenant and user
      await supabaseAdmin.from('tenants').delete().eq('id', tenantId)
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return res.status(400).json({ error: adminError.message })
    }

    // Return success
    return res.status(200).json({
      success: true,
      tenantId,
      uid: userId,
      message: 'Company registered successfully'
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}