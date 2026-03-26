// api/register-company.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

// Helper function to wait with exponential backoff
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Helper function to retry fetching admin
const fetchAdminWithRetry = async (
  supabaseAdmin: any,
  userId: string,
  maxRetries: number = 10,
  initialDelay: number = 500
): Promise<any> => {
  let lastError = null
  let delay = initialDelay

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`  Attempt ${attempt}/${maxRetries}: Fetching admin...`)
      
      const { data: admin, error: fetchError } = await supabaseAdmin
        .from('admins')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
      
      if (fetchError) {
        console.log(`  Fetch error on attempt ${attempt}:`, fetchError.message)
        lastError = fetchError
      } else if (admin) {
        console.log(`  ✅ Admin found on attempt ${attempt}!`)
        return admin
      } else {
        console.log(`  Admin not found on attempt ${attempt}`)
      }
      
      if (attempt < maxRetries) {
        console.log(`  Waiting ${delay}ms before next attempt...`)
        await wait(delay)
        delay = Math.min(delay * 1.5, 10000) // Exponential backoff, max 10 seconds
      }
    } catch (err) {
      console.error(`Unexpected error on attempt ${attempt}:`, err)
      lastError = err
      if (attempt < maxRetries) {
        await wait(delay)
        delay = Math.min(delay * 1.5, 10000)
      }
    }
  }
  
  console.error('Admin not found after', maxRetries, 'attempts, last error:', lastError)
  return null
}

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

    // Validation
    if (!email || !password || !displayName || !companyName || !domain) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    // Domain validation
    const domainRegex = /^[a-z0-9.-]+$/
    if (!domainRegex.test(domain)) {
      return res.status(400).json({
        error: 'Domain must contain only lowercase letters, numbers, hyphens, and dots'
      })
    }

    // Get environment variables
    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
    const rootDomain = process.env.VITE_ROOT_DOMAIN

    console.log('Environment check:', {
      supabaseUrl: !!supabaseUrl,
      serviceRoleKey: !!serviceRoleKey,
      rootDomain: !!rootDomain
    })

    if (!supabaseUrl || !serviceRoleKey || !rootDomain) {
      return res.status(500).json({ 
        error: 'Missing environment variables',
        details: {
          supabaseUrl: !!supabaseUrl,
          serviceRoleKey: !!serviceRoleKey,
          rootDomain: !!rootDomain
        }
      })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Generate IDs
    const fullDomain = `${domain}.${rootDomain}`
    const tenantId = `tenant_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    const now = new Date().toISOString()

    console.log('Generated IDs:', { tenantId, fullDomain })

    // Check domain availability
    console.log('Checking domain availability...')
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

    // STEP 1: Create the tenant FIRST (without owner_id)
    console.log('Step 1: Creating tenant...')
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
    console.log('✅ Tenant created')

    // STEP 2: Create the auth user
    console.log('Step 2: Creating auth user...')
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
      return res.status(400).json({ 
        error: 'Failed to create user', 
        details: userError.message 
      })
    }

    const userId = userData.user?.id
    if (!userId) {
      await supabaseAdmin.from('tenants').delete().eq('id', tenantId)
      return res.status(500).json({ error: 'User creation failed - no user ID' })
    }
    console.log('✅ User created:', userId)

    // STEP 3: Create the admin record
    console.log('Step 3: Creating admin record...')
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
    
    const { error: adminError } = await supabaseAdmin
      .from('admins')
      .insert(adminData)

    if (adminError) {
      console.error('Admin error:', adminError)
      // Rollback: delete user and tenant
      await supabaseAdmin.auth.admin.deleteUser(userId)
      await supabaseAdmin.from('tenants').delete().eq('id', tenantId)
      return res.status(400).json({ 
        error: 'Failed to create admin', 
        details: adminError.message,
        code: adminError.code
      })
    }
    console.log('✅ Admin record inserted')

    // Wait a moment for the database to be consistent
    console.log('⏳ Waiting for database consistency...')
    await wait(2000)

    // STEP 4: Update tenant with owner_id
    console.log('Step 4: Updating tenant with owner...')
    const { error: updateError } = await supabaseAdmin
      .from('tenants')
      .update({ owner_id: userId, updated_at: now })
      .eq('id', tenantId)

    if (updateError) {
      console.error('Update error (non-critical):', updateError)
      // This is not critical, continue
    } else {
      console.log('✅ Tenant owner updated')
    }

    // STEP 5: Fetch the admin with retry to confirm it exists
    console.log('Step 5: Verifying admin exists...')
    const verifiedAdmin = await fetchAdminWithRetry(supabaseAdmin, userId, 10, 500)

    if (!verifiedAdmin) {
      console.warn('⚠️ Admin record created but not yet readable. Returning success anyway.')
    } else {
      console.log('✅ Admin verified:', verifiedAdmin.id)
    }

    // Success! Return the result
    console.log('🎉 Registration completed successfully!')
    return res.status(200).json({
      success: true,
      tenantId,
      uid: userId,
      domain: fullDomain,
      adminVerified: !!verifiedAdmin
    })

  } catch (error: any) {
    console.error('❌ FATAL ERROR:', error)
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}