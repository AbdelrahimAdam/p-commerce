import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, query, where, getDocs, limit } from 'firebase/firestore'
import { db } from '@/firebase/config'

interface CachedTenant {
  tenantId: string
  tenantDomain: string
  expiry: number
}

export const useTenantStore = defineStore('tenant', () => {
  const tenantId = ref<string | null>(null)
  const tenantDomain = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isInitialized = ref(false)

  // ⚡ Cache expiry time in milliseconds (1 hour)
  const CACHE_EXPIRY = 1000 * 60 * 60

  const resolveTenantFromDomain = async () => {
    if (isInitialized.value) return

    isLoading.value = true
    error.value = null

    try {
      const hostname = window.location.hostname
      const cacheKey = `tenant_${hostname}`

      // 🔹 Load from cache if valid
      const cachedStr = localStorage.getItem(cacheKey)
      if (cachedStr) {
        const cached: CachedTenant = JSON.parse(cachedStr)
        if (cached.expiry && Date.now() < cached.expiry) {
          tenantId.value = cached.tenantId
          tenantDomain.value = cached.tenantDomain
          console.info('🟢 Tenant loaded from cache:', tenantId.value)
          isInitialized.value = true
          return
        } else {
          localStorage.removeItem(cacheKey) // expired
        }
      }

      // 🔹 Query Firestore for tenant based on real hostname
      const tenantsRef = collection(db, 'tenants')
      const q = query(tenantsRef, where('domain', '==', hostname), limit(1))
      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        error.value = `No tenant configured for domain "${hostname}"`
        tenantId.value = null
        tenantDomain.value = null
        console.warn(error.value)
        // 🔹 Redirect to choose-company or 404 page
        window.location.href = '/choose-company'
        return
      }

      const doc = snapshot.docs[0]
      tenantId.value = doc.id
      tenantDomain.value = doc.data().domain
      console.info('✅ Tenant resolved from Firestore:', tenantId.value)

      // 🔹 Cache tenant for future visits
      const cacheData: CachedTenant = {
        tenantId: tenantId.value,
        tenantDomain: tenantDomain.value,
        expiry: Date.now() + CACHE_EXPIRY
      }
      localStorage.setItem(cacheKey, JSON.stringify(cacheData))
    } catch (err: any) {
      console.error('❌ Tenant resolution failed:', err)
      error.value = err?.message || 'Failed to resolve tenant'
      tenantId.value = null
      tenantDomain.value = null
      // 🔹 Redirect to error page
      window.location.href = '/error'
    } finally {
      isLoading.value = false
      isInitialized.value = true
    }
  }

  return {
    tenantId,
    tenantDomain,
    isLoading,
    error,
    isInitialized,
    resolveTenantFromDomain
  }
})