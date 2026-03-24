// api/register-company.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password, displayName, companyName, domain } = req.body

    // Log incoming request (without sensitive data)
    console.log('📝 Registration request received:', { email, companyName, domain })

    // Validate required fields
    if (!email || !password || !displayName || !companyName || !domain) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['email', 'password', 'displayName', 'companyName', 'domain']
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    // Validate domain format
    const domainRegex = /^[a-z0-9-]+$/
    if (!domainRegex.test(domain)) {
      return res.status(400).json({ error: 'Domain must contain only lowercase letters, numbers, and hyphens' })
    }

    // Check environment variables
    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const rootDomain = process.env.VITE_ROOT_DOMAIN

    if (!supabaseUrl) {
      console.error('Missing VITE_SUPABASE_URL')
      return res.status(500).json({ error: 'Server configuration error: Missing Supabase URL' })
    }

    if (!serviceRoleKey) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY')
      return res.status(500).json({ error: 'Server configuration error: Missing service role key' })
    }

    if (!rootDomain) {
      console.error('Missing VITE_ROOT_DOMAIN')
      return res.status(500).json({ error: 'Server configuration error: Missing root domain' })
    }

    console.log('✅ Environment variables validated')

    // Initialize Supabase admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Generate unique tenant ID (slugified company name + timestamp)
    const baseSlug = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    const tenantId = `${baseSlug}-${Date.now()}`
    const fullDomain = `${domain}.${rootDomain}`

    console.log('📦 Generated tenant ID:', tenantId)
    console.log('🌐 Full domain:', fullDomain)

    // 1. Create the user (auto-confirm email)
    console.log('👤 Creating user...')
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
      return res.status(400).json({ 
        error: 'Failed to create user', 
        details: userError.message 
      })
    }

    if (!userData.user) {
      console.error('No user data returned')
      return res.status(500).json({ error: 'User creation failed: No user data returned' })
    }

    const userId = userData.user.id
    console.log('✅ User created:', userId)

    // 2. Create the tenant
    console.log('🏢 Creating tenant...')
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
      return res.status(400).json({ 
        error: 'Failed to create tenant', 
        details: tenantError.message 
      })
    }
    console.log('✅ Tenant created:', tenantId)

    // 3. Create the admin record
    console.log('👑 Creating admin record...')
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
      return res.status(400).json({ 
        error: 'Failed to create admin record', 
        details: adminError.message 
      })
    }
    console.log('✅ Admin record created')

    // Return success
    return res.status(200).json({
      success: true,
      tenantId,
      uid: userId,
      domain: fullDomain,
      message: 'Company registered successfully'
    })
  } catch (error: any) {
    console.error('❌ Registration error:', error)
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    })
  }
}
