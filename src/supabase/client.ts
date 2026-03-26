import { createClient, SupabaseClient, SupabaseClientOptions } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase' // You'll need to generate this

// Type definitions for better DX
type SupabaseEnv = {
  url: string
  anonKey: string
  serviceRoleKey?: string
}

/**
 * Validates and retrieves Supabase environment variables
 * Throws only in development, gracefully fails in production
 */
const getSupabaseEnv = (): SupabaseEnv | null => {
  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

  // Development: Strict validation
  if (import.meta.env.DEV) {
    if (!url || !anonKey) {
      throw new Error(
        '🚨 Missing Supabase environment variables in development!\n' +
        'Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
      )
    }
  }

  // Production: Log warning but don't crash
  if (!url || !anonKey) {
    console.error(
      '❌ Supabase: Missing required environment variables',
      {
        hasUrl: !!url,
        hasAnonKey: !!anonKey,
        mode: import.meta.env.MODE
      }
    )
    return null
  }

  return { url, anonKey, serviceRoleKey }
}

/**
 * Supabase client configuration options
 */
const clientOptions: SupabaseClientOptions<'public'> = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage,
    storageKey: 'sb-auth-token',
    flowType: 'pkce', // More secure auth flow
  },
  global: {
    headers: {
      'X-Client-Info': 'p-commerce',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
}

/**
 * Singleton Supabase client instance
 */
let supabaseInstance: SupabaseClient<Database> | null = null

/**
 * Initialize and return Supabase client
 * Uses singleton pattern to prevent multiple instances
 */
export const getSupabaseClient = (): SupabaseClient<Database> | null => {
  if (supabaseInstance) {
    return supabaseInstance
  }

  const env = getSupabaseEnv()
  
  if (!env) {
    console.warn('⚠️ Supabase client not initialized - missing environment variables')
    return null
  }

  try {
    supabaseInstance = createClient<Database>(
      env.url,
      env.anonKey,
      clientOptions
    )
    
    // Log successful initialization in development
    if (import.meta.env.DEV) {
      console.log('✅ Supabase client initialized successfully')
    }
    
    return supabaseInstance
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error)
    return null
  }
}

/**
 * Get service role client (for admin operations only)
 * This should NEVER be exposed to the client-side
 */
export const getServiceRoleClient = () => {
  const env = getSupabaseEnv()
  
  if (!env?.serviceRoleKey) {
    console.error('❌ Service role key not available')
    return null
  }

  return createClient<Database>(
    env.url,
    env.serviceRoleKey,
    {
      ...clientOptions,
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

/**
 * Check if Supabase is configured and available
 */
export const isSupabaseConfigured = (): boolean => {
  return !!getSupabaseClient()
}

/**
 * Health check for Supabase connection
 * Useful for debugging and monitoring
 */
export const checkSupabaseHealth = async (): Promise<{
  healthy: boolean
  error?: string
  latency?: number
}> => {
  const startTime = performance.now()
  const supabase = getSupabaseClient()
  
  if (!supabase) {
    return {
      healthy: false,
      error: 'Supabase client not initialized'
    }
  }

  try {
    // Simple query to check connection
    const { error } = await supabase
      .from('_health')
      .select('*')
      .limit(1)
      .maybeSingle()
    
    const latency = performance.now() - startTime
    
    if (error && !error.message.includes('relation "_health" does not exist')) {
      return {
        healthy: false,
        error: error.message,
        latency
      }
    }
    
    return {
      healthy: true,
      latency
    }
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Export a default instance for convenience
export const supabase = getSupabaseClient()

// Export types for use in other files
export type SupabaseClientType = SupabaseClient<Database>
