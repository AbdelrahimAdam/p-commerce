// src/supabase/client.ts
import { createClient, SupabaseClient, SupabaseClientOptions } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

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
    flowType: 'pkce',
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

/**
 * Safe wrapper for Supabase operations
 * Provides null-safe access to supabase client
 */
export const supabaseSafe = {
  /**
   * Get the supabase client (throws if not available)
   */
  get client(): SupabaseClient<Database> {
    const client = getSupabaseClient()
    if (!client) {
      throw new Error('Supabase client is not available. Please check your environment variables.')
    }
    return client
  },

  /**
   * Check if supabase is available
   */
  get isAvailable(): boolean {
    return isSupabaseConfigured()
  },

  /**
   * Safely execute a supabase operation
   * Returns null if supabase is not available
   */
  async safeQuery<T>(
    operation: (client: SupabaseClient<Database>) => Promise<T>
  ): Promise<T | null> {
    const client = getSupabaseClient()
    if (!client) {
      console.warn('Supabase not available, skipping operation')
      return null
    }
    
    try {
      return await operation(client)
    } catch (error) {
      console.error('Supabase operation failed:', error)
      return null
    }
  },

  /**
   * Execute a supabase operation with error handling
   * Throws if supabase is not available or operation fails
   */
  async execute<T>(
    operation: (client: SupabaseClient<Database>) => Promise<T>
  ): Promise<T> {
    const client = getSupabaseClient()
    if (!client) {
      throw new Error('Supabase client is not available')
    }
    
    return await operation(client)
  },

  /**
   * From helper - returns the from method or throws
   */
  from(table: string) {
    const client = getSupabaseClient()
    if (!client) {
      throw new Error('Supabase client is not available')
    }
    return client.from(table)
  },

  /**
   * Auth helper - returns auth object or throws
   */
  get auth() {
    const client = getSupabaseClient()
    if (!client) {
      throw new Error('Supabase client is not available')
    }
    return client.auth
  },

  /**
   * Storage helper - returns storage object or throws
   */
  get storage() {
    const client = getSupabaseClient()
    if (!client) {
      throw new Error('Supabase client is not available')
    }
    return client.storage
  },

  /**
   * Realtime helper - returns realtime channel or throws
   */
  channel(channelName: string) {
    const client = getSupabaseClient()
    if (!client) {
      throw new Error('Supabase client is not available')
    }
    return client.channel(channelName)
  }
}

// Export a default instance for convenience
export const supabase = getSupabaseClient()

// Export types for use in other files
export type SupabaseClientType = SupabaseClient<Database>

// Export error class for better error handling
export class SupabaseNotAvailableError extends Error {
  constructor() {
    super('Supabase client is not available. Please check your environment variables.')
    this.name = 'SupabaseNotAvailableError'
  }
}
