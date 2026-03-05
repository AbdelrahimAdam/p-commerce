<!-- src/layouts/AdminLayout.vue -->
<template>
  <div class="admin-layout min-h-screen bg-gray-50">
    <!-- Admin Sidebar - always rendered, slides in/out on mobile -->
    <AdminSidebar 
      :class="[
        'fixed lg:static inset-y-0 left-0 z-40 w-64 transition-transform duration-300 ease-in-out',
        isMobile && !isMobileMenuOpen ? '-translate-x-full' : 'translate-x-0'
      ]"
    />
    
    <!-- Mobile Overlay -->
    <div 
      v-if="isMobileMenuOpen && isMobile"
      class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
      @click="isMobileMenuOpen = false"
    ></div>
    
    <!-- Main Content Area -->
    <div class="lg:ml-64 transition-all duration-200">
      <!-- Top Navigation Bar (sticky header) -->
      <header class="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div class="px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <!-- Mobile Menu Button -->
            <div class="lg:hidden">
              <button
                @click="toggleMobileMenu"
                class="p-2 text-gray-600 hover:text-primary-600"
                :aria-label="isMobileMenuOpen ? 'Close menu' : 'Open menu'"
              >
                <svg 
                  v-if="isMobileMenuOpen" 
                  class="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <svg 
                  v-else 
                  class="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            
            <!-- Logo (Mobile) -->
            <div class="lg:hidden">
              <router-link to="/admin" class="flex items-center">
                <div class="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center">
                  <svg class="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                          stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <span class="ml-2 text-lg font-display-en font-bold text-gray-900">
                  Parfum<span class="text-primary-500">.</span>
                </span>
              </router-link>
            </div>
            
            <!-- Page Title (desktop) -->
            <div class="hidden lg:block flex-1">
              <h1 class="text-xl font-display-en font-bold text-gray-900">
                {{ pageTitle }}
              </h1>
            </div>
            
            <!-- Right Side Actions -->
            <div class="flex items-center space-x-4">
              <!-- Language Switcher -->
              <button
                @click="toggleLanguage"
                class="p-2 text-gray-600 hover:text-primary-600"
                :title="currentLanguage === 'en' ? 'Switch to Arabic' : 'Switch to English'"
              >
                <span class="text-sm font-medium">
                  {{ currentLanguage === 'en' ? 'العربية' : 'English' }}
                </span>
              </button>
              
              <!-- Dark Mode Toggle -->
              <button
                @click="toggleDarkMode"
                class="p-2 text-gray-600 hover:text-primary-600"
                :title="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
              >
                <svg v-if="isDarkMode" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>
                </svg>
                <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                </svg>
              </button>
              
              <!-- Notifications -->
              <div class="relative">
                <button
                  @click="toggleNotifications"
                  class="p-2 text-gray-600 hover:text-primary-600 relative"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                  </svg>
                  <span 
                    v-if="unreadNotifications > 0"
                    class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                  >
                    {{ unreadNotifications }}
                  </span>
                </button>
                
                <!-- Notifications Dropdown -->
                <div 
                  v-if="showNotifications"
                  class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-luxury-xl border border-gray-200 z-50"
                  v-click-outside="closeNotifications"
                >
                  <div class="p-4 border-b border-gray-200">
                    <h3 class="font-display-en font-bold text-gray-900">
                      {{ t('Notifications') }}
                    </h3>
                  </div>
                  <div class="max-h-96 overflow-y-auto">
                    <div v-if="notifications.length === 0" class="p-8 text-center text-gray-500">
                      <svg class="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" 
                              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                      </svg>
                      <p>{{ t('No notifications') }}</p>
                    </div>
                    <div 
                      v-for="notification in notifications"
                      :key="notification.id"
                      class="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      @click="markAsRead(notification.id)"
                    >
                      <div class="flex items-start gap-3">
                        <div :class="[
                          'w-8 h-8 rounded-full flex items-center justify-center',
                          notification.type === 'order' ? 'bg-blue-100 text-blue-600' : '',
                          notification.type === 'product' ? 'bg-emerald-100 text-emerald-600' : '',
                          notification.type === 'system' ? 'bg-purple-100 text-purple-600' : '',
                          notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' : ''
                        ]">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path v-if="notification.type === 'order'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                            <path v-if="notification.type === 'product'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                            <path v-if="notification.type === 'system'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                            <path v-if="notification.type === 'warning'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                          </svg>
                        </div>
                        <div class="flex-1">
                          <p class="text-sm font-medium text-gray-900">
                            {{ notification.message }}
                          </p>
                          <p class="text-xs text-gray-500 mt-1">
                            {{ formatTimeAgo(notification.timestamp) }}
                          </p>
                        </div>
                        <div v-if="!notification.read" class="w-2 h-2 bg-primary-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <div class="p-3 border-t border-gray-200">
                    <button
                      @click="markAllAsRead"
                      class="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {{ t('Mark all as read') }}
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- User Profile Dropdown -->
              <div class="relative">
                <button
                  @click="toggleUserMenu"
                  class="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg"
                >
                  <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span class="text-primary-600 font-bold text-sm">
                      {{ userInitials }}
                    </span>
                  </div>
                  <div class="hidden md:block text-left">
                    <p class="text-sm font-medium text-gray-900">
                      {{ currentUser?.displayName || 'Admin User' }}
                    </p>
                    <p class="text-xs text-gray-500">
                      {{ currentUser?.role === 'super-admin' ? t('Super Admin') : t('Admin') }}
                    </p>
                  </div>
                  <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                
                <!-- User Menu Dropdown -->
                <div 
                  v-if="showUserMenu"
                  class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-luxury-xl border border-gray-200 z-50"
                  v-click-outside="closeUserMenu"
                >
                  <div class="p-4 border-b border-gray-200">
                    <p class="font-medium text-gray-900">{{ currentUser?.displayName }}</p>
                    <p class="text-sm text-gray-500">{{ currentUser?.email }}</p>
                  </div>
                  <div class="py-1">
                    <router-link
                      to="/admin"
                      class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      @click="closeUserMenu"
                    >
                      <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                      </svg>
                      {{ t('Dashboard') }}
                    </router-link>
                    <router-link
                      to="/admin/profile"
                      class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      @click="closeUserMenu"
                    >
                      <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                      {{ t('Profile') }}
                    </router-link>
                    <button
                      @click="logout"
                      class="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                      </svg>
                      {{ t('Sign Out') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <!-- Main Content -->
      <main class="p-4 sm:p-6 lg:p-8">
        <!-- Page Header (mobile) -->
        <div class="mb-6">
          <div class="lg:hidden">
            <h1 class="text-2xl font-display-en font-bold text-gray-900 mb-2">
              {{ pageTitle }}
            </h1>
          </div>
          <div v-if="pageDescription" class="text-gray-600">
            {{ pageDescription }}
          </div>
        </div>
        
        <!-- Router View -->
        <div class="admin-content">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </main>
      
      <!-- Footer -->
      <footer class="px-4 sm:px-6 lg:px-8 py-6 border-t border-gray-200">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div class="text-sm text-gray-600 mb-4 md:mb-0">
            © {{ currentYear }} Parfum. {{ t('All rights reserved.') }}
          </div>
          <div class="flex items-center space-x-6 text-sm text-gray-600">
            <router-link to="/" class="hover:text-primary-600">
              {{ t('View Store') }}
            </router-link>
            <a href="#" class="hover:text-primary-600">{{ t('Help') }}</a>
            <a href="#" class="hover:text-primary-600">{{ t('Privacy') }}</a>
            <a href="#" class="hover:text-primary-600">{{ t('Terms') }}</a>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'
import AdminSidebar from '@/components/Admin/AdminSidebar.vue'
import { getLocalizedTitle } from '@/router/routes'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const languageStore = useLanguageStore()

// Use storeToRefs for reactive refs
const { currentLanguage } = storeToRefs(languageStore)
const { t } = languageStore

// State
const isMobileMenuOpen = ref(false)
const isDarkMode = ref(false)
const showNotifications = ref(false)
const showUserMenu = ref(false)
const isMobile = ref(false) // for sidebar drawer
const notifications = ref([
  { id: 1, message: 'New order #ORD-1234 received', type: 'order', timestamp: new Date(Date.now() - 5 * 60 * 1000), read: false },
  { id: 2, message: 'Product "Tom Ford Noir Extreme" is running low', type: 'product', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), read: true },
  { id: 3, message: 'System maintenance scheduled for tonight', type: 'system', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), read: true },
  { id: 4, message: 'High traffic alert: Store visits increased by 150%', type: 'warning', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), read: true }
])

// Computed
const currentUser = computed(() => authStore.user)
const userInitials = computed(() => {
  if (!currentUser.value?.displayName) return 'AD'
  return currentUser.value.displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const unreadNotifications = computed(() => {
  return notifications.value.filter(n => !n.read).length
})

const pageTitle = computed(() => {
  return getLocalizedTitle(route.meta, currentLanguage.value)
})

const pageDescription = computed(() => {
  const description = route.meta?.description
  if (!description) return ''
  if (typeof description === 'string') return description
  // description is an object with en/ar
  const lang = currentLanguage.value === 'en' || currentLanguage.value === 'ar' ? currentLanguage.value : 'en'
  const descriptionObj = description as Record<string, string>
  return descriptionObj[lang] || descriptionObj.en || ''
})

const currentYear = computed(() => new Date().getFullYear())

// Methods
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem('admin_dark_mode', isDarkMode.value.toString())
  
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const toggleLanguage = () => {
  languageStore.setLanguage(currentLanguage.value === 'en' ? 'ar' : 'en')
}

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  showUserMenu.value = false
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  showNotifications.value = false
}

const closeNotifications = () => {
  showNotifications.value = false
}

const closeUserMenu = () => {
  showUserMenu.value = false
}

const markAsRead = (id: number) => {
  const notification = notifications.value.find(n => n.id === id)
  if (notification) {
    notification.read = true
  }
}

const markAllAsRead = () => {
  notifications.value.forEach(notification => {
    notification.read = true
  })
}

const logout = async () => {
  try {
    await authStore.logout()
    router.push('/admin/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

const formatTimeAgo = (date: Date) => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return t('Just now')
  if (diffMins < 60) return t('{{minutes}} minutes ago', { minutes: diffMins.toString() })
  if (diffHours < 24) return t('{{hours}} hours ago', { hours: diffHours.toString() })
  if (diffDays === 1) return t('Yesterday')
  return t('{{days}} days ago', { days: diffDays.toString() })
}

// Click outside directive
const vClickOutside = {
  mounted(el: HTMLElement, binding: { value: () => void }) {
    const handler = (event: Event) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value()
      }
    }
    ;(el as any).__clickOutsideHandler = handler
    document.addEventListener('click', handler)
  },
  unmounted(el: HTMLElement) {
    const handler = (el as any).__clickOutsideHandler
    if (handler) {
      document.removeEventListener('click', handler)
    }
  }
}

// Resize handler to detect mobile width
const updateMobileStatus = () => {
  isMobile.value = window.innerWidth < 1024
  if (!isMobile.value) {
    // On desktop, ensure menu is closed and sidebar visible
    isMobileMenuOpen.value = false
  }
}

// Initialize
onMounted(() => {
  // Load dark mode preference
  const savedDarkMode = localStorage.getItem('admin_dark_mode')
  if (savedDarkMode === 'true') {
    isDarkMode.value = true
    document.documentElement.classList.add('dark')
  }
  
  // Set initial mobile status
  updateMobileStatus()
  
  // Add resize listener
  window.addEventListener('resize', updateMobileStatus)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateMobileStatus)
})

// Watch for auth changes
watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (!isAuthenticated && route.meta.requiresAuth) {
      router.push('/admin/login')
    }
  }
)
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Sidebar transition */
.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Scrollbar styling */
:deep(.admin-content) {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

:deep(.admin-content)::-webkit-scrollbar {
  width: 6px;
}

:deep(.admin-content)::-webkit-scrollbar-track {
  background: #f1f5f9;
}

:deep(.admin-content)::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 3px;
}

/* Dark mode styles */
:global(.dark) .admin-layout {
  background-color: #0f172a;
}

:global(.dark) .bg-white {
  background-color: #1e293b !important;
}

:global(.dark) .text-gray-900 {
  color: #f1f5f9 !important;
}

:global(.dark) .text-gray-700 {
  color: #cbd5e1 !important;
}

:global(.dark) .text-gray-600 {
  color: #94a3b8 !important;
}

:global(.dark) .text-gray-500 {
  color: #64748b !important;
}

:global(.dark) .border-gray-200 {
  border-color: #334155 !important;
}

:global(.dark) .bg-gray-50 {
  background-color: #1e293b !important;
}

:global(.dark) .hover\:bg-gray-100:hover {
  background-color: #334155 !important;
}

:global(.dark) .shadow-luxury-xl {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
}
</style>