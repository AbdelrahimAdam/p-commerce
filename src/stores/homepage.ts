// src/stores/homepage.ts
import { defineStore } from 'pinia'
import { ref, reactive, onUnmounted } from 'vue'
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase/config'
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
  source?: 'firebase' | 'cache' | 'default'
}

type ListenerCallback = (data: HomepageData) => void

export const useHomepageStore = defineStore('homepage', () => {
  const authStore = useAuthStore()

  // =================== DEFAULT DATA (removed default offer) ===================
  const defaultLocalData: HomepageData = {
    heroBanner: {
      imageUrl: '/images/banner.jpg',
      linkText: 'SHOP NOW',
      linkUrl: '/shop'
    },
    activeOffers: [], // <-- removed the default offer that caused 404
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

  let unsubscribe: (() => void) | null = null
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

  // =================== FIREBASE LISTENER (tenant‑specific) ===================
  const setupFirebaseListener = async (): Promise<void> => {
    // If no tenant, we cannot listen to Firestore (no document ID)
    if (!authStore.currentTenant) {
      console.warn('No tenant ID – cannot setup homepage listener')
      return
    }

    if (unsubscribe) return
    try {
      const homepageRef = doc(db, 'homepage', authStore.currentTenant)
      unsubscribe = onSnapshot(homepageRef, (docSnap) => {
        if (docSnap.exists()) {
          const firebaseData = docSnap.data() as HomepageData
          Object.assign(homepageData, { ...firebaseData, source: 'firebase' })
          saveToCache(homepageData)
          notifyListeners(homepageData)
          if (homepageData.settings?.isDarkMode) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
          error.value = ''
          isListening.value = true
        } else {
          // Document does not exist – we could optionally create it for admins,
          // but for public users we just keep default/cached data.
          console.log('Homepage document missing for tenant', authStore.currentTenant)
          isListening.value = true
        }
      }, (err) => {
        error.value = `Firebase error: ${err.message}`
        isListening.value = false
      })
    } catch (err: any) {
      error.value = 'Failed to setup Firebase listener'
    }
  }

  const initializeFirebaseData = async (): Promise<boolean> => {
    // This should only be called by admins, and only when tenant exists
    if (!authStore.currentTenant) {
      error.value = 'No tenant – cannot initialize homepage data'
      return false
    }

    try {
      checkPermission()
      const homepageRef = doc(db, 'homepage', authStore.currentTenant)
      await setDoc(homepageRef, {
        ...homepageData,
        tenantId: authStore.currentTenant,
        lastUpdated: new Date().toISOString(),
        source: 'firebase'
      })
      return true
    } catch (err: any) {
      error.value = 'Failed to initialize Firebase data: ' + err.message
      return false
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

      // Only attempt Firestore if tenant exists
      if (authStore.currentTenant) {
        await setupFirebaseListener()

        const homepageRef = doc(db, 'homepage', authStore.currentTenant)
        const docSnap = await getDoc(homepageRef)
        if (docSnap.exists()) {
          const firebaseData = docSnap.data() as HomepageData
          Object.assign(homepageData, { ...firebaseData, source: 'firebase' })
          saveToCache(homepageData)
          notifyListeners(homepageData)
        } else {
          // No document yet – keep cached/default
          saveToCache(homepageData)
        }
      } else {
        console.log('No tenant – using cached/default homepage data')
        // Ensure we still have data (cached or default)
        if (!cachedData) {
          Object.assign(homepageData, defaultLocalData)
          saveToCache(homepageData)
          notifyListeners(homepageData)
        }
      }
    } catch (err: any) {
      error.value = 'Failed to load homepage data'
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
    // Writes require both permission and a tenant
    if (!authStore.currentTenant) {
      throw new Error('No tenant – cannot update homepage')
    }

    try {
      checkPermission()
      isLoading.value = true

      const homepageRef = doc(db, 'homepage', authStore.currentTenant)
      const docSnap = await getDoc(homepageRef)
      const currentData = docSnap.exists() ? docSnap.data() as HomepageData : { ...homepageData }

      const newData: HomepageData = {
        ...currentData,
        ...updates,
        tenantId: authStore.currentTenant,
        lastUpdated: new Date().toISOString(),
        source: 'firebase'
      }

      await setDoc(homepageRef, newData, { merge: false })

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
    if (!authStore.currentTenant) {
      error.value = 'No tenant – cannot reset'
      return false
    }

    try {
      checkPermission()
      isLoading.value = true
      const resetData: HomepageData = {
        ...defaultLocalData,
        tenantId: authStore.currentTenant,
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
    if (!authStore.currentTenant) {
      return { connected: false }
    }

    try {
      const docSnap = await getDoc(doc(db, 'homepage', authStore.currentTenant))
      return {
        connected: true,
        lastUpdate: docSnap.exists() ? (docSnap.data() as HomepageData).lastUpdated : undefined
      }
    } catch (err) {
      return { connected: false }
    }
  }

  const stopListening = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
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