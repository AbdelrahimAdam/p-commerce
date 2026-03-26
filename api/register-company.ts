// api/register-company.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

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

    console.log('📝 Registration request:', { email, companyName, domain })

    // =========================
    // Validation
    // =========================
    if (!email || !password || !displayName || !companyName || !domain) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['email', 'password', 'displayName', 'companyName', 'domain']
      })
    }

    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    const domainRegex = /^[a-z0-9.-]+$/
    if (!domainRegex.test(domain)) {
      return res.status(400).json({
        error: 'Domain must contain only lowercase letters, numbers, hyphens, and dots'
      })
    }

    // =========================
    // Environment variables
    // =========================
    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
    const rootDomain = process.env.VITE_ROOT_DOMAIN

    if (!supabaseUrl) {
      console.error('Missing VITE_SUPABASE_URL')
      return res.status(500).json({ error: 'Missing VITE_SUPABASE_URL' })
    }
    if (!serviceRoleKey) {
      console.error('Missing VITE_SUPABASE_SERVICE_ROLE_KEY')
      return res.status(500).json({ error: 'Missing service role key' })
    }
    if (!rootDomain) {
      console.error('Missing VITE_ROOT_DOMAIN')
      return res.status(500).json({ error: 'Missing root domain' })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // =========================
    // Domain availability
    // =========================
    const fullDomain = `${domain}.${rootDomain}`

    const { data: existingTenant } = await supabaseAdmin
      .from('tenants')
      .select('id')
      .eq('domain', fullDomain)
      .maybeSingle()

    if (existingTenant) {
      return res.status(400).json({
        error: 'Domain already exists',
        domain: fullDomain
      })
    }

    // =========================
    // Generate tenant ID (use UUID to guarantee uniqueness)
    // =========================
    const tenantId = randomUUID()
    // Also keep a slug for reference if needed
    const baseSlug = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    const slug = `${baseSlug}-${Date.now()}`

    console.log('📦 Tenant ID (UUID):', tenantId)
    console.log('🌐 Domain:', fullDomain)

    // =========================
    // 1. CREATE AUTH USER
    // =========================
    const { data: userData, error: userError } =
      await supabaseAdmin.auth.admin.createUser({
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
      return res.status(400).json({
        error: 'Failed to create user',
        details: userError.message
      })
    }

    const userId = userData.user?.id
    if (!userId) {
      return res.status(500).json({ error: 'User creation failed' })
    }
    console.log('✅ User created:', userId)

    // =========================
    // 2. CREATE TENANT (with owner_id = NULL)
    // =========================
    const now = new Date().toISOString()
    const tenantData = {
      id: tenantId,
      name: companyName,
      domain: fullDomain,
      owner_id: null,
      created_at: now,
      updated_at: now
    }
    console.log('📝 Inserting tenant:', tenantData)

    const { error: tenantError } = await supabaseAdmin
      .from('tenants')
      .insert(tenantData)

    if (tenantError) {
      console.error('Tenant error:', tenantError)
      // Rollback: delete auth user
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return res.status(400).json({
        error: 'Failed to create tenant',
        details: tenantError.message,
        code: tenantError.code
      })
    }
    console.log('✅ Tenant created (owner_id = null)')

    // =========================
    // 3. CREATE ADMIN RECORD
    // =========================
    const adminData = {
      id: userId,
      tenant_id: tenantId,
      role: 'admin',
      email,
      display_name: displayName,
      created_at: now,
      updated_at: now,
      is_active: true,
      permissions: ['all']
    }
    console.log('📝 Inserting admin:', adminData)

    const { error: adminError } = await supabaseAdmin
      .from('admins')
      .insert(adminData)

    if (adminError) {
      console.error('Admin error:', adminError)
      // Rollback: delete tenant and auth user
      await supabaseAdmin.from('tenants').delete().eq('id', tenantId)
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return res.status(400).json({
        error: 'Failed to create admin',
        details: adminError.message,
        code: adminError.code
      })
    }
    console.log('✅ Admin created')

    // =========================
    // 4. UPDATE TENANT WITH OWNER_ID
    // =========================
    const { error: updateError } = await supabaseAdmin
      .from('tenants')
      .update({ owner_id: userId, updated_at: now })
      .eq('id', tenantId)

    if (updateError) {
      console.error('Update tenant error:', updateError)
      // Rollback: delete admin, tenant, auth user
      await supabaseAdmin.from('admins').delete().eq('id', userId)
      await supabaseAdmin.from('tenants').delete().eq('id', tenantId)
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return res.status(400).json({
        error: 'Failed to update tenant with owner',
        details: updateError.message,
        code: updateError.code
      })
    }
    console.log('✅ Tenant owner updated')

    // =========================
    // SUCCESS
    // =========================
    return res.status(200).json({
      success: true,
      tenantId,
      uid: userId,
      domain: fullDomain
    })

  } catch (error: any) {
    console.error('❌ FATAL ERROR:', error)
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    })
  }
}