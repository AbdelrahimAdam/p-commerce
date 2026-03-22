/// <reference types="vite/client" />

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/styles/main.css'

import { createI18n } from 'vue-i18n'
import { useTenantStore } from '@/stores/tenant'

// List of public paths that don't need authentication
const PUBLIC_PATHS = [
  '/',
  '/shop',
  '/offers',
  '/offer',
  '/brands',
  '/brand',
  '/cart',
  '/checkout',
  '/contact',
  '/about',
  '/collections',
  '/product',
  '/category',
  '/wishlist',
  '/admin/login'
]

const isPublicPath = (path: string): boolean => {
  return PUBLIC_PATHS.some(publicPath => 
    path === publicPath || path.startsWith(publicPath + '/')
  )
}

// ========================= TRANSLATIONS =========================
// ⚠️ IMPORTANT: Replace the placeholder objects below with your actual
// translations from the original Firebase-based main.ts file.
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      // Paste your English translations here
    },
    ar: {
      // Paste your Arabic translations here
    }
  }
})
// =================================================================

// Helper to ensure locale is one of the supported values
function isValidLocale(lang: string): lang is 'en' | 'ar' {
  return lang === 'en' || lang === 'ar'
}

// Create app
const vueApp = createApp(App)
const pinia = createPinia()

// Use plugins
vueApp.use(pinia)
vueApp.use(router)
vueApp.use(i18n)

// Mount app
vueApp.mount('#app')

console.log('🚀 Luxury Perfume Store v1.0.0 (Supabase)')
console.log('🌐 Languages: English & Arabic')

// Start tenant resolution immediately (non‑blocking)
const tenantStore = useTenantStore()
tenantStore.resolveTenantFromDomain().catch(err => {
  console.warn('Tenant resolution failed, will retry later:', err)
})

// Initialize stores after app is mounted
setTimeout(async () => {
  try {
    console.log('🏪 Starting store initialization...')

    // Wait for tenant to be resolved (or timeout after 5 seconds)
    await Promise.race([
      tenantStore.whenReady(),
      new Promise(resolve => setTimeout(resolve, 5000))
    ])

    if (tenantStore.error) {
      console.error('❌ Tenant resolution failed:', tenantStore.error)
      // Optionally redirect to a "tenant not found" page
      // router.replace('/tenant-not-found')
      // return
    } else if (tenantStore.tenantId) {
      console.log(`🌍 Tenant resolved: ${tenantStore.tenantId} (${tenantStore.tenantDomain})`)
    } else {
      console.warn('⚠️ No tenant resolved. Data may not load.')
    }

    // Check if current page is public
    const currentPath = window.location.pathname
    const isPublic = isPublicPath(currentPath)

    console.log(`📍 Current path: ${currentPath} (${isPublic ? 'Public' : 'Protected'})`)

    // Import stores - Use dynamic imports to avoid circular dependencies
    const { useAuthStore } = await import('@/stores/auth')
    const { useBrandsStore } = await import('@/stores/brands')
    const { useProductsStore } = await import('@/stores/products')
    const { useHomepageStore } = await import('@/stores/homepage')
    const { useCartStore } = await import('@/stores/cart')
    const { useLanguageStore } = await import('@/stores/language')

    // Get stores
    const authStore = useAuthStore()
    const brandsStore = useBrandsStore()
    const productsStore = useProductsStore()
    const homepageStore = useHomepageStore()
    const cartStore = useCartStore()
    const languageStore = useLanguageStore()

    console.log('🔄 Initializing language store...')
    await languageStore.initialize()

    // ✅ Safely set i18n locale to the store's current language (only if valid)
    const storedLang = languageStore.currentLanguage
    if (isValidLocale(storedLang)) {
      i18n.global.locale.value = storedLang
    } else {
      console.warn(`Unsupported language: ${storedLang}, falling back to 'en'`)
      i18n.global.locale.value = 'en'
    }

    // Only check auth on protected pages
    if (!isPublic) {
      console.log('🔐 Protected page - checking authentication...')
      await authStore.checkAuth()
    } else {
      console.log('🌍 Public page - skipping authentication')
      authStore.resetAuthState?.()
    }

    console.log('📊 Initializing data stores...')
    // Initialize data stores in parallel
    await Promise.all([
      brandsStore.initialize?.(),
      productsStore.initialize?.(),
      homepageStore.loadHomepageData?.()
    ])

    console.log('🛒 Restoring cart...')
    cartStore.restoreCart?.()

    // Log initialization status
    console.log('✅ All stores initialized successfully')
    console.log(`  👤 Auth: ${authStore.isAuthenticated ? 'Logged in' : 'Guest'}`)
    console.log(`  📁 Brands: ${brandsStore.brands?.length || 0}`)
    console.log(`  📦 Products: ${productsStore.products?.length || 0}`)
    console.log(`  🛒 Cart Items: ${cartStore.items?.length || 0}`)
    console.log(`  🌐 Language: ${languageStore.currentLanguage}`)

    // Check if we need sample data (only in development)
    // Note: The sample data script was Firebase-based – you may remove or adapt it.
    if ((import.meta as any).env.DEV) {
      const brandsCount = brandsStore.brands?.length || 0
      const productsCount = productsStore.products?.length || 0

      if (brandsCount === 0 || productsCount === 0) {
        console.log('\n⚠️  Database appears empty')
        console.log('💡 You may want to insert sample data manually in Supabase.')
      }
    }

  } catch (error) {
    console.error('❌ Error initializing stores:', error)

    // Try recovery
    try {
      console.log('🔄 Attempting recovery...')
      const currentPath = window.location.pathname
      const isPublic = isPublicPath(currentPath)

      const { useAuthStore } = await import('@/stores/auth')
      const { useBrandsStore } = await import('@/stores/brands')
      const { useProductsStore } = await import('@/stores/products')

      const authStore = useAuthStore()
      const brandsStore = useBrandsStore()
      const productsStore = useProductsStore()

      if (!isPublic) {
        try {
          await authStore.checkAuth()
        } catch (e) {
          console.log('⚠️  Auth recovery failed')
        }
      }

      await Promise.all([
        brandsStore.initialize?.().catch(() => {}),
        productsStore.initialize?.().catch(() => {})
      ])

    } catch (recoveryError) {
      console.error('❌ Recovery failed')
    }
  }
}, 1000)

// Global error handlers
window.addEventListener('error', (event) => {
  console.error('🌍 Global error:', event.message)
})

window.addEventListener('unhandledrejection', (_event) => {
  console.error('🌍 Unhandled promise rejection')
})

vueApp.config.errorHandler = (err) => {
  console.error('🧩 Vue error:', err)
}

// Development mode
if ((import.meta as any).env.DEV) {
  console.log('🔧 Development mode enabled')

  // Expose stores for debugging on protected pages
  setTimeout(async () => {
    try {
      const currentPath = window.location.pathname
      const isPublic = isPublicPath(currentPath)

      if (!isPublic) {
        const { useAuthStore } = await import('@/stores/auth')
        const { useBrandsStore } = await import('@/stores/brands')
        const { useProductsStore } = await import('@/stores/products')

        ;(window as any).stores = {
          auth: useAuthStore(),
          brands: useBrandsStore(),
          products: useProductsStore()
        }
      }
    } catch (error) {
      // Silently fail
    }
  }, 2000)
}
