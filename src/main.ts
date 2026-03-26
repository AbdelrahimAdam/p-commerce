/// <reference types="vite/client" />

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/styles/main.css'

import { createI18n } from 'vue-i18n'
import { useTenantStore } from '@/stores/tenant'

// ========================= TRANSLATIONS =========================
// Replace the placeholder objects below with your actual translations.
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

// Helper to check if current domain is the root domain
function isRootDomain(): boolean {
  const hostname = window.location.hostname
  const rootDomain = import.meta.env.VITE_ROOT_DOMAIN || 'localhost:5173'
  return hostname === rootDomain || hostname === 'localhost'
}

// Create the Vue app
const vueApp = createApp(App)
const pinia = createPinia()

vueApp.use(pinia)
vueApp.use(router)
vueApp.use(i18n)

vueApp.mount('#app')

console.log('🚀 Luxury Perfume Store v1.0.0 (Supabase)')
console.log('🌐 Languages: English & Arabic')

// ------------------------------------------------------------------
// 1️⃣ Initialise stores in the correct order
// ------------------------------------------------------------------
;(async () => {
  try {
    // ----- Step 1: Check if we're on root domain -----
    const isRoot = isRootDomain()
    
    if (isRoot) {
      console.log('🏠 Root domain detected - skipping tenant resolution for landing page')
      // For root domain, we don't need tenant resolution
      // Just mark tenant as initialized so other stores don't wait
      const tenantStore = useTenantStore()
      tenantStore.setIsInitialized(true)
    } else {
      // ----- Step 1b: Resolve tenant (only for subdomains) -----
      console.log('🌍 Subdomain detected - resolving tenant...')
      const tenantStore = useTenantStore()
      await tenantStore.resolveTenantFromDomain()

      if (tenantStore.error) {
        console.error('❌ Tenant resolution failed:', tenantStore.error)
        // Optionally redirect to a "tenant not found" page
        // router.replace('/tenant-not-found')
      } else if (tenantStore.tenantId) {
        console.log(`🌍 Tenant resolved: ${tenantStore.tenantId} (${tenantStore.tenantDomain})`)
      } else {
        console.warn('⚠️ No tenant resolved. Data may not load.')
      }
    }

    // ----- Step 2: Restore Supabase session (check if user is logged in) -----
    const { useAuthStore } = await import('@/stores/auth')
    const authStore = useAuthStore()
    await authStore.checkAuth()

    // ----- Step 3: Load other stores that depend on tenant and auth -----
    const { useBrandsStore } = await import('@/stores/brands')
    const { useProductsStore } = await import('@/stores/products')
    const { useHomepageStore } = await import('@/stores/homepage')
    const { useCartStore } = await import('@/stores/cart')
    const { useLanguageStore } = await import('@/stores/language')

    const brandsStore = useBrandsStore()
    const productsStore = useProductsStore()
    const homepageStore = useHomepageStore()
    const cartStore = useCartStore()
    const languageStore = useLanguageStore()

    // Initialize language store (this also sets i18n locale)
    await languageStore.initialize()

    // Set i18n locale
    const storedLang = languageStore.currentLanguage
    if (isValidLocale(storedLang)) {
      i18n.global.locale.value = storedLang
    } else {
      console.warn(`Unsupported language: ${storedLang}, falling back to 'en'`)
      i18n.global.locale.value = 'en'
    }

    // Only load data stores if we're on a subdomain (tenant exists)
    if (!isRoot) {
      // Initialize data stores in parallel (these depend on tenant)
      await Promise.all([
        brandsStore.initialize?.(),
        productsStore.initialize?.(),
        homepageStore.loadHomepageData?.()
      ])
    } else {
      console.log('🏠 Root domain - skipping data store initialization (landing page)')
    }

    // Restore cart (depends on auth to sync with server) - works for both root and subdomains
    cartStore.restoreCart?.()

    // ----- Final status -----
    console.log('✅ All stores initialized successfully')
    if (!isRoot) {
      console.log(`  📁 Brands: ${brandsStore.brands?.length || 0}`)
      console.log(`  📦 Products: ${productsStore.products?.length || 0}`)
    }
    console.log(`  👤 Auth: ${authStore.isAuthenticated ? 'Logged in' : 'Guest'}`)
    console.log(`  🛒 Cart Items: ${cartStore.items?.length || 0}`)
    console.log(`  🌐 Language: ${languageStore.currentLanguage}`)

    // (Optional) Sample data hint for development
    if (import.meta.env.DEV && !isRoot) {
      const brandsCount = brandsStore.brands?.length || 0
      const productsCount = productsStore.products?.length || 0
      if (brandsCount === 0 || productsCount === 0) {
        console.log('\n⚠️  Database appears empty')
        console.log('💡 You may want to insert sample data manually in Supabase.')
      }
    }
  } catch (err) {
    console.error('❌ Fatal error during initialisation:', err)
  }
})()

// ------------------------------------------------------------------
// Global error handlers (unchanged)
// ------------------------------------------------------------------
window.addEventListener('error', (event) => {
  console.error('🌍 Global error:', event.message)
})

window.addEventListener('unhandledrejection', (_event) => {
  console.error('🌍 Unhandled promise rejection')
})

vueApp.config.errorHandler = (err) => {
  console.error('🧩 Vue error:', err)
}

// Development helpers (unchanged)
if (import.meta.env.DEV) {
  console.log('🔧 Development mode enabled')
  setTimeout(async () => {
    try {
      const { useAuthStore } = await import('@/stores/auth')
      const { useBrandsStore } = await import('@/stores/brands')
      const { useProductsStore } = await import('@/stores/products')
      ;(window as any).stores = {
        auth: useAuthStore(),
        brands: useBrandsStore(),
        products: useProductsStore()
      }
    } catch (error) {
      // Silently fail
    }
  }, 2000)
}