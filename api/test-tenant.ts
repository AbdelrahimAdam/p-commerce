// api/test-tenant.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const hostname = req.headers.host || ''
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Missing env vars' })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  // Query the tenant by domain
  const { data: tenant, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('domain', hostname)
    .single()

  if (error) {
    return res.status(404).json({ 
      error: 'Tenant not found',
      hostname,
      details: error.message
    })
  }

  return res.status(200).json({
    hostname,
    tenant: {
      id: tenant.id,
      name: tenant.name,
      domain: tenant.domain
    }
  })
}