// api/register-company.ts (simplified working version)
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password, displayName, companyName, domain } = req.body

    // Validation
    if (!email || !password || !displayName || !companyName || !domain) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Get environment variables
    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
    const rootDomain = process.env.VITE_ROOT_DOMAIN

    if (!supabaseUrl || !serviceRoleKey || !rootDomain) {
      return res.status(500).json({ error: 'Missing environment variables' })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Generate IDs
    const fullDomain = `${domain}.${rootDomain}`
    const tenantId = `tenant_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    const now = new Date().toISOString()

    // STEP 1: Create the tenant FIRST (without owner_id)
    console.log('Creating tenant...')
    const { error: tenantError } = await supabaseAdmin
      .from('tenants')
      .insert({
        id: tenantId,
        name: companyName,
        domain: fullDomain,
        owner_id: null,
        created_at: now,
        updated_at: now
      })

    if (tenantError) {
      console.error('Tenant error:', tenantError)
      return res.status(400).json({ 
        error: 'Failed to create tenant', 
        details: tenantError.message,
        code: tenantError.code 
      })
    }

    // STEP 2: Create the auth user
    console.log('Creating user...')
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
      console.error('User error:', userError)
      // Rollback: delete tenant
      await supabaseAdmin.from('tenants').delete().eq('id', tenantId)
      return res.status(400).json({ error: 'Failed to create user', details: userError.message })
    }

    const userId = userData.user?.id
    if (!userId) {
      await supabaseAdmin.from('tenants').delete().eq('id', tenantId)
      return res.status(500).json({ error: 'User creation failed' })
    }

    // STEP 3: Create the admin record
    console.log('Creating admin...')
    const { error: adminError } = await supabaseAdmin
      .from('admins')
      .insert({
        id: userId,
        tenant_id: tenantId,
        role: 'admin',
        email,
        display_name: displayName,
        created_at: now,
        updated_at: now,
        is_active: true,
        permissions: ['all']
      })

    if (adminError) {
      console.error('Admin error:', adminError)
      // Rollback: delete user and tenant
      await supabaseAdmin.auth.admin.deleteUser(userId)
      await supabaseAdmin.from('tenants').delete().eq('id', tenantId)
      return res.status(400).json({ error: 'Failed to create admin', details: adminError.message })
    }

    // STEP 4: Update tenant with owner_id
    console.log('Updating tenant with owner...')
    const { error: updateError } = await supabaseAdmin
      .from('tenants')
      .update({ owner_id: userId, updated_at: now })
      .eq('id', tenantId)

    if (updateError) {
      console.error('Update error:', updateError)
      // This is not critical, we can still continue
      console.warn('Could not update owner_id, but tenant and admin were created')
    }

    // Success! Return the result
    return res.status(200).json({
      success: true,
      tenantId,
      uid: userId,
      domain: fullDomain
    })

  } catch (error: any) {
    console.error('Fatal error:', error)
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    })
  }
}