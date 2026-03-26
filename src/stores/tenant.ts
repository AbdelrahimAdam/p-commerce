// src/stores/tenant.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabaseSafe } from '@/supabase/client'

interface CachedTenant {
  tenantId: string
  tenantDomain: string
  expiry: number
}

// Helper to get Supabase client (throws if null)
const getClient = () => supabaseSafe.client

export const useTenantStore = defineStore('tenant', () => {
  const tenantId = ref<string | null>(null)
  const tenantDomain = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isInitialized = ref(false)

  const isReady = computed(() => tenantId.value !== null && isInitialized.value)

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

  const resolveTenantFromDomain = async (retryCount = 0): Promise<void> => {
    if (isInitialized.value) return

    isLoading.value = true
    error.value = null

    const hostname = window.location.hostname
    const cacheKey = `tenant_${hostname}`

    try {
      console.log('🔍 resolveTenantFromDomain started, hostname:', hostname)

      const cachedStr = localStorage.getItem(cacheKey)
      if (cachedStr) {
        try {
          const cached: CachedTenant = JSON.parse(cachedStr)
          if (cached.expiry && Date.now() < cached.expiry) {
            tenantId.value = cached.tenantId
            tenantDomain.value = cached.tenantDomain
            console.info('🟢 Tenant loaded from cache:', tenantId.value)
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
        .select('id, domain, name, settings')
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
        // Fallback: get first tenant (for local development)
        console.warn(`No tenant for domain "${hostname}", trying fallback...`)
        const { data: fallbackData, error: fallbackError } = await client
          .from('tenants')
          .select('id, domain, name, settings')
          .limit(1)

        if (fallbackError) throw fallbackError

        const fallbackRows = fallbackData as any[]
        if (fallbackRows && fallbackRows.length > 0) {
          const row = fallbackRows[0]
          tenantId.value = row.id
          tenantDomain.value = row.domain
          console.info('🟢 Tenant resolved from fallback:', tenantId.value)
          const cacheData: CachedTenant = {
            tenantId: tenantId.value!,
            tenantDomain: tenantDomain.value!,
            expiry: Date.now() + CACHE_EXPIRY
          }
          localStorage.setItem(cacheKey, JSON.stringify(cacheData))
          isInitialized.value = true
          resolveReady()
          return
        }

        error.value = `No tenant configured for domain "${hostname}"`
        tenantId.value = null
        tenantDomain.value = null
        console.warn(error.value)
        rejectReady(new Error(error.value))
        return
      }

      const row = rows[0]
      const resolvedDomain: string = row.domain ?? ''
      if (!resolvedDomain) throw new Error('Tenant domain is missing in database')

      tenantId.value = row.id
      tenantDomain.value = resolvedDomain
      console.info('✅ Tenant resolved from Supabase:', tenantId.value)

      const cacheData: CachedTenant = {
        tenantId: tenantId.value!,
        tenantDomain: tenantDomain.value!,
        expiry: Date.now() + CACHE_EXPIRY
      }
      localStorage.setItem(cacheKey, JSON.stringify(cacheData))

      resolveReady()
    } catch (err: any) {
      console.error('❌ Tenant resolution failed:', err)
      error.value = err?.message || 'Failed to resolve tenant'
      tenantId.value = null
      tenantDomain.value = null
      rejectReady(err)
    } finally {
      isLoading.value = false
      isInitialized.value = true
    }
  }

  const setTenantAfterRegistration = (id: string, domain: string) => {
    tenantId.value = id
    tenantDomain.value = domain
    isInitialized.value = true
    isLoading.value = false

    const cacheKey = `tenant_${domain}`
    const cacheData: CachedTenant = {
      tenantId: tenantId.value!,
      tenantDomain: tenantDomain.value!,
      expiry: Date.now() + CACHE_EXPIRY
    }
    localStorage.setItem(cacheKey, JSON.stringify(cacheData))
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

  // Method to manually set initialized state (for root domain)
  const setIsInitialized = (value: boolean) => {
    isInitialized.value = value
    if (value) {
      // If we're setting initialized without a tenant, resolve the promise
      resolveReady()
    }
  }

  return {
    tenantId,
    tenantDomain,
    isLoading,
    error,
    isInitialized,
    isReady,
    resolveTenantFromDomain,
    setTenantAfterRegistration,
    refreshTenant,
    whenReady,
    fetchTenantById,
    isCurrentTenant,
    setIsInitialized
  }
})