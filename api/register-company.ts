// api/register-company.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Helper function to generate UUID
const generateUUID = (): string => {
  return crypto.randomUUID()
}

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
        .eq('user_id', userId)
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
        delay = Math.min(delay * 1.5, 10000)
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
    const { email, password, displayName, companyName, slug, urlType = 'subdomain' } = req.body

    console.log('📝 Registration request:', { email, companyName, slug, urlType })

    // Validation
    if (!email || !password || !displayName || !companyName || !slug) {
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

    // Validate slug
    const validatedSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-|-$/g, '')
    if (!validatedSlug || validatedSlug.length < 2) {
      return res.status(400).json({ error: 'Company name is too short or invalid' })
    }

    // Get environment variables
    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
    const rootDomain = process.env.VITE_ROOT_DOMAIN || 'p-commerce-peach.vercel.app'

    if (!supabaseUrl || !serviceRoleKey) {
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

    // Generate UUID for tenant
    const tenantId = generateUUID()
    
    // Determine the store URL based on URL type
    let storeDomain: string
    let storeUrl: string
    
    if (urlType === 'subdomain') {
      // Subdomain: brand.domain.com
      storeDomain = `${validatedSlug}.${rootDomain}`
      storeUrl = `https://${storeDomain}`
    } else {
      // Path-based: domain.com/store/brand
      storeDomain = rootDomain
      storeUrl = `https://${rootDomain}/store/${validatedSlug}`
    }
    
    const now = new Date().toISOString()

    console.log('Generated IDs:', { tenantId, storeDomain, storeUrl, slug: validatedSlug, urlType })

    // Check slug availability
    const { data: existingSlug } = await supabaseAdmin
      .from('tenants')
      .select('id')
      .eq('slug', validatedSlug)
      .maybeSingle()

    if (existingSlug) {
      return res.status(400).json({
        error: 'Store URL already exists. Please choose a different company name.',
        slug: validatedSlug
      })
    }

    // Check domain availability for subdomain
    if (urlType === 'subdomain') {
      const { data: existingDomain } = await supabaseAdmin
        .from('tenants')
        .select('id')
        .eq('domain', storeDomain)
        .maybeSingle()

      if (existingDomain) {
        return res.status(400).json({
          error: 'Domain already exists',
          domain: storeDomain
        })
      }
    }

    // STEP 1: Create the tenant with URL type information
    console.log('Step 1: Creating tenant...')
    const { error: tenantError } = await supabaseAdmin
      .from('tenants')
      .insert({
        id: tenantId,
        name: companyName,
        domain: storeDomain,
        slug: validatedSlug,
        owner_id: null,
        url_type: urlType,
        store_url: storeUrl,
        created_at: now,
        updated_at: now
      })

    if (tenantError) {
      console.error('Tenant error:', tenantError)
      return res.status(400).json({ 
        error: 'Failed to create tenant', 
        details: tenantError.message 
      })
    }
    console.log('✅ Tenant created with UUID:', tenantId)

    // STEP 2: Create the auth user
    console.log('Step 2: Creating auth user...')
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        displayName,
        tenant_id: tenantId,
        role: 'admin',
        companyName,
        slug: validatedSlug,
        urlType,
        storeUrl
      }
    })

    if (userError) {
      console.error('User error:', userError)
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
    console.log('Admin data to insert:', {
      id: userId,
      user_id: userId,
      tenant_id: tenantId,
      role: 'admin',
      email: email,
      display_name: displayName,
      is_active: true,
      permissions: ['all']
    })

    const { error: adminError } = await supabaseAdmin
      .from('admins')
      .insert({
        id: userId,
        user_id: userId,
        tenant_id: tenantId,
        role: 'admin',
        email: email,
        display_name: displayName,
        created_at: now,
        updated_at: now,
        is_active: true,
        permissions: ['all']
      })

    if (adminError) {
      console.error('❌ Admin error:', adminError)
      // Rollback: delete user and tenant
      await supabaseAdmin.auth.admin.deleteUser(userId)
      await supabaseAdmin.from('tenants').delete().eq('id', tenantId)
      return res.status(400).json({ 
        error: 'Failed to create admin', 
        details: adminError.message,
        code: adminError.code
      })
    }
    console.log('✅ Admin record inserted successfully')

    // Wait a moment for the database to be consistent
    await wait(2000)

    // STEP 4: Update tenant with owner_id
    console.log('Step 4: Updating tenant with owner...')
    const { error: updateError } = await supabaseAdmin
      .from('tenants')
      .update({ owner_id: userId, updated_at: now })
      .eq('id', tenantId)

    if (updateError) {
      console.error('Update error (non-critical):', updateError)
    } else {
      console.log('✅ Tenant owner updated')
    }

    // STEP 5: Verify admin exists
    console.log('Step 5: Verifying admin exists...')
    const verifiedAdmin = await fetchAdminWithRetry(supabaseAdmin, userId, 10, 500)

    if (!verifiedAdmin) {
      console.warn('⚠️ Admin record created but not yet readable')
    } else {
      console.log('✅ Admin verified:', verifiedAdmin.id)
    }

    console.log('🎉 Registration completed successfully!')
    return res.status(200).json({
      success: true,
      tenantId,
      uid: userId,
      storeDomain,
      storeUrl,
      slug: validatedSlug,
      urlType,
      adminVerified: !!verifiedAdmin
    })

  } catch (error: any) {
    console.error('❌ FATAL ERROR:', error)
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message
    })
  }
}