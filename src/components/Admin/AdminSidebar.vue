<template>
  <aside class="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white z-40 transition-transform duration-300"
         :class="{ '-translate-x-full': !isSidebarOpen && isMobile }"
         @click="emit('close')">
    <!-- Logo -->
    <div class="p-6 border-b border-gray-800">
      <div class="flex items-center space-x-3" :class="{ 'space-x-reverse': isRTL }">
        <div class="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center">
          <svg class="w-6 h-6 text-black" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div>
          <h2 class="text-lg font-display-en font-bold">{{ t('Admin') }}</h2>
          <p class="text-xs text-gray-400">{{ t('Luxury Perfume Store') }}</p>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="p-4 space-y-1 overflow-y-auto" style="height: calc(100vh - 180px)">
      <!-- Main Navigation -->
      <div class="space-y-1">
        <router-link
          to="/admin"
          class="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors"
          :class="[
            $route.path === '/admin' || $route.path === '/admin/dashboard'
              ? 'bg-primary-500 text-white'
              : 'text-gray-300 hover:bg-gray-800',
            { 'space-x-reverse': isRTL }
          ]"
          @click="handleNavigation"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          <span>{{ t('Dashboard') }}</span>
        </router-link>

        <router-link
          to="/admin/products"
          class="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors"
          :class="[
            $route.path.startsWith('/admin/products')
              ? 'bg-primary-500 text-white'
              : 'text-gray-300 hover:bg-gray-800',
            { 'space-x-reverse': isRTL }
          ]"
          @click="handleNavigation"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
          </svg>
          <span>{{ t('Products') }}</span>
        </router-link>

        <router-link
          to="/admin/orders"
          class="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors"
          :class="[
            $route.path.startsWith('/admin/orders')
              ? 'bg-primary-500 text-white'
              : 'text-gray-300 hover:bg-gray-800',
            { 'space-x-reverse': isRTL }
          ]"
          @click="handleNavigation"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>{{ t('Orders') }}</span>
        </router-link>

        <router-link
          to="/admin/customers"
          class="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors"
          :class="[
            $route.path.startsWith('/admin/customers')
              ? 'bg-primary-500 text-white'
              : 'text-gray-300 hover:bg-gray-800',
            { 'space-x-reverse': isRTL }
          ]"
          @click="handleNavigation"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
          <span>{{ t('Customers') }}</span>
        </router-link>
      </div>

      <!-- Store Management (All Admins) -->
      <div class="pt-4 border-t border-gray-800">
        <p class="px-4 py-2 text-xs text-gray-500 uppercase tracking-wider">
          {{ t('Store Management') }}
        </p>
        
        <router-link
          to="/admin/brands"
          class="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors"
          :class="[
            $route.path.startsWith('/admin/brands')
              ? 'bg-green-500 text-white'
              : 'text-gray-300 hover:bg-gray-800',
            { 'space-x-reverse': isRTL }
          ]"
          @click="handleNavigation"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
          <span>{{ t('Brands') }}</span>
        </router-link>

        <router-link
          to="/admin/profile"
          class="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors"
          :class="[
            $route.path.startsWith('/admin/profile')
              ? 'bg-blue-500 text-white'
              : 'text-gray-300 hover:bg-gray-800',
            { 'space-x-reverse': isRTL }
          ]"
          @click="handleNavigation"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
          <span>{{ t('Profile') }}</span>
        </router-link>
      </div>

      <!-- Super Admin Features -->
      <div v-if="isSuperAdmin" class="pt-4 border-t border-gray-800">
        <p class="px-4 py-2 text-xs text-gray-500 uppercase tracking-wider">
          {{ t('Super Admin') }}
        </p>
        
        <router-link
          to="/admin/homepage"
          class="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors"
          :class="[
            $route.path.startsWith('/admin/homepage')
              ? 'bg-yellow-500 text-white'
              : 'text-gray-300 hover:bg-gray-800',
            { 'space-x-reverse': isRTL }
          ]"
          @click="handleNavigation"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M9 21V9a4 4 0 014-4h2a4 4 0 014 4v12"/>
          </svg>
          <span>{{ t('Homepage Management') }}</span>
        </router-link>

        <router-link
          to="/admin/superadmin"
          class="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors"
          :class="[
            $route.path.startsWith('/admin/superadmin')
              ? 'bg-purple-500 text-white'
              : 'text-gray-300 hover:bg-gray-800',
            { 'space-x-reverse': isRTL }
          ]"
          @click="handleNavigation"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-4.5V3m0 0h-3m3 0h3"/>
          </svg>
          <span>{{ t('Super Admin Panel') }}</span>
        </router-link>

        <router-link
          to="/admin/settings"
          class="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors"
          :class="[
            $route.path.startsWith('/admin/settings')
              ? 'bg-indigo-500 text-white'
              : 'text-gray-300 hover:bg-gray-800',
            { 'space-x-reverse': isRTL }
          ]"
          @click="handleNavigation"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <span>{{ t('Settings') }}</span>
        </router-link>

        <router-link
          to="/admin/admins"
          class="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors"
          :class="[
            $route.path.startsWith('/admin/admins')
              ? 'bg-red-500 text-white'
              : 'text-gray-300 hover:bg-gray-800',
            { 'space-x-reverse': isRTL }
          ]"
          @click="handleNavigation"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m0 0V9a2 2 0 012-2h2a2 2 0 012 2v6"/>
          </svg>
          <span>{{ t('Manage Admins') }}</span>
        </router-link>
      </div>

      <!-- Quick Actions -->
      <div class="pt-4 border-t border-gray-800">
        <p class="px-4 py-2 text-xs text-gray-500 uppercase tracking-wider">
          {{ t('Quick Actions') }}
        </p>
        
        <button
          @click="goToAddProduct"
          class="flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors text-gray-300 hover:bg-gray-800"
          :class="{ 'space-x-reverse': isRTL }"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          <span>{{ t('Add Product') }}</span>
        </button>

        <button
          @click="goToAddBrand"
          class="flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors text-gray-300 hover:bg-gray-800"
          :class="{ 'space-x-reverse': isRTL }"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
          <span>{{ t('Add Brand') }}</span>
        </button>

        <button
          v-if="isSuperAdmin"
          @click="goToAddOffer"
          class="flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors text-gray-300 hover:bg-gray-800"
          :class="{ 'space-x-reverse': isRTL }"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M9 12l2 2 4-4"/>
          </svg>
          <span>{{ t('Add Offer') }}</span>
        </button>
      </div>
    </nav>

    <!-- User Profile -->
    <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 bg-gray-900">
      <div class="flex items-center space-x-3" :class="{ 'space-x-reverse': isRTL }">
        <div class="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
          <span class="text-sm font-bold">{{ userInitials }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium truncate">{{ authStore.user?.email }}</p>
          <p class="text-xs text-gray-400 truncate">
            {{ authStore.isSuperAdmin ? t('Super Admin') : t('Admin') }}
          </p>
        </div>
        <button
          @click="handleLogout"
          class="p-2 text-gray-400 hover:text-white transition-colors flex-shrink-0"
          :title="t('Logout')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router' // route not used, import kept for potential use
import { useLanguageStore } from '@/stores/language'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
// route not used – prefix with underscore to avoid unused warning
const _route = useRoute()
const languageStore = useLanguageStore()
const authStore = useAuthStore()

// Destructure only needed values; currentLanguage not used
const { isRTL, t } = languageStore

// Props & Emits
const emit = defineEmits<{
  close: []
}>()

// State
const isMobile = ref(false)
const isSidebarOpen = ref(true)

// Computed
const isSuperAdmin = computed(() => authStore.isSuperAdmin)

const userInitials = computed(() => {
  const name = authStore.user?.displayName || authStore.user?.email || ''
  if (!name) return 'AD'
  
  // Get first letters of first two words
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

// Methods
const handleNavigation = () => {
  // Close sidebar on mobile after navigation
  if (isMobile.value) {
    emit('close')
  }
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/admin/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

const goToAddProduct = () => {
  router.push('/admin/products/add')
  handleNavigation()
}

const goToAddBrand = () => {
  router.push('/admin/brands/add')
  handleNavigation()
}

const goToAddOffer = () => {
  router.push('/admin/homepage/offers')
  handleNavigation()
}

const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024
  if (isMobile.value) {
    isSidebarOpen.value = false
  } else {
    isSidebarOpen.value = true
  }
}

// Lifecycle
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
/* Smooth transitions */
.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Improve hover effects */
.text-gray-300:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Active link styles */
.bg-primary-500 {
  background-color: #3b82f6;
}

.bg-purple-500 {
  background-color: #8b5cf6;
}

.bg-yellow-500 {
  background-color: #eab308;
}

.bg-green-500 {
  background-color: #10b981;
}

.bg-blue-500 {
  background-color: #3b82f6;
}

.bg-indigo-500 {
  background-color: #6366f1;
}

.bg-red-500 {
  background-color: #ef4444;
}

/* Mobile sidebar overlay */
@media (max-width: 1023px) {
  aside {
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
  }
  
  .-translate-x-full {
    transform: translateX(-100%);
  }
}

/* Desktop sidebar */
@media (min-width: 1024px) {
  aside {
    transform: translateX(0) !important;
  }
}

/* Custom scrollbar for navigation */
nav::-webkit-scrollbar {
  width: 4px;
}

nav::-webkit-scrollbar-track {
  background: transparent;
}

nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

nav::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Improve RTL support */
[dir="rtl"] .space-x-3 > :not([hidden]) ~ :not([hidden]) {
  margin-right: 0.75rem;
  margin-left: 0;
}

[dir="rtl"] .space-x-reverse > :not([hidden]) ~ :not([hidden]) {
  margin-right: 0;
  margin-left: 0.75rem;
}

/* Better spacing for sections */
.space-y-1 > * + * {
  margin-top: 0.25rem;
}

.pt-4 {
  padding-top: 1rem;
}

/* Ensure text doesn't overflow */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Quick action buttons */
button {
  cursor: pointer;
}

button:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  aside {
    width: 100%;
    max-width: 280px;
  }
}

/* Dark mode touch improvements */
@media (hover: hover) and (pointer: fine) {
  .hover\:bg-gray-800:hover {
    background-color: rgba(31, 41, 55, 0.8);
  }
}
</style>