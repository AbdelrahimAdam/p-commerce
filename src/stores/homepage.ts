// src/stores/homepage.ts – FIXED with correct tenant store properties
import { defineStore } from 'pinia'
import { ref, reactive, onUnmounted } from 'vue'
import { supabaseSafe } from '@/supabase/client'
import { useAuthStore } from '@/stores/auth'
import { useTenantStore } from '@/stores/tenant'

// =================== TYPE DEFINITIONS ===================

interface HeroBanner {
  imageUrl: string
  linkText?: string
  linkUrl?: string
}

interface Offer {
  id?: string
  slug: string
  title: string
  subtitle: string
  description: string
  imageUrl: string
  oldPrice: number
  newPrice: number
  linkUrl?: string
  startDate?: string
  endDate?: string
  offerType: string
  terms?: string
  active?: boolean
}

interface MarqueeBrand {
  id: string
  name: string
  logo: string
}

interface Settings {
  isDarkMode: boolean
  defaultLanguage: string
}

interface HomepageData {
  heroBanner: HeroBanner
  activeOffers: Offer[]
  marqueeBrands: MarqueeBrand[]
  aboutWork: {
    title: string
    description: string
  }
  settings: Settings
  tenantId?: string
  lastUpdated?: string
  source?: 'supabase' | 'cache' | 'default'
}

type ListenerCallback = (data: HomepageData) => void

// Helper to get supabase client (throws if null)
const getClient = () => supabaseSafe.client

export const useHomepageStore = defineStore('homepage', () => {
  const authStore = useAuthStore()
  const tenantStore = useTenantStore()

  // =================== DEFAULT DATA ===================
  const defaultLocalData: HomepageData = {
    heroBanner: {
      imageUrl: '/images/banner.jpg',
      linkText: 'SHOP NOW',
      linkUrl: '/shop'
    },
    activeOffers: [],
    marqueeBrands: [],
    aboutWork: {
      title: 'what about our work',
      description: 'Premium perfume collections curated with expertise and passion for luxury scents.'
    },
    settings: {
      isDarkMode: false,
      defaultLanguage: 'ar'
    },
    tenantId: undefined,
    lastUpdated: new Date().toISOString(),
    source: 'default'
  }

  // =================== STATE ===================
  const homepageData = reactive<HomepageData>({ ...defaultLocalData })
  const isLoading = ref(false)
  const error = ref<string>('')
  const currentTenantId = ref<string | null>(null)

  let subscription: ReturnType<ReturnType<typeof getClient>['channel']> | null = null
  const isListening = ref(false)
  const listeners = new Set<ListenerCallback>()

  // Cache keys that are tenant-specific
  const getCacheKey = (tenantId: string) => `homepage_cache_${tenantId}_v2`
  const getCacheTimestampKey = (tenantId: string) => `homepage_cache_timestamp_${tenantId}_v2`
  const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

  // Helper to get current tenant ID
  const getCurrentTenantId = (): string | null => {
    // Try to get from tenant store first
    if (tenantStore.tenantId) {
      return tenantStore.tenantId
    }
    // Fallback to auth store's current tenant
    if (authStore.currentTenant) {
      return authStore.currentTenant
    }
    return null
  }

  // =================== HELPERS ===================
  const checkPermission = (): boolean => {
    if (!authStore.isAdmin) {
      throw new Error('Permission denied: Only admin can modify homepage')
    }
    return true
  }

  const getCachedData = (tenantId: string): HomepageData | null => {
    try {
      const cacheKey = getCacheKey(tenantId)
      const timestampKey = getCacheTimestampKey(tenantId)
      const cached = localStorage.getItem(cacheKey)
      const timestamp = localStorage.getItem(timestampKey)
      
      if (cached && timestamp) {
        const cacheAge = Date.now() - parseInt(timestamp)
        if (cacheAge < CACHE_DURATION) {
          const parsed = JSON.parse(cached)
          return parsed
        }
        // Cache expired, clear it
        localStorage.removeItem(cacheKey)
        localStorage.removeItem(timestampKey)
      }
    } catch (err) {
      console.warn('Failed to read cache:', err)
    }
    return null
  }

  const saveToCache = (tenantId: string, data: HomepageData) => {
    try {
      const cacheKey = getCacheKey(tenantId)
      const timestampKey = getCacheTimestampKey(tenantId)
      localStorage.setItem(cacheKey, JSON.stringify({ ...data, source: 'cache', tenantId }))
      localStorage.setItem(timestampKey, Date.now().toString())
    } catch (err) {
      console.warn('Failed to save cache:', err)
    }
  }

  const clearCache = (tenantId?: string) => {
    try {
      if (tenantId) {
        localStorage.removeItem(getCacheKey(tenantId))
        localStorage.removeItem(getCacheTimestampKey(tenantId))
      } else {
        // Clear all homepage caches
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.startsWith('homepage_cache_')) {
            localStorage.removeItem(key)
          }
          if (key.startsWith('homepage_cache_timestamp_')) {
            localStorage.removeItem(key)
          }
        })
      }
    } catch (err) {
      console.warn('Failed to clear cache:', err)
    }
  }

  const notifyListeners = (data: HomepageData) => {
    listeners.forEach(cb => cb(data))
  }

  // =================== SUPABASE REAL‑TIME LISTENER ===================
  const setupSupabaseListener = async (tenantId: string): Promise<void> => {
    if (!tenantId) {
      console.warn('No tenant ID – cannot setup homepage listener')
      return
    }

    if (subscription) {
      // Clean up existing subscription if tenant changed
      const client = getClient()
      client.removeChannel(subscription)
      subscription = null
      isListening.value = false
    }

    try {
      const client = getClient()
      // Create a channel for this tenant's homepage
      const channel = client
        .channel(`homepage:${tenantId}`)
        .on(
          'postgres_changes',
          {
            event: '*', // listen to INSERT, UPDATE, DELETE
            schema: 'public',
            table: 'homepage',
            filter: `tenant_id=eq.${tenantId}`
          },
          (payload) => {
            if (payload.eventType === 'DELETE') {
              // Document deleted – fallback to cached or default
              console.log('Homepage document deleted for tenant', tenantId)
              const cached = getCachedData(tenantId)
              if (cached) {
                Object.assign(homepageData, cached)
                notifyListeners(cached)
              } else {
                const defaultData = { ...defaultLocalData, tenantId }
                Object.assign(homepageData, defaultData)
                notifyListeners(defaultData)
              }
            } else if (payload.new) {
              const data = payload.new as any
              const sections = data.sections as HomepageData
              if (sections) {
                const newData = { ...sections, source: 'supabase', tenantId }
                Object.assign(homepageData, newData)
                saveToCache(tenantId, homepageData)
                notifyListeners(homepageData)
                if (homepageData.settings?.isDarkMode) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
                error.value = ''
              }
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            isListening.value = true
            console.log('📡 Homepage listener active for tenant', tenantId)
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Homepage channel error for tenant', tenantId)
            isListening.value = false
          }
        })

      subscription = channel
    } catch (err: any) {
      error.value = 'Failed to setup Supabase listener'
      console.error(err)
    }
  }

  // =================== PUBLIC METHODS ===================
  const subscribeToUpdates = (callback: ListenerCallback): (() => void) => {
    listeners.add(callback)
    return () => listeners.delete(callback)
  }

  const loadHomepageData = async (forceRefresh: boolean = false): Promise<void> => {
    try {
      isLoading.value = true
      error.value = ''
      
      // Get current tenant from tenant store
      const tenantId = tenantStore.tenantId || authStore.currentTenant
      
      if (!tenantId) {
        console.log('No tenant found – using default homepage data')
        Object.assign(homepageData, { ...defaultLocalData, tenantId: undefined })
        notifyListeners(homepageData)
        return
      }

      // Update current tenant ID
      currentTenantId.value = tenantId

      if (forceRefresh) {
        clearCache(tenantId)
      }

      // Try to get cached data first
      const cachedData = getCachedData(tenantId)
      if (cachedData && !forceRefresh) {
        console.log('📦 Using cached homepage data for tenant:', tenantId)
        Object.assign(homepageData, cachedData)
        notifyListeners(cachedData)
      }

      // Fetch fresh data from Supabase (public read is allowed)
      const client = getClient()
      const { data, error: fetchError } = await client
        .from('homepage')
        .select('sections')
        .eq('tenant_id', tenantId)
        .maybeSingle()

      if (fetchError) {
        console.error('Error fetching homepage:', fetchError)
        throw fetchError
      }

      if (data && (data as any).sections) {
        const sections = (data as any).sections as HomepageData
        const freshData = { ...sections, source: 'supabase' as const, tenantId }
        Object.assign(homepageData, freshData)
        saveToCache(tenantId, homepageData)
        notifyListeners(homepageData)
        console.log('✅ Loaded homepage data from Supabase for tenant:', tenantId)
      } else {
        // No document exists yet – use default data for this tenant
        console.log('No homepage document found for tenant, using defaults:', tenantId)
        const defaultData = { ...defaultLocalData, tenantId, source: 'default' as const }
        Object.assign(homepageData, defaultData)
        saveToCache(tenantId, homepageData)
        notifyListeners(homepageData)
      }

      // Set up real‑time listener after fetching initial data
      await setupSupabaseListener(tenantId)
      
    } catch (err: any) {
      console.error('Failed to load homepage data:', err)
      error.value = err.message || 'Failed to load homepage data'
      
      // Fall back to cached or default data on error
      const tenantId = tenantStore.tenantId || authStore.currentTenant
      if (tenantId) {
        const cachedData = getCachedData(tenantId)
        if (cachedData) {
          Object.assign(homepageData, cachedData)
          notifyListeners(cachedData)
        } else {
          const defaultData = { ...defaultLocalData, tenantId }
          Object.assign(homepageData, defaultData)
          notifyListeners(defaultData)
        }
      }
    } finally {
      isLoading.value = false
    }
  }

  const updateHomepageData = async (updates: Partial<HomepageData>): Promise<boolean> => {
    const tenantId = tenantStore.tenantId || authStore.currentTenant
    if (!tenantId) {
      throw new Error('No tenant – cannot update homepage')
    }

    try {
      checkPermission()
      isLoading.value = true

      // Merge current data with updates
      const newData: HomepageData = {
        ...homepageData,
        ...updates,
        tenantId,
        lastUpdated: new Date().toISOString(),
        source: 'supabase'
      }

      const client = getClient()
      // Upsert into Supabase
      const { error: upsertError } = await client
        .from('homepage')
        .upsert({
          tenant_id: tenantId,
          sections: newData,
          updated_at: new Date().toISOString()
        } as any, { onConflict: 'tenant_id' })

      if (upsertError) throw upsertError

      // Update local state
      Object.assign(homepageData, newData)
      clearCache(tenantId)
      saveToCache(tenantId, newData)
      notifyListeners(newData)

      console.log('✅ Homepage updated for tenant:', tenantId)
      return true
    } catch (err: any) {
      console.error('Failed to update homepage:', err)
      throw new Error(`Failed to update homepage: ${err.message}`)
    } finally {
      isLoading.value = false
    }
  }

  const toggleDarkMode = async (): Promise<boolean> => {
    try {
      checkPermission()
      const newDarkModeState = !homepageData.settings.isDarkMode
      await updateHomepageData({
        settings: { ...homepageData.settings, isDarkMode: newDarkModeState }
      })
      return newDarkModeState
    } catch (err) {
      return homepageData.settings.isDarkMode
    }
  }

  const resetToDefaults = async (): Promise<boolean> => {
    const tenantId = tenantStore.tenantId || authStore.currentTenant
    if (!tenantId) {
      error.value = 'No tenant – cannot reset'
      return false
    }

    try {
      checkPermission()
      isLoading.value = true
      const resetData: HomepageData = {
        ...defaultLocalData,
        tenantId,
        lastUpdated: new Date().toISOString(),
        source: 'default'
      }
      await updateHomepageData(resetData)
      return true
    } catch (err: any) {
      error.value = 'Failed to reset to defaults: ' + err.message
      return false
    } finally {
      isLoading.value = false
    }
  }

  const forceRefresh = async (): Promise<void> => {
    await loadHomepageData(true)
  }

  const checkConnection = async (): Promise<{ connected: boolean; lastUpdate?: string }> => {
    const tenantId = tenantStore.tenantId || authStore.currentTenant
    if (!tenantId) {
      return { connected: false }
    }

    try {
      const client = getClient()
      const { data, error: fetchError } = await client
        .from('homepage')
        .select('updated_at')
        .eq('tenant_id', tenantId)
        .maybeSingle()

      if (fetchError) throw fetchError

      return {
        connected: true,
        lastUpdate: (data as any)?.updated_at
      }
    } catch (err) {
      return { connected: false }
    }
  }

  const initializeHomepageData = async (): Promise<boolean> => {
    // Creates a default homepage document for the current tenant if not exists
    const tenantId = tenantStore.tenantId || authStore.currentTenant
    if (!tenantId) {
      error.value = 'No tenant – cannot initialize homepage data'
      return false
    }

    try {
      checkPermission()
      const client = getClient()
      // Check if already exists
      const { data, error: fetchError } = await client
        .from('homepage')
        .select('tenant_id')
        .eq('tenant_id', tenantId)
        .maybeSingle()

      if (fetchError) throw fetchError

      if (data) {
        // Already exists, nothing to do
        return true
      }

      // Create default document
      const defaultData: HomepageData = {
        ...defaultLocalData,
        tenantId,
        lastUpdated: new Date().toISOString(),
        source: 'default'
      }

      const { error: insertError } = await client
        .from('homepage')
        .insert({
          tenant_id: tenantId,
          sections: defaultData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as any)

      if (insertError) throw insertError

      console.log('✅ Homepage initialized for tenant:', tenantId)
      return true
    } catch (err: any) {
      error.value = 'Failed to initialize homepage data: ' + err.message
      return false
    }
  }

  const stopListening = () => {
    if (subscription) {
      const client = getClient()
      client.removeChannel(subscription)
      subscription = null
      isListening.value = false
    }
    listeners.clear()
  }

  onUnmounted(() => stopListening())

  return {
    // STATE
    homepageData,
    isLoading,
    error,
    isListening,
    currentTenantId,

    // ACTIONS
    loadHomepageData,
    stopListening,
    subscribeToUpdates,
    updateHomepageData,
    toggleDarkMode,
    resetToDefaults,
    forceRefresh,
    clearCache,
    checkConnection,
    initializeHomepageData
  }
})
