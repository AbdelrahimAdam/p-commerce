// src/supabase/client.ts
import { createClient, SupabaseClient, SupabaseClientOptions } from '@supabase/supabase-js'
import type { Product, Category, AdminUser } from '@/types'

// Define your Database type using your existing types
export interface Database {
  public: {
    Tables: {
      products: {
        Row: Product
        Insert: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
        Update: Partial<Omit<Product, 'id'>>
      }
      categories: {
        Row: Category
        Insert: Omit<Category, 'id'>
        Update: Partial<Category>
      }
      admin_users: {
        Row: AdminUser
        Insert: Omit<AdminUser, 'uid' | 'createdAt'>
        Update: Partial<AdminUser>
      }
      // Add other tables as needed
      orders: {
        Row: any // Define later
        Insert: any
        Update: any
      }
      wishlist: {
        Row: any // Define later
        Insert: any
        Update: any
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}

// Type definitions for better DX
type SupabaseEnv = {
  url: string
  anonKey: string
  serviceRoleKey?: string
}

/**
 * Validates and retrieves Supabase environment variables
 */
const getSupabaseEnv = (): SupabaseEnv | null => {
  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

  if (import.meta.env.DEV) {
    if (!url || !anonKey) {
      throw new Error(
        '🚨 Missing Supabase environment variables in development!\n' +
        'Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
      )
    }
  }

  if (!url || !anonKey) {
    console.error('❌ Supabase: Missing required environment variables', {
      hasUrl: !!url,
      hasAnonKey: !!anonKey,
      mode: import.meta.env.MODE
    })
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
 * Check if Supabase is configured and available
 */
export const isSupabaseConfigured = (): boolean => {
  return !!getSupabaseClient()
}

/**
 * Helper to cast table access to any (bypass TypeScript strict typing for tables)
 */
export const getTable = (table: string) => supabaseSafe.client.from(table) as any

/**
 * Safe wrapper for Supabase operations
 * Provides null-safe access to supabase client with your types
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
  from(table: keyof Database['public']['Tables']) {
    const client = getSupabaseClient()
    if (!client) {
      throw new Error('Supabase client is not available')
    }
    return client.from(table as string)
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
  },

  /**
   * RPC helper - call stored procedures
   */
  rpc(fn: string, params?: any) {
    const client = getSupabaseClient()
    if (!client) {
      throw new Error('Supabase client is not available')
    }
    return client.rpc(fn, params)
  }
}

// Export the main supabase client (could be null)
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

// Default export for convenience
export default supabaseSafe