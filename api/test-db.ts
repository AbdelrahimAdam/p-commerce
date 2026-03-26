// api/test-db.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Log the actual values (partially masked) for debugging
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
  
  console.log('=== DEBUG INFO ===')
  console.log('Supabase URL exists:', !!supabaseUrl)
  console.log('Supabase URL value (first 20 chars):', supabaseUrl?.substring(0, 20))
  console.log('Service role key exists:', !!serviceRoleKey)
  console.log('Service role key length:', serviceRoleKey?.length)
  console.log('Root domain:', process.env.VITE_ROOT_DOMAIN)
  
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ 
      error: 'Missing environment variables',
      hasUrl: !!supabaseUrl,
      hasKey: !!serviceRoleKey
    })
  }

  // Try to create client and test connection
  try {
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Test 1: Simple query to check if we can connect
    console.log('Testing connection with a simple query...')
    const { data: healthData, error: healthError } = await supabaseAdmin
      .from('tenants')
      .select('id')
      .limit(1)
    
    if (healthError) {
      console.error('Health check error:', healthError)
      return res.status(500).json({ 
        error: 'Connection test failed',
        details: healthError.message,
        code: healthError.code,
        hint: healthError.hint
      })
    }
    
    console.log('Health check successful, found', healthData?.length, 'tenants')
    
    // Test 2: Try to get the Supabase version or run a raw query
    const { data: versionData, error: versionError } = await supabaseAdmin
      .rpc('version')
      .catch(err => ({ data: null, error: err }))
    
    return res.status(200).json({ 
      success: true, 
      message: 'Database connection successful',
      tenantCount: healthData?.length || 0,
      supabaseVersion: versionData || 'unknown',
      environment: {
        nodeVersion: process.version,
        vercelEnv: process.env.VERCEL_ENV
      }
    })
    
  } catch (err: any) {
    console.error('Fatal error:', err)
    return res.status(500).json({ 
      error: 'Failed to create Supabase client',
      details: err.message,
      stack: err.stack
    })
  }
}