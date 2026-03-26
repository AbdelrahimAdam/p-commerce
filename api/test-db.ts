// api/test-db.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Log all environment variables (without values for security)
  console.log('Environment variables present:', {
    supabaseUrl: !!process.env.VITE_SUPABASE_URL,
    serviceRoleKey: !!process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
    rootDomain: !!process.env.VITE_ROOT_DOMAIN
  })

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ 
      error: 'Missing environment variables',
      supabaseUrl: !!supabaseUrl,
      serviceRoleKey: !!serviceRoleKey
    })
  }

  // Create admin client with service role
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  // Try a simple query - count tenants
  const { data: countData, error: countError } = await supabaseAdmin
    .from('tenants')
    .select('*', { count: 'exact', head: true })

  if (countError) {
    console.error('Count error:', countError)
    return res.status(500).json({ 
      error: 'Failed to query tenants',
      details: countError.message,
      code: countError.code
    })
  }

  // Try to insert a test tenant
  const testId = `test-${Date.now()}`
  const { data: insertData, error: insertError } = await supabaseAdmin
    .from('tenants')
    .insert({
      id: testId,
      name: 'Test Tenant',
      domain: `${testId}.test.com`,
      owner_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()

  if (insertError) {
    console.error('Insert error:', insertError)
    return res.status(500).json({ 
      error: 'Failed to insert test tenant',
      details: insertError.message,
      code: insertError.code
    })
  }

  // Clean up - delete test tenant
  await supabaseAdmin
    .from('tenants')
    .delete()
    .eq('id', testId)

  return res.status(200).json({ 
    success: true, 
    message: 'Database connection successful',
    tenantCount: countData?.length || 0,
    testInsert: 'successful'
  })
}