import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import { seoGuard } from './guards'
import { useAuthStore } from '@/stores/auth'

// List of public route names that don't need any authentication checks
const publicRouteNames = [
  'home',
  'shop',
  'category',
  'brands',
  'brand',
  'collections',
  'product',
  'offers',
  'offer',
  'cart',
  'checkout',
  'contact',
  'about',
  'wishlist',
  'not-found',
  'register-company',
  'customer-login',      // Login page route name
  'admin-login',         // Admin login route name
  'forgot-password',     // Forgot password page
  'reset-password'       // Reset password page
]

// List of public path patterns (for fallback)
const publicPathPatterns = [
  '/',
  '/shop',
  '/category',
  '/brands',
  '/brand',
  '/collections',
  '/product',
  '/offers',
  '/offer',
  '/cart',
  '/checkout',
  '/contact',
  '/about',
  '/wishlist',
  '/login',              // Customer login path
  '/admin/login',        // Admin login path
  '/register-company',   // Company registration
  '/forgot-password',    // Forgot password
  '/reset-password'      // Reset password
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition || { top: 0 }
  }
})

// Apply SEO guard first for all routes
router.beforeEach(seoGuard)

// Main authentication & admin guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  console.log('📍 Navigation:', {
    from: from.fullPath,
    to: to.fullPath,
    name: to.name,
    path: to.path,
    matched: to.matched.length
  })

  // ============================================
  // 🟢 CRITICAL FIX: DIRECT PATH CHECK FOR WISHLIST
  // ============================================
  if (to.path === '/wishlist') {
    console.log('🌍 DIRECT WISHLIST PATH MATCH - ALLOWING ACCESS')
    return next()
  }

  // ============================================
  // 🟢 CHECK BY ROUTE NAME
  // ============================================
  if (to.name && publicRouteNames.includes(to.name as string)) {
    console.log('🌍 Public route detected by name:', to.name)
    return next()
  }

  // ============================================
  // 🟢 CHECK BY PATH PATTERN
  // ============================================
  const isPublicPath = publicPathPatterns.some(pattern => 
    to.path === pattern || to.path.startsWith(pattern + '/')
  )

  if (isPublicPath) {
    console.log('🌍 Public route detected by path pattern:', to.path)
    return next()
  }

  // ============================================
  // 🔐 PROTECTED ROUTES - REQUIRE AUTHENTICATION
  // ============================================

  // Check authentication status
  if (!authStore.isAuthenticated) {
    console.log('🔐 Checking authentication status...')
    await authStore.checkAuth()
  }

  console.log('🔍 Auth state:', {
    isAuthenticated: authStore.isAuthenticated,
    isAdmin: authStore.isAdmin,
    isSuperAdmin: authStore.isSuperAdmin
  })

  // Admin login page (special case)
  if (to.name === 'admin-login') {
    if (authStore.isAuthenticated && authStore.isSuperAdmin) {
      return next({ name: 'admin-dashboard' })
    }
    return next()
  }

  // Super-admin routes
  if (to.meta.requiresSuperAdmin) {
    if (!authStore.isAuthenticated || !authStore.isSuperAdmin) {
      return next({
        name: 'admin-login',
        query: { redirect: to.fullPath, error: 'superadmin_required' }
      })
    }
    return next()
  }

  // Admin routes
  if (to.meta.requiresAdmin) {
    if (!authStore.isAuthenticated || (!authStore.isAdmin && !authStore.isSuperAdmin)) {
      return next({
        name: 'admin-login',
        query: { redirect: to.fullPath, error: 'admin_required' }
      })
    }
    return next()
  }

  // General authenticated routes (like /orders)
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      console.log('🚫 Authentication required for:', to.path)
      return next({
        name: 'admin-login',
        query: { redirect: to.fullPath }
      })
    }
    return next()
  }

  // If route is not found, show 404
  if (to.matched.length === 0) {
    console.log('⚠️ Route not found - showing 404')
    return next()
  }

  // Default: allow access
  console.log('✅ Access granted to:', to.path)
  next()
})

router.afterEach((to, _from) => {
  console.log('✅ Navigation completed:', to.fullPath)
})

// Handle navigation errors
router.onError((error) => {
  console.error('🚨 Router error:', error)
})

export default router
export { useAuthStore }