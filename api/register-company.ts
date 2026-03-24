// api/register-company.ts
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

    console.log('📝 Registration request:', { email, companyName, domain })

    // =========================
    // ✅ Validation
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

    // ✅ FIXED: allow subdomains (.)
    const domainRegex = /^[a-z0-9.-]+$/
    if (!domainRegex.test(domain)) {
      return res.status(400).json({
        error: 'Domain must contain only lowercase letters, numbers, hyphens, and dots'
      })
    }

    // =========================
    // ✅ ENV VARIABLES (FIXED)
    // =========================
    const supabaseUrl = process.env.SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const rootDomain = process.env.ROOT_DOMAIN

    if (!supabaseUrl) {
      console.error('Missing SUPABASE_URL')
      return res.status(500).json({ error: 'Missing SUPABASE_URL' })
    }

    if (!serviceRoleKey) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY')
      return res.status(500).json({ error: 'Missing service role key' })
    }

    if (!rootDomain) {
      console.error('Missing ROOT_DOMAIN')
      return res.status(500).json({ error: 'Missing root domain' })
    }

    console.log('✅ ENV OK')

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // =========================
    // ✅ PRE-CHECK: DOMAIN EXISTS
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
    // ✅ CREATE TENANT ID
    // =========================
    const baseSlug = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const tenantId = `${baseSlug}-${Date.now()}`

    console.log('📦 Tenant ID:', tenantId)
    console.log('🌐 Domain:', fullDomain)

    // =========================
    // ✅ 1. CREATE USER
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
    // ✅ 2. CREATE TENANT
    // =========================
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
      console.error('Tenant error:', tenantError)

      await supabaseAdmin.auth.admin.deleteUser(userId)

      return res.status(400).json({
        error: 'Failed to create tenant',
        details: tenantError.message
      })
    }

    console.log('✅ Tenant created')

    // =========================
    // ✅ 3. CREATE ADMIN
    // =========================
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
      console.error('Admin error:', adminError)

      await supabaseAdmin.from('tenants').delete().eq('id', tenantId)
      await supabaseAdmin.auth.admin.deleteUser(userId)

      return res.status(400).json({
        error: 'Failed to create admin',
        details: adminError.message
      })
    }

    console.log('✅ Admin created')

    // =========================
    // ✅ SUCCESS
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
