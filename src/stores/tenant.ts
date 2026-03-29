// src/stores/tenant.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabaseSafe } from '@/supabase/client'

interface CachedTenant {
  tenantId: string
  tenantDomain: string
  tenantSlug: string
  expiry: number
}

// Helper to get Supabase client (throws if null)
const getClient = () => supabaseSafe.client

export const useTenantStore = defineStore('tenant', () => {
  const tenantId = ref<string | null>(null)
  const tenantDomain = ref<string | null>(null)
  const tenantSlug = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isInitialized = ref(false)

  const isReady = computed(() => tenantId.value !== null && isInitialized.value)
  const isMainDomain = computed(() => tenantId.value === null)

  const CACHE_EXPIRY = 1000 * 60 * 60 // 1 hour
  const MAX_RETRIES = 2
  const RETRY_DELAY_MS = 1000

  let resolveReady: () => void
  let rejectReady: (reason?: any) => void
  const readyPromise = new Promise<void>((resolve, reject) => {
    resolveReady = resolve
    rejectReady = reject
  })

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  // Parse subdomain from hostname
  const parseSubdomain = (hostname: string): string | null => {
    const rootDomain = import.meta.env.VITE_ROOT_DOMAIN || 'p-commerce-peach.vercel.app'
    
    // For production: check if it's a subdomain of the root domain
    if (hostname.endsWith(rootDomain) && hostname !== rootDomain && hostname !== 'localhost') {
      const parts = hostname.split('.')
      // Extract the subdomain (first part before the root domain)
      return parts[0]
    }
    
    // For localhost development with subdomains (e.g., tomford.localhost)
    if (hostname.includes('localhost') && hostname !== 'localhost') {
      const parts = hostname.split('.')
      return parts[0]
    }
    
    return null
  }

  const resolveTenantFromDomain = async (retryCount = 0): Promise<void> => {
    if (isInitialized.value) return

    isLoading.value = true
    error.value = null

    const hostname = window.location.hostname
    const pathname = window.location.pathname
    const rootDomain = import.meta.env.VITE_ROOT_DOMAIN || 'p-commerce-peach.vercel.app'

    console.log('🔍 resolveTenantFromDomain started, hostname:', hostname, 'path:', pathname)

    // Check for subdomain first (e.g., tomford.p-commerce-peach.vercel.app)
    const subdomainSlug = parseSubdomain(hostname)
    
    // Check if we're on a tenant path like /store/slug or /slug/admin (fallback)
    let tenantSlugFromPath: string | null = null

    // Try /store/:slug pattern
    const storeMatch = pathname.match(/^\/store\/([^\/]+)/)
    if (storeMatch) {
      tenantSlugFromPath = storeMatch[1]
      console.log('📁 Tenant slug from /store/ pattern:', tenantSlugFromPath)
    }
    // Try /:slug/admin pattern (for admin dashboard)
    else if (pathname.match(/^\/([^\/]+)\/admin/)) {
      const slugMatch = pathname.match(/^\/([^\/]+)\/admin/)
      tenantSlugFromPath = slugMatch ? slugMatch[1] : null
      console.log('📁 Tenant slug from /:slug/admin pattern:', tenantSlugFromPath)
    }
    // Try direct /:slug pattern
    else if (pathname.match(/^\/([^\/]+)$/)) {
      const slugMatch = pathname.match(/^\/([^\/]+)$/)
      tenantSlugFromPath = slugMatch ? slugMatch[1] : null
      console.log('📁 Tenant slug from direct pattern:', tenantSlugFromPath)
    }

    // PRIORITY 1: Subdomain detection (e.g., tomford.domain.com)
    if (subdomainSlug) {
      console.log('🌍 Subdomain detected:', subdomainSlug)
      
      // Check cache first
      const cacheKey = `tenant_subdomain_${subdomainSlug}`
      const cachedStr = localStorage.getItem(cacheKey)
      if (cachedStr) {
        try {
          const cached: CachedTenant = JSON.parse(cachedStr)
          if (cached.expiry && Date.now() < cached.expiry) {
            tenantId.value = cached.tenantId
            tenantDomain.value = cached.tenantDomain
            tenantSlug.value = cached.tenantSlug
            console.info('🟢 Tenant loaded from cache by subdomain:', tenantId.value)
            isInitialized.value = true
            resolveReady()
            return
          } else {
            localStorage.removeItem(cacheKey)
          }
        } catch {
          localStorage.removeItem(cacheKey)
        }
      }

      const client = getClient()
      // Look up tenant by slug (since subdomain = slug)
      const { data, error: fetchError } = await client
        .from('tenants')
        .select('id, domain, name, settings, slug')
        .eq('slug', subdomainSlug)
        .maybeSingle()

      if (!fetchError && data) {
        const row = data as any
        tenantId.value = row.id
        tenantDomain.value = row.domain
        tenantSlug.value = row.slug
        console.info('✅ Tenant resolved by subdomain:', tenantId.value)

        // Cache the result
        const cacheData: CachedTenant = {
          tenantId: tenantId.value!,
          tenantDomain: tenantDomain.value!,
          tenantSlug: tenantSlug.value!,
          expiry: Date.now() + CACHE_EXPIRY
        }
        localStorage.setItem(cacheKey, JSON.stringify(cacheData))

        isInitialized.value = true
        resolveReady()
        return
      } else {
        console.warn('No tenant found for subdomain:', subdomainSlug)
      }
    }

    // PRIORITY 2: Root domain with path-based tenant resolution
    if (hostname === rootDomain || hostname === 'localhost') {
      // Check if we have a tenant slug in the path
      if (tenantSlugFromPath) {
        console.log('🔍 Looking up tenant by slug:', tenantSlugFromPath)

        // Check cache first
        const cacheKey = `tenant_slug_${tenantSlugFromPath}`
        const cachedStr = localStorage.getItem(cacheKey)
        if (cachedStr) {
          try {
            const cached: CachedTenant = JSON.parse(cachedStr)
            if (cached.expiry && Date.now() < cached.expiry) {
              tenantId.value = cached.tenantId
              tenantDomain.value = cached.tenantDomain
              tenantSlug.value = cached.tenantSlug
              console.info('🟢 Tenant loaded from cache by slug:', tenantId.value)
              isInitialized.value = true
              resolveReady()
              return
            } else {
              localStorage.removeItem(cacheKey)
            }
          } catch {
            localStorage.removeItem(cacheKey)
          }
        }

        const client = getClient()
        const { data, error: fetchError } = await client
          .from('tenants')
          .select('id, domain, name, settings, slug')
          .eq('slug', tenantSlugFromPath)
          .maybeSingle()

        if (!fetchError && data) {
          const row = data as any
          tenantId.value = row.id
          tenantDomain.value = row.domain
          tenantSlug.value = row.slug
          console.info('✅ Tenant resolved by slug:', tenantId.value)

          // Cache the result
          const cacheData: CachedTenant = {
            tenantId: tenantId.value!,
            tenantDomain: tenantDomain.value!,
            tenantSlug: tenantSlug.value!,
            expiry: Date.now() + CACHE_EXPIRY
          }
          localStorage.setItem(cacheKey, JSON.stringify(cacheData))

          isInitialized.value = true
          resolveReady()
          return
        } else {
          console.warn('Tenant not found for slug:', tenantSlugFromPath)
        }
      }

      // No tenant found, this is the main landing page
      console.log('🏠 Main SaaS domain - no tenant')
      tenantId.value = null
      tenantDomain.value = null
      tenantSlug.value = null
      isInitialized.value = true
      resolveReady()
      return
    }

    // PRIORITY 3: Domain-based lookup (for custom domains)
    const cacheKey = `tenant_${hostname}`
    const cachedStr = localStorage.getItem(cacheKey)
    if (cachedStr) {
      try {
        const cached: CachedTenant = JSON.parse(cachedStr)
        if (cached.expiry && Date.now() < cached.expiry) {
          tenantId.value = cached.tenantId
          tenantDomain.value = cached.tenantDomain
          tenantSlug.value = cached.tenantSlug
          console.info('🟢 Tenant loaded from cache by domain:', tenantId.value)
          isInitialized.value = true
          resolveReady()
          return
        } else {
          localStorage.removeItem(cacheKey)
        }
      } catch {
        localStorage.removeItem(cacheKey)
      }
    }

    const client = getClient()
    let { data, error: fetchError } = await client
      .from('tenants')
      .select('id, domain, name, settings, slug')
      .eq('domain', hostname)
      .limit(1)

    if (fetchError) {
      if (retryCount < MAX_RETRIES && fetchError.message && 
          (fetchError.message.toLowerCase().includes('network') || 
           fetchError.message.toLowerCase().includes('unavailable'))) {
        console.warn(`⚠️ Supabase error, retrying (${retryCount + 1}/${MAX_RETRIES})...`)
        await sleep(RETRY_DELAY_MS)
        return resolveTenantFromDomain(retryCount + 1)
      }
      throw fetchError
    }

    const rows = data as any[]
    if (!rows || rows.length === 0) {
      console.warn(`No tenant for domain "${hostname}"`)
      error.value = `No tenant configured for domain "${hostname}"`
      tenantId.value = null
      tenantDomain.value = null
      tenantSlug.value = null
      rejectReady(new Error(error.value))
      return
    }

    const row = rows[0]
    const resolvedDomain: string = row.domain ?? ''
    if (!resolvedDomain) throw new Error('Tenant domain is missing in database')

    tenantId.value = row.id
    tenantDomain.value = resolvedDomain
    tenantSlug.value = row.slug
    console.info('✅ Tenant resolved from Supabase by domain:', tenantId.value)

    const cacheData: CachedTenant = {
      tenantId: tenantId.value!,
      tenantDomain: tenantDomain.value!,
      tenantSlug: tenantSlug.value!,
      expiry: Date.now() + CACHE_EXPIRY
    }
    localStorage.setItem(cacheKey, JSON.stringify(cacheData))

    resolveReady()
  }

  const setTenantAfterRegistration = (id: string, domain: string, slug: string) => {
    tenantId.value = id
    tenantDomain.value = domain
    tenantSlug.value = slug
    isInitialized.value = true
    isLoading.value = false

    const cacheKey = `tenant_${domain}`
    const cacheData: CachedTenant = {
      tenantId: tenantId.value!,
      tenantDomain: tenantDomain.value!,
      tenantSlug: tenantSlug.value!,
      expiry: Date.now() + CACHE_EXPIRY
    }
    localStorage.setItem(cacheKey, JSON.stringify(cacheData))

    // Also cache by slug and subdomain
    const slugCacheKey = `tenant_slug_${slug}`
    localStorage.setItem(slugCacheKey, JSON.stringify(cacheData))
    
    const subdomainCacheKey = `tenant_subdomain_${slug}`
    localStorage.setItem(subdomainCacheKey, JSON.stringify(cacheData))

    console.info('🟢 Tenant set after registration:', id)
    resolveReady()
  }

  const refreshTenant = async (): Promise<void> => {
    const hostname = window.location.hostname
    localStorage.removeItem(`tenant_${hostname}`)
    isInitialized.value = false
    await resolveTenantFromDomain()
  }

  const whenReady = (timeoutMs?: number): Promise<void> => {
    if (isReady.value) return Promise.resolve()
    if (timeoutMs) {
      return Promise.race([
        readyPromise,
        new Promise<void>((_, reject) => setTimeout(() => reject(new Error('Tenant resolution timeout')), timeoutMs))
      ])
    }
    return readyPromise
  }

  const fetchTenantById = async (id: string): Promise<{ id: string; data: any } | null> => {
    try {
      const client = getClient()
      const { data, error: fetchError } = await client
        .from('tenants')
        .select('*')
        .eq('id', id)
        .single()
      if (fetchError || !data) return null
      const row = data as any
      return { id: row.id, data: row }
    } catch (err) {
      console.error('Error fetching tenant by ID:', err)
      return null
    }
  }

  const isCurrentTenant = (id: string): boolean => tenantId.value === id

  const setIsInitialized = (value: boolean) => {
    isInitialized.value = value
    if (value) {
      resolveReady()
    }
  }

  return {
    tenantId,
    tenantDomain,
    tenantSlug,
    isLoading,
    error,
    isInitialized,
    isReady,
    isMainDomain,
    resolveTenantFromDomain,
    setTenantAfterRegistration,
    refreshTenant,
    whenReady,
    fetchTenantById,
    isCurrentTenant,
    setIsInitialized
  }
})