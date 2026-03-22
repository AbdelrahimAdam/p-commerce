// stores/homepage.ts – SUPABASE VERSION
import { defineStore } from 'pinia'
import { ref, reactive, onUnmounted } from 'vue'
import { supabase } from '@/supabase/client'
import { useAuthStore } from '@/stores/auth'

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
  source?: 'firebase' | 'cache' | 'default'  // kept for compatibility
}

type ListenerCallback = (data: HomepageData) => void

export const useHomepageStore = defineStore('homepage', () => {
  const authStore = useAuthStore()

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
    tenantId: authStore.currentTenant ?? undefined,
    lastUpdated: new Date().toISOString(),
    source: 'default'
  }

  // =================== STATE ===================
  const homepageData = reactive<HomepageData>({ ...defaultLocalData })
  const isLoading = ref(false)
  const error = ref<string>('')

  let subscription: ReturnType<typeof supabase.channel> | null = null
  const isListening = ref(false)
  const listeners = new Set<ListenerCallback>()

  const CACHE_KEY = 'homepage_cache_v2'
  const CACHE_TIMESTAMP_KEY = 'homepage_cache_timestamp_v2'
  const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

  // =================== HELPERS ===================
  const checkPermission = (): boolean => {
    if (!authStore.isAdmin) {
      throw new Error('Permission denied: Only admin can modify homepage')
    }
    return true
  }

  const getCachedData = (): HomepageData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)
      if (cached && timestamp) {
        const cacheAge = Date.now() - parseInt(timestamp)
        if (cacheAge < CACHE_DURATION) return JSON.parse(cached)
        localStorage.removeItem(CACHE_KEY)
        localStorage.removeItem(CACHE_TIMESTAMP_KEY)
      }
    } catch (err) { /* ignore */ }
    return null
  }

  const saveToCache = (data: HomepageData) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ...data, source: 'cache' }))
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
    } catch (err) { /* ignore */ }
  }

  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY)
    localStorage.removeItem(CACHE_TIMESTAMP_KEY)
  }

  const notifyListeners = (data: HomepageData) => {
    listeners.forEach(cb => cb(data))
  }

  // =================== SUPABASE REAL‑TIME LISTENER ===================
  const setupSupabaseListener = async (): Promise<void> => {
    const tenantId = authStore.currentTenant
    if (!tenantId) {
      console.warn('No tenant ID – cannot setup homepage listener')
      return
    }

    if (subscription) return

    try {
      // Create a channel for this tenant's homepage
      const channel = supabase
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
              // Document deleted – we could fallback to default, but we'll keep cached data
              console.log('Homepage document deleted for tenant', tenantId)
              const cached = getCachedData()
              if (cached) {
                Object.assign(homepageData, cached)
                notifyListeners(cached)
              } else {
                Object.assign(homepageData, defaultLocalData)
                notifyListeners(defaultLocalData)
              }
            } else if (payload.new) {
              const data = payload.new as any
              const sections = data.sections as HomepageData
              if (sections) {
                Object.assign(homepageData, { ...sections, source: 'firebase' })
                saveToCache(homepageData)
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
            console.error('Homepage channel error')
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
      if (forceRefresh) clearCache()

      const cachedData = getCachedData()
      if (cachedData && !forceRefresh) {
        Object.assign(homepageData, cachedData)
        notifyListeners(cachedData)
      }

      const tenantId = authStore.currentTenant
      if (!tenantId) {
        console.log('No tenant – using cached/default homepage data')
        if (!cachedData) {
          Object.assign(homepageData, defaultLocalData)
          saveToCache(homepageData)
          notifyListeners(homepageData)
        }
        return
      }

      // Fetch from Supabase
      const { data, error: fetchError } = await supabase
        .from('homepage')
        .select('sections')
        .eq('tenant_id', tenantId)
        .maybeSingle()

      if (fetchError) throw fetchError

      if (data?.sections) {
        const sections = data.sections as HomepageData
        Object.assign(homepageData, { ...sections, source: 'firebase' })
        saveToCache(homepageData)
        notifyListeners(homepageData)
      } else {
        // No document exists yet – keep cached/default
        if (!cachedData) {
          Object.assign(homepageData, defaultLocalData)
          saveToCache(homepageData)
          notifyListeners(homepageData)
        }
      }

      // Set up real‑time listener after fetching initial data
      await setupSupabaseListener()
    } catch (err: any) {
      error.value = 'Failed to load homepage data'
      console.error(err)
      const cachedData = getCachedData()
      if (cachedData) {
        Object.assign(homepageData, cachedData)
        notifyListeners(cachedData)
      }
    } finally {
      isLoading.value = false
    }
  }

  const updateHomepageData = async (updates: Partial<HomepageData>): Promise<boolean> => {
    const tenantId = authStore.currentTenant
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
        source: 'firebase'
      }

      // Upsert into Supabase
      const { error: upsertError } = await supabase
        .from('homepage')
        .upsert({
          tenant_id: tenantId,
          sections: newData,
          updated_at: new Date().toISOString()
        }, { onConflict: 'tenant_id' })

      if (upsertError) throw upsertError

      // Update local state
      Object.assign(homepageData, newData)
      clearCache()
      saveToCache(newData)
      notifyListeners(newData)

      return true
    } catch (err: any) {
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
    const tenantId = authStore.currentTenant
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
    const tenantId = authStore.currentTenant
    if (!tenantId) {
      return { connected: false }
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('homepage')
        .select('updated_at')
        .eq('tenant_id', tenantId)
        .maybeSingle()

      if (fetchError) throw fetchError

      return {
        connected: true,
        lastUpdate: data?.updated_at
      }
    } catch (err) {
      return { connected: false }
    }
  }

  const initializeFirebaseData = async (): Promise<boolean> => {
    // This function name is kept for compatibility, but it's now Supabase.
    // It creates a default homepage document for the current tenant if not exists.
    const tenantId = authStore.currentTenant
    if (!tenantId) {
      error.value = 'No tenant – cannot initialize homepage data'
      return false
    }

    try {
      checkPermission()
      // Check if already exists
      const { data, error: fetchError } = await supabase
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

      const { error: insertError } = await supabase
        .from('homepage')
        .insert({
          tenant_id: tenantId,
          sections: defaultData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (insertError) throw insertError

      return true
    } catch (err: any) {
      error.value = 'Failed to initialize homepage data: ' + err.message
      return false
    }
  }

  const stopListening = () => {
    if (subscription) {
      supabase.removeChannel(subscription)
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
    initializeFirebaseData
  }
})
