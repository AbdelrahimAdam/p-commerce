import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// List of public routes that don't require authentication
const publicRoutes = [
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
  'customer-login',        // <-- ADD THIS (login page)
  'admin-login',           // <-- ADD THIS (admin login page)
  'forgot-password',       // <-- ADD THIS
  'reset-password'         // <-- ADD THIS
]

// List of admin routes that require authentication
const adminRoutes = [
  'admin-dashboard',
  'admin-products',
  'admin-product-new',
  'admin-product-edit',
  'admin-orders',
  'admin-customers',
  'admin-brands',
  'admin-brand-new',
  'admin-brand-edit',
  'admin-profile',
  'admin-settings',
  'admin-homepage',
  'admin-homepage-preview',
  'admin-admins',
  'admin-superadmin'
]

// Auth guard for protected routes (requires authentication)
export const authGuard = async (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()

  console.log('🛡️ Auth guard triggered for:', to.path)
  console.log('Route name:', to.name)

  // Check if this is a public route
  if (publicRoutes.includes(to.name as string)) {
    console.log('🌍 Public route - allowing access without authentication')
    return next()
  }

  // Check if this is an admin route
  if (adminRoutes.includes(to.name as string)) {
    console.log('🔐 Admin route - checking authentication')

    // Check authentication status
    if (!authStore.isAuthenticated) {
      console.log('🔐 Not authenticated, checking auth...')
      await authStore.checkAuth()
    }

    // If still not authenticated, redirect to login
    if (!authStore.isAuthenticated) {
      console.log('🚫 Not authenticated, redirecting to login')
      next({
        name: 'admin-login',
        query: {
          redirect: to.fullPath,
          error: 'authentication_required'
        }
      })
      return
    }

    // Check if route requires admin access
    if (to.meta.requiresAdmin && !authStore.isAdmin && !authStore.isSuperAdmin) {
      console.log('🚫 Admin access required but user is not admin')
      next({
        name: 'admin-login',
        query: {
          redirect: to.fullPath,
          error: 'admin_access_required'
        }
      })
      return
    }

    // Check if route requires super admin access
    if (to.meta.requiresSuperAdmin && !authStore.isSuperAdmin) {
      console.log('🚫 Super admin access required but user is not super admin')
      next({
        name: 'admin-dashboard',
        query: {
          error: 'superadmin_required'
        }
      })
      return
    }

    console.log('✅ Access granted to admin route:', to.path)
    return next()
  }

  // For any other routes (like 404), allow access
  console.log('🌍 Other route - allowing access')
  next()
}

// Guest guard for login page (prevent access if already logged in)
export const guestGuard = async (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()

  console.log('🛡️ Guest guard triggered for:', to.path)

  // Check current authentication status
  if (!authStore.isAuthenticated) {
    await authStore.checkAuth()
  }

  // If already authenticated as admin or super admin, redirect to dashboard
  if (authStore.isAuthenticated && (authStore.isAdmin || authStore.isSuperAdmin)) {
    console.log('✅ Already logged in as admin, redirecting to dashboard')
    next({ name: 'admin-dashboard' })
  } else {
    console.log('👤 Not logged in or not admin, allowing access to login')
    next()
  }
}

// Admin guard (super-admin only) - kept for backward compatibility
export const adminGuard = async (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()

  console.log('🛡️ Admin guard triggered for:', to.path)

  if (!authStore.isAuthenticated) {
    await authStore.checkAuth()
  }

  if (authStore.isAuthenticated && authStore.isSuperAdmin) {
    console.log('✅ Super-admin access granted')
    next()
  } else {
    console.log('🚫 Super-admin access denied')
    next({
      name: 'admin-login',
      query: { 
        redirect: to.fullPath,
        error: 'superadmin_required'
      }
    })
  }
}

// SEO guard to update meta tags (should run for ALL routes)
export const seoGuard = (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  updateMetaTags(to)
  next()
}

// Helper functions for meta tags
const updateMetaTags = (to: RouteLocationNormalized) => {
  const meta = to.meta
  const title = getLocalizedTitle(meta)
  const description = getLocalizedDescription(meta)

  document.title = title

  let metaDescription = document.querySelector('meta[name="description"]')
  if (!metaDescription) {
    metaDescription = document.createElement('meta')
    metaDescription.setAttribute('name', 'description')
    document.head.appendChild(metaDescription)
  }
  metaDescription.setAttribute('content', description)

  updateOgTag('og:title', title)
  updateOgTag('og:description', description)
  updateOgTag('og:url', window.location.href)
}

const updateOgTag = (property: string, content: string) => {
  let tag = document.querySelector(`meta[property="${property}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('property', property)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

const getLocalizedTitle = (meta: any): string => {
  const title = meta?.title
  if (!title) return 'Luxury Perfume Store'
  if (typeof title === 'string') return title
  const browserLang = navigator.language.startsWith('ar') ? 'ar' : 'en'
  return title[browserLang] || title.en || 'Luxury Perfume Store'
}

const getLocalizedDescription = (meta: any): string => {
  const description = meta?.description
  if (!description) return 'Luxury perfume store with exclusive fragrances collection'
  if (typeof description === 'string') return description
  const browserLang = navigator.language.startsWith('ar') ? 'ar' : 'en'
  return description[browserLang] || description.en || 'Luxury perfume store with exclusive fragrances collection'
}