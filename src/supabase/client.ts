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
      admins: {
        Row: any
        Insert: any
        Update: any
      }
      customers: {
        Row: any
        Insert: any
        Update: any
      }
      tenants: {
        Row: any
        Insert: any
        Update: any
      }
      orders: {
        Row: any
        Insert: any
        Update: any
      }
      wishlist: {
        Row: any
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
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const client = getSupabaseClient()
  if (!client) return false
  
  const { data: { session } } = await client.auth.getSession()
  return !!session
}

/**
 * Get current user session
 */
export const getCurrentSession = async () => {
  const client = getSupabaseClient()
  if (!client) return { session: null, user: null }
  
  const { data: { session } } = await client.auth.getSession()
  return { 
    session, 
    user: session?.user || null 
  }
}

/**
 * Safe query helper - only runs if authenticated
 */
export const safeQuery = async <T>(
  queryFn: (client: SupabaseClient<Database>) => Promise<{ data: T | null; error: any }>,
  options?: { requireAuth?: boolean; fallbackData?: T | null }
): Promise<{ data: T | null; error: any; isAuthenticated: boolean }> => {
  const client = getSupabaseClient()
  
  if (!client) {
    return { data: options?.fallbackData || null, error: { message: 'Supabase not available' }, isAuthenticated: false }
  }
  
  const { session } = await client.auth.getSession()
  const hasAuth = !!session
  
  // If auth is required and user is not authenticated, return fallback
  if (options?.requireAuth && !hasAuth) {
    console.log('🔒 Auth required but user not authenticated - returning fallback data')
    return { data: options?.fallbackData || null, error: null, isAuthenticated: false }
  }
  
  try {
    const result = await queryFn(client)
    return { ...result, isAuthenticated: hasAuth }
  } catch (error) {
    console.error('Query failed:', error)
    return { data: null, error, isAuthenticated: hasAuth }
  }
}

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
   * Safe from helper - returns null if not authenticated
   * Use this for public pages
   */
  safeFrom(table: keyof Database['public']['Tables']) {
    const client = getSupabaseClient()
    if (!client) {
      return null
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
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const client = getSupabaseClient()
    if (!client) return false
    const { data: { session } } = await client.auth.getSession()
    return !!session
  },

  /**
   * Get current user
   */
  async getCurrentUser() {
    const client = getSupabaseClient()
    if (!client) return null
    const { data: { user } } = await client.auth.getUser()
    return user
  },

  /**
   * Get current session
   */
  async getCurrentSession() {
    const client = getSupabaseClient()
    if (!client) return null
    const { data: { session } } = await client.auth.getSession()
    return session
  },

  /**
   * Query with auth check - automatically handles unauthenticated state
   * Use this for queries that should only run when user is logged in
   */
  async queryWithAuth<T>(
    queryFn: (client: SupabaseClient<Database>) => Promise<{ data: T | null; error: any }>,
    fallbackData?: T | null
  ): Promise<{ data: T | null; error: any; isAuthenticated: boolean }> {
    const client = getSupabaseClient()
    if (!client) {
      return { data: fallbackData || null, error: { message: 'Supabase not available' }, isAuthenticated: false }
    }
    
    const { data: { session } } = await client.auth.getSession()
    const hasAuth = !!session
    
    if (!hasAuth) {
      console.log('🔒 User not authenticated - skipping protected query')
      return { data: fallbackData || null, error: null, isAuthenticated: false }
    }
    
    try {
      const result = await queryFn(client)
      return { ...result, isAuthenticated: true }
    } catch (error) {
      console.error('Query failed:', error)
      return { data: null, error, isAuthenticated: true }
    }
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
