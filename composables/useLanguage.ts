// src/composables/useLanguage.ts
import { ref, computed, onMounted, watch, readonly } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import type { Language } from '@/types'

// Supported languages with their metadata
const LANGUAGE_CONFIG: Record<Language, {
  name: string
  direction: 'ltr' | 'rtl'
  locale: string
  fontFamily: string
  flag: string
}> = {
  en: {
    name: 'English',
    direction: 'ltr',
    locale: 'en-US',
    fontFamily: "'Inter', 'Playfair Display', system-ui, -apple-system, sans-serif",
    flag: '🇺🇸'
  },
  ar: {
    name: 'العربية',
    direction: 'rtl',
    locale: 'ar-SA',
    fontFamily: "'IBM Plex Arabic', 'Cairo', system-ui, sans-serif",
    flag: '🇸🇦'
  }
}

// Cache for document elements to avoid repeated DOM queries
let cachedHtmlElement: HTMLElement | null = null
let cachedBodyElement: HTMLElement | null = null

// Helper to get HTML element (with caching)
const getHtmlElement = (): HTMLElement => {
  if (!cachedHtmlElement && typeof document !== 'undefined') {
    cachedHtmlElement = document.documentElement
  }
  return cachedHtmlElement!
}

// Helper to get Body element (with caching)
const getBodyElement = (): HTMLElement => {
  if (!cachedBodyElement && typeof document !== 'undefined') {
    cachedBodyElement = document.body
  }
  return cachedBodyElement!
}

export const useLanguage = () => {
  // Current language state (using useLocalStorage for persistence)
  const currentLanguage = useLocalStorage<Language>('luxury_perfume_language', 'en')
  
  // Reactive language data (computed for performance)
  const currentConfig = computed(() => LANGUAGE_CONFIG[currentLanguage.value])
  
  const isRTL = computed(() => currentConfig.value.direction === 'rtl')
  const fontFamily = computed(() => currentConfig.value.fontFamily)
  const direction = computed(() => currentConfig.value.direction)
  const locale = computed(() => currentConfig.value.locale)

  // Batch update document attributes (performance optimized)
  const updateDocumentAttributes = () => {
    if (typeof document === 'undefined') return
    
    const html = getHtmlElement()
    const body = getBodyElement()
    const config = currentConfig.value
    
    // Use requestAnimationFrame to batch DOM updates
    requestAnimationFrame(() => {
      html.lang = currentLanguage.value
      html.dir = config.direction
      body.style.fontFamily = config.fontFamily
      
      // Update class for CSS targeting
      if (config.direction === 'rtl') {
        html.classList.add('rtl')
        html.classList.remove('ltr')
      } else {
        html.classList.add('ltr')
        html.classList.remove('rtl')
      }
    })
  }

  // Set language (with performance optimization)
  const setLanguage = (lang: Language) => {
    if (lang === currentLanguage.value) return // Skip if same
    currentLanguage.value = lang
    updateDocumentAttributes()
  }

  // Toggle language (most common action)
  const toggleLanguage = () => {
    setLanguage(currentLanguage.value === 'en' ? 'ar' : 'en')
  }

  // Detect browser language (cached to avoid repeated detection)
  let detectedBrowserLang: Language | null = null
  const detectBrowserLanguage = (): Language => {
    if (detectedBrowserLang) return detectedBrowserLang
    if (typeof navigator === 'undefined') return 'en'
    
    const browserLang = navigator.language?.toLowerCase() || ''
    detectedBrowserLang = browserLang.startsWith('ar') ? 'ar' : 'en'
    return detectedBrowserLang
  }

  // Initialize (optimized with single DOM update)
  const initialize = () => {
    if (typeof document === 'undefined') return
    
    // Use saved language or detect browser language
    if (!currentLanguage.value) {
      currentLanguage.value = detectBrowserLanguage()
    }
    
    updateDocumentAttributes()
  }

  // Translation function with memoization for repeated translations
  const translationCache = new Map<string, string>()
  const t = (text: { en: string; ar: string } | string): string => {
    if (typeof text === 'string') return text
    
    const cacheKey = `${text.en}|${text.ar}|${currentLanguage.value}`
    const cached = translationCache.get(cacheKey)
    if (cached) return cached
    
    const result = text[currentLanguage.value] || text.en || ''
    translationCache.set(cacheKey, result)
    
    // Limit cache size to prevent memory leaks
    if (translationCache.size > 1000) {
      const firstKey = translationCache.keys().next().value
      translationCache.delete(firstKey)
    }
    
    return result
  }

  // Format date with caching for date formatter
  let dateFormatterCache: Record<string, Intl.DateTimeFormat> = {}
  const getDateFormatter = (lang: Language) => {
    if (!dateFormatterCache[lang]) {
      dateFormatterCache[lang] = new Intl.DateTimeFormat(LANGUAGE_CONFIG[lang].locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
    return dateFormatterCache[lang]
  }

  const formatDate = (date: Date | string | number): string => {
    if (!date) return ''
    const dateObj = date instanceof Date ? date : new Date(date)
    if (isNaN(dateObj.getTime())) return ''
    return getDateFormatter(currentLanguage.value).format(dateObj)
  }

  // Format number with caching
  let numberFormatterCache: Record<string, Intl.NumberFormat> = {}
  const getNumberFormatter = (lang: Language) => {
    if (!numberFormatterCache[lang]) {
      numberFormatterCache[lang] = new Intl.NumberFormat(LANGUAGE_CONFIG[lang].locale)
    }
    return numberFormatterCache[lang]
  }

  const formatNumber = (number: number): string => {
    if (isNaN(number)) return '0'
    return getNumberFormatter(currentLanguage.value).format(number)
  }

  // Format currency (EGP)
  const formatCurrency = (amount: number): string => {
    if (isNaN(amount)) return '0 EGP'
    const formatted = formatNumber(amount)
    return currentLanguage.value === 'ar' 
      ? `${formatted} ج.م`
      : `EGP ${formatted}`
  }

  // Watch for language changes (debounced for performance)
  let updateTimeout: ReturnType<typeof setTimeout> | null = null
  watch(currentLanguage, () => {
    if (updateTimeout) clearTimeout(updateTimeout)
    updateTimeout = setTimeout(() => {
      updateDocumentAttributes()
      // Clear formatters cache when language changes
      dateFormatterCache = {}
      numberFormatterCache = {}
      translationCache.clear()
    }, 16) // ~1 frame for batching
  })

  // Initialize on mount (with cleanup)
  onMounted(() => {
    initialize()
    
    // Cleanup on unmount
    return () => {
      if (updateTimeout) clearTimeout(updateTimeout)
      // Clear caches
      dateFormatterCache = {}
      numberFormatterCache = {}
      translationCache.clear()
    }
  })

  // Expose readonly state for better performance
  return {
    // State (readonly to prevent direct mutations)
    currentLanguage: readonly(currentLanguage),
    isRTL: readonly(isRTL),
    fontFamily: readonly(fontFamily),
    direction: readonly(direction),
    locale: readonly(locale),
    
    // Actions
    setLanguage,
    toggleLanguage,
    t,
    formatDate,
    formatNumber,
    formatCurrency,
    initialize
  }
}

// Language switcher composable (optimized for components)
export const useLanguageSwitcher = () => {
  const language = useLanguage()
  
  // Language options (static, not reactive)
  const languageOptions = [
    { value: 'en', label: 'English', flag: '🇺🇸' },
    { value: 'ar', label: 'العربية', flag: '🇸🇦' }
  ] as const

  // Current option computed (optimized)
  const currentLanguageOption = computed(() => 
    languageOptions.find(option => option.value === language.currentLanguage.value)
  )

  return {
    ...language,
    languageOptions,
    currentLanguageOption
  }
}

// Helper composable for text direction utilities
export const useTextDirection = () => {
  const { direction, isRTL } = useLanguage()
  
  // Helper to conditionally apply RTL-aware styles
  const withDirection = <T>(rtlValue: T, ltrValue: T): T => {
    return isRTL.value ? rtlValue : ltrValue
  }
  
  // Helper for margin/padding utilities
  const getSpacing = (start: number, end: number): { start: number; end: number } => {
    return isRTL.value 
      ? { start: end, end: start }
      : { start, end }
  }
  
  return {
    direction,
    isRTL,
    withDirection,
    getSpacing
  }
}