// stores/tenant.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { collection, query, where, getDocs, limit, DocumentData, doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'

interface CachedTenant {
  tenantId: string
  tenantDomain: string
  expiry: number
}

export const useTenantStore = defineStore('tenant', () => {
  // State
  const tenantId = ref<string | null>(null)
  const tenantDomain = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isInitialized = ref(false)

  // Computed
  const isReady = computed(() => tenantId.value !== null && isInitialized.value)

  const CACHE_EXPIRY = 1000 * 60 * 60 // 1 hour
  const MAX_RETRIES = 2
  const RETRY_DELAY_MS = 1000

  let resolveReady: (value: unknown) => void
  let rejectReady: (reason?: any) => void
  const readyPromise = new Promise((resolve, reject) => {
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
            resolveReady(true)
            return
          } else {
            localStorage.removeItem(cacheKey)
          }
        } catch {
          localStorage.removeItem(cacheKey)
        }
      }

      const tenantsRef = collection(db, 'tenants')
      const q = query(tenantsRef, where('domain', '==', hostname), limit(1))
      let snapshot
      try {
        snapshot = await getDocs(q)
      } catch (firestoreError) {
        if (retryCount < MAX_RETRIES && firestoreError instanceof Error && 
            (firestoreError.message.includes('network') || firestoreError.message.includes('unavailable'))) {
          console.warn(`⚠️ Firestore error, retrying (${retryCount + 1}/${MAX_RETRIES})...`)
          await sleep(RETRY_DELAY_MS)
          return resolveTenantFromDomain(retryCount + 1)
        }
        throw firestoreError
      }

      if (snapshot.empty) {
        error.value = `No tenant configured for domain "${hostname}"`
        tenantId.value = null
        tenantDomain.value = null
        console.warn(error.value)
        rejectReady(new Error(error.value))
        return
      }

      const doc = snapshot.docs[0]
      const docData: DocumentData = doc.data()
      const resolvedDomain: string = (docData.domain as string) ?? ''
      if (!resolvedDomain) throw new Error('Tenant domain is missing in Firestore')

      tenantId.value = doc.id
      tenantDomain.value = resolvedDomain
      console.info('✅ Tenant resolved from Firestore:', tenantId.value)

      const cacheData: CachedTenant = {
        tenantId: tenantId.value,
        tenantDomain: tenantDomain.value,
        expiry: Date.now() + CACHE_EXPIRY
      }
      localStorage.setItem(cacheKey, JSON.stringify(cacheData))

      resolveReady(true)
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
      tenantId: id,
      tenantDomain: domain,
      expiry: Date.now() + CACHE_EXPIRY
    }
    localStorage.setItem(cacheKey, JSON.stringify(cacheData))
    console.info('🟢 Tenant set after registration:', id)
    resolveReady(true)
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
        readyPromise as Promise<void>,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Tenant resolution timeout')), timeoutMs))
      ])
    }
    return readyPromise as Promise<void>
  }

  const fetchTenantById = async (id: string): Promise<{ id: string; data: DocumentData } | null> => {
    try {
      const tenantDoc = await getDoc(doc(db, 'tenants', id))
      if (tenantDoc.exists()) {
        return { id: tenantDoc.id, data: tenantDoc.data() }
      }
      return null
    } catch (err) {
      console.error('Error fetching tenant by ID:', err)
      return null
    }
  }

  const isCurrentTenant = (id: string): boolean => tenantId.value === id

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
    isCurrentTenant
  }
})