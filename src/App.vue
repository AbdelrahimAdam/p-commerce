<template>
  <div id="vue-app" :class="[isRTL ? 'rtl' : 'ltr', appClasses]" class="min-h-screen-mobile">
    <!-- SEO Head Component -->
    <SEOHead />

    <!-- ADMIN LAYOUT -->
    <template v-if="routeLayout === 'admin'">
      <div class="admin-app-wrapper">
        <!-- Admin Sidebar with Mobile Transition -->
        <AdminSidebar 
          :class="[
            'fixed lg:static inset-y-0 left-0 z-40 w-64 lg:w-auto h-screen lg:h-auto',
            'transform transition-transform duration-300 ease-in-out',
            'lg:flex-shrink-0',
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          ]"
        />

        <!-- Mobile Overlay -->
        <div 
          v-if="isMobileMenuOpen"
          class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity duration-300"
          @click="isMobileMenuOpen = false"
        ></div>

        <!-- Main Content Area -->
        <div class="flex-1 flex flex-col min-w-0">
          <!-- Top Navigation Bar -->
          <header class="bg-white border-b border-gray-200 sticky top-0 z-20 flex-shrink-0">
            <div class="px-4 sm:px-6 lg:px-8 max-w-full">
              <div class="flex items-center justify-between h-16 gap-4">
                <!-- Left Side: Menu Button & Mobile Logo -->
                <div class="flex items-center flex-1 lg:flex-none min-w-0">
                  <!-- Mobile Menu Button -->
                  <button
                    @click="toggleMobileMenu"
                    class="p-2 text-gray-600 hover:text-primary-600 lg:hidden flex-shrink-0"
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

                  <!-- Logo (Mobile) -->
                  <router-link 
                    to="/admin" 
                    class="lg:hidden flex items-center min-w-0 ml-2 sm:ml-4"
                  >
                    <div class="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center flex-shrink-0">
                      <svg class="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                              stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                    <span class="ml-2 text-lg font-display-en font-bold text-gray-900 truncate">
                      P.COMMERCE<span class="text-primary-500">.</span>
                    </span>
                  </router-link>

                  <!-- Page Title (Desktop) -->
                  <h1 class="hidden lg:block text-xl font-display-en font-bold text-gray-900 truncate ml-4">
                    {{ adminPageTitle }}
                  </h1>
                </div>

                <!-- Right Side Actions -->
                <div class="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
                  <!-- Language Switcher -->
                  <button
                    @click="toggleLanguage"
                    class="p-2 text-gray-600 hover:text-primary-600"
                    :title="currentLanguage === 'en' ? 'Switch to Arabic' : 'Switch to English'"
                  >
                    <span class="text-sm font-medium hidden sm:inline">
                      {{ currentLanguage === 'en' ? 'العربية' : 'English' }}
                    </span>
                    <span class="text-sm font-medium sm:hidden">
                      {{ currentLanguage === 'en' ? 'AR' : 'EN' }}
                    </span>
                  </button>

                  <!-- Dark Mode Toggle -->
                  <button
                    @click="toggleDarkMode"
                    class="p-2 text-gray-600 hover:text-primary-600"
                    :title="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
                  >
                    <svg v-if="isDarkMode" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 
001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 
0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 
01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>
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
                      :title="safeTranslate('Notifications')"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 
11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                      </svg>
                      <span 
                        v-if="unreadNotifications > 0"
                        class="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center 
text-[10px] sm:text-xs"
                      >
                        {{ unreadNotifications > 9 ? '9+' : unreadNotifications }}
                      </span>
                    </button>

                    <!-- Notifications Dropdown - Mobile Optimized -->
                    <div 
                      v-if="showNotifications"
                      class="fixed sm:absolute right-0 sm:right-auto left-0 sm:left-auto mt-0 sm:mt-2 w-full sm:w-80 max-w-[calc(100vw-2rem)] sm:max-w-none 
bg-white rounded-lg shadow-luxury-xl border border-gray-200 z-50 top-16 mx-4 sm:mx-0 max-h-[calc(100vh-8rem)] sm:max-h-96 overflow-hidden flex flex-col"
                      v-click-outside="closeNotifications"
                    >
                      <div class="p-4 border-b border-gray-200 flex-shrink-0">
                        <h3 class="font-display-en font-bold text-gray-900">
                          {{ safeTranslate('Notifications') }}
                        </h3>
                      </div>
                      <div class="flex-1 overflow-y-auto">
                        <div v-if="notifications.length === 0" class="p-8 text-center text-gray-500">
                          <svg class="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" 
                                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 
11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                          </svg>
                          <p>{{ safeTranslate('No notifications') }}</p>
                        </div>
                        <div 
                          v-for="notification in notifications"
                          :key="notification.id"
                          class="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer active:bg-gray-100"
                          @click="markAsRead(notification.id)"
                        >
                          <div class="flex items-start gap-3">
                            <div :class="[
                              'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                              notification.type === 'order' ? 'bg-blue-100 text-blue-600' : '',
                              notification.type === 'product' ? 'bg-emerald-100 text-emerald-600' : '',
                              notification.type === 'system' ? 'bg-purple-100 text-purple-600' : '',
                              notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' : ''
                            ]">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path v-if="notification.type === 'order'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 
00-8 0v4M5 9h14l1 12H4L5 9z"/>
                                <path v-if="notification.type === 'product'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 
00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 
01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                                <path v-if="notification.type === 'system'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 
4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 
1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 
00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 
2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                                <path v-if="notification.type === 'warning'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 
4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                              </svg>
                            </div>
                            <div class="flex-1 min-w-0">
                              <p class="text-sm font-medium text-gray-900 truncate">
                                {{ notification.message }}
                              </p>
                              <p class="text-xs text-gray-500 mt-1">
                                {{ formatTimeAgo(notification.timestamp) }}
                              </p>
                            </div>
                            <div v-if="!notification.read" class="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1"></div>
                          </div>
                        </div>
                      </div>
                      <div class="p-3 border-t border-gray-200 flex-shrink-0">
                        <button
                          @click="markAllAsRead"
                          class="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium py-2 active:bg-gray-50 rounded"
                        >
                          {{ safeTranslate('Mark all as read') }}
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- User Profile Dropdown -->
                  <div class="relative">
                    <button
                      @click="toggleUserMenu"
                      class="flex items-center space-x-2 sm:space-x-3 p-2 hover:bg-gray-100 rounded-lg active:bg-gray-200"
                      :title="currentUser?.displayName || 'Admin User'"
                    >
                      <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <span class="text-primary-600 font-bold text-sm">
                          {{ userInitials }}
                        </span>
                      </div>
                      <div class="hidden md:block text-left min-w-0">
                        <p class="text-sm font-medium text-gray-900 truncate">
                          {{ currentUser?.displayName || 'Admin User' }}
                        </p>
                        <p class="text-xs text-gray-500 truncate">
                          {{ currentUser?.role === 'super-admin' ? safeTranslate('Super Admin') : safeTranslate('Admin') }}
                        </p>
                      </div>
                      <svg class="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </button>

                    <!-- User Menu Dropdown - Mobile Optimized -->
                    <div 
                      v-if="showUserMenu"
                      class="fixed sm:absolute right-0 sm:right-auto left-0 sm:left-auto mt-0 sm:mt-2 w-full sm:w-48 max-w-[calc(100vw-2rem)] sm:max-w-none 
bg-white rounded-lg shadow-luxury-xl border border-gray-200 z-50 top-16 mx-4 sm:mx-0"
                      v-click-outside="closeUserMenu"
                    >
                      <div class="p-4 border-b border-gray-200">
                        <p class="font-medium text-gray-900 truncate">{{ currentUser?.displayName }}</p>
                        <p class="text-sm text-gray-500 truncate">{{ currentUser?.email }}</p>
                      </div>
                      <div class="py-1">
                        <router-link
                          to="/admin"
                          class="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                          @click="closeUserMenu"
                        >
                          <svg class="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 
1v4a1 1 0 001 1m-6 0h6"/>
                          </svg>
                          <span class="truncate">{{ safeTranslate('Dashboard') }}</span>
                        </router-link>
                        <router-link
                          to="/admin/profile"
                          class="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                          @click="closeUserMenu"
                        >
                          <svg class="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                          </svg>
                          <span class="truncate">{{ safeTranslate('Profile') }}</span>
                        </router-link>
                        <button
                          @click="logout"
                          class="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 active:bg-red-100"
                        >
                          <svg class="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M17 16l4-4m0 0l-4 4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                          </svg>
                          <span class="truncate">{{ safeTranslate('Sign Out') }}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <!-- Main Content -->
          <main class="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden overflow-y-auto bg-gray-50">
            <!-- Page Header -->
            <div class="mb-6 lg:mb-8">
              <!-- Mobile Header -->
              <div class="lg:hidden">
                <h1 class="text-2xl sm:text-3xl font-display-en font-bold text-gray-900 mb-2 break-words">
                  {{ adminPageTitle }}
                </h1>
                <div v-if="adminPageDescription" class="text-gray-600 text-sm sm:text-base">
                  {{ adminPageDescription }}
                </div>
              </div>

              <!-- Desktop Description (only shown if there's a description) -->
              <div v-if="adminPageDescription" class="hidden lg:block text-gray-600">
                {{ adminPageDescription }}
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
          <footer class="px-4 sm:px-6 lg:px-8 py-4 border-t border-gray-200 bg-white flex-shrink-0">
            <div class="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
              <div class="text-sm text-gray-600 text-center sm:text-left">
                © {{ currentYear }} P.COMMERCE. {{ safeTranslate('All rights reserved.') }}
              </div>
              <div class="flex flex-wrap justify-center items-center gap-3 sm:gap-6 text-sm text-gray-600">
                <router-link to="/" class="hover:text-primary-600 transition-colors">
                  {{ safeTranslate('View Store') }}
                </router-link>
                <a href="#" class="hover:text-primary-600 transition-colors">{{ safeTranslate('Help') }}</a>
                <a href="#" class="hover:text-primary-600 transition-colors">{{ safeTranslate('Privacy') }}</a>
                <a href="#" class="hover:text-primary-600 transition-colors">{{ safeTranslate('Terms') }}</a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </template>

    <!-- ADMIN LOGIN LAYOUT -->
    <template v-else-if="routeLayout === 'admin-login'">
      <div class="admin-login-wrapper">
        <router-view v-slot="{ Component, route }">
          <component 
            :is="Component" 
            :key="route.path" 
          />
        </router-view>
      </div>
    </template>

    <!-- LANDING LAYOUT (Marketing) -->
    <template v-else-if="routeLayout === 'landing'">
      <MarketingLayout>
        <router-view />
      </MarketingLayout>
    </template>

    <!-- DEFAULT LAYOUT (Main Store) - OPTIMIZED SPACING -->
    <template v-else>
      <!-- Header Navigation -->
      <LuxuryHeader />

      <!-- Main Content - Optimized spacing -->
      <main 
        id="main-content" 
        class="main-content"
        :style="mainContentStyle"
      >
        <router-view v-slot="{ Component, route }">
          <!-- Page Transitions -->
          <transition
            :name="transitionName"
            mode="out-in"
            @before-enter="beforeEnter"
            @after-enter="afterEnter"
          >
            <component 
              :is="Component" 
              :key="route.path" 
            />
          </transition>
        </router-view>
      </main>

      <!-- Footer -->
      <Footer />

      <!-- Global Components -->
      <LuxuryCartSidebar />
      <LuxurySearchModal />
      <LuxuryNotificationCenter />
    </template>

    <!-- Loading Overlay – only on initial load or when product list is empty -->
    <transition name="fade">
      <div
        v-if="showFullScreenLoader"
        class="luxury-loading-overlay fixed inset-0 bg-[#0a0a0a] z-[100] flex items-center justify-center safe-top safe-bottom"
      >
        <div class="text-center">
          <div class="preloader-logo mb-4 md:mb-6">
            <div class="preloader-brand">P.COMMERCE</div>
            <div class="preloader-subtitle">PERFUME STORE</div>
          </div>
          <p class="preloader-text text-gold-light text-sm md:text-base font-['Inter'] font-medium tracking-widest uppercase">
            {{ safeTranslate('loading') }}
          </p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useLanguageStore } from '@/stores/language'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useProductsStore } from '@/stores/products'
import { useTenantStore } from '@/stores/tenant'
import { storeToRefs } from 'pinia'
import { getLocalizedTitle } from '@/router/routes'

// Luxury Components
import SEOHead from '@/components/UI/SEOHead.vue'
import LuxuryHeader from '@/components/Layout/LuxuryHeader.vue'
import Footer from '@/components/Layout/Footer.vue'
import LuxuryCartSidebar from '@/components/Cart/LuxuryCartSidebar.vue'
import LuxurySearchModal from '@/components/search/SearchModal.vue'
import LuxuryNotificationCenter from '@/components/UI/LuxuryNotificationCenter.vue'
import AdminSidebar from '@/components/Admin/AdminSidebar.vue'
import MarketingLayout from '@/components/Layout/MarketingLayout.vue'

// Router
const router = useRouter()
const route = useRoute()

// Stores
const languageStore = useLanguageStore()
const cartStore = useCartStore()
const authStore = useAuthStore()
const productsStore = useProductsStore()
const tenantStore = useTenantStore()

// Use storeToRefs for reactive state/computed
const { currentLanguage, isRTL } = storeToRefs(languageStore)
const { products, isLoading } = storeToRefs(productsStore)

// State with safe defaults
const scrollY = ref(0)
const isMobile = ref(false)
const fontsLoaded = ref(false)
const prefersReducedMotion = ref(false)
// Actual header heights from LuxuryHeader: 69px desktop, 53px mobile
const headerHeight = ref(window.innerWidth < 768 ? 53 : 69)

// Admin state
const isMobileMenuOpen = ref(false)
const isDarkMode = ref(false)
const showNotifications = ref(false)
const showUserMenu = ref(false)
const notifications = ref([
  { id: 1, message: 'New order #ORD-1234 received', type: 'order', timestamp: new Date(Date.now() - 5 * 60 * 1000), read: false },
  { id: 2, message: 'Product "Tom Ford Noir Extreme" is running low', type: 'product', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), read: true },
  { id: 3, message: 'System maintenance scheduled for tonight', type: 'system', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), read: true },
  { id: 4, message: 'High traffic alert: Store visits increased by 150%', type: 'warning', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), read: 
true }
])

// Performance optimizations
const animationFrameId = ref<number | null>(null)
const lastScrollTime = ref(0)
const SCROLL_THROTTLE_MS = 16 // ~60fps

// Computed properties
const routeLayout = computed(() => {
  return route.meta.layout || 'default'
})

// Helper to get safe language for indexing (only 'en' or 'ar')
const safeLanguage = computed(() => {
  const lang = currentLanguage.value
  return (lang === 'en' || lang === 'ar') ? lang : 'en'
})

// Computed transition name (ensures it's a string)
const transitionName = computed(() => {
  const metaTransition = route.meta.transition
  return typeof metaTransition === 'string' ? metaTransition : 'fade'
})

// Helper to check if current route is public
const isPublicRoute = computed(() => {
  const publicPaths = [
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
    '/wishlist'
  ]
  
  return publicPaths.some(path => 
    route.path === path || route.path.startsWith(path + '/')
  )
})

// New computed: show full‑screen loader only when loading and product list is empty
const showFullScreenLoader = computed(() => isLoading.value && products.value.length === 0)

const appClasses = computed(() => ({
  'rtl': isRTL.value,
  'ltr': !isRTL.value,
  'scroll-locked': (showFullScreenLoader.value) || false,
  'mobile': isMobile.value,
  'desktop': !isMobile.value,
  'fonts-loaded': fontsLoaded.value,
  'reduced-motion': prefersReducedMotion.value,
  'admin-layout': routeLayout.value === 'admin',
  'admin-login-layout': routeLayout.value === 'admin-login',
  'landing-layout': routeLayout.value === 'landing',
  'default-layout': routeLayout.value === 'default'
}))

const mainContentStyle = computed(() => ({
  paddingTop: `${headerHeight.value}px`,
  minHeight: `calc(100dvh - ${headerHeight.value}px)`
}))

// Admin computed properties
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

const adminPageTitle = computed(() => {
  return getLocalizedTitle(route.meta, currentLanguage.value)
})

const adminPageDescription = computed(() => {
  const description = route.meta?.description
  if (!description) return ''
  if (typeof description === 'string') return description
  if (typeof description === 'object' && description !== null && 'en' in description) {
    const descObj = description as { en: string; ar?: string }
    return descObj[safeLanguage.value] || descObj.en || ''
  }
  return ''
})

const currentYear = computed(() => new Date().getFullYear())

// Translations with fallbacks
const appTranslations = {
  skipToContent: { en: 'Skip to main content', ar: 'تخطي إلى المحتوى الرئيسي' },
  loading: { en: 'Loading...', ar: 'جاري التحميل...' },
  offlineTitle: { en: 'Offline', ar: 'غير متصل' },
  offlineMessage: { en: 'Check your connection', ar: 'تحقق من اتصالك' },
  backOnline: { en: 'Back Online', ar: 'عدت للاتصال' },
  connectionRestored: { en: 'Connection restored', ar: 'تم استعادة الاتصال' },
  languageChanged: { en: 'Language Changed', ar: 'تم تغيير اللغة' },
  languageChangedMessage: { en: 'Language updated', ar: 'تم تحديث اللغة' },
  Notifications: { en: 'Notifications', ar: 'الإشعارات' },
  'No notifications': { en: 'No notifications', ar: 'لا توجد إشعارات' },
  'Mark all as read': { en: 'Mark all as read', ar: 'تحديد الكل كمقروء' },
  Dashboard: { en: 'Dashboard', ar: 'لوحة التحكم' },
  Profile: { en: 'Profile', ar: 'الملف الشخصي' },
  'Sign Out': { en: 'Sign Out', ar: 'تسجيل الخروج' },
  'Super Admin': { en: 'Super Admin', ar: 'المسؤول الرئيسي' },
  Admin: { en: 'Admin', ar: 'مسؤول' },
  'View Store': { en: 'View Store', ar: 'عرض المتجر' },
  'All rights reserved.': { en: 'All rights reserved.', ar: 'جميع الحقوق محفوظة.' },
  Help: { en: 'Help', ar: 'مساعدة' },
  Privacy: { en: 'Privacy', ar: 'الخصوصية' },
  Terms: { en: 'Terms', ar: 'الشروط' },
  'Just now': { en: 'Just now', ar: 'الآن' },
  'minutes ago': { en: 'minutes ago', ar: 'دقائق مضت' },
  'hours ago': { en: 'hours ago', ar: 'ساعات مضت' },
  'Yesterday': { en: 'Yesterday', ar: 'أمس' },
  'days ago': { en: 'days ago', ar: 'أيام مضت' }
}

// Safe translate function - simplified, no dependency on languageStore.t
const safeTranslate = (key: string | { [key: string]: string } | undefined): string => {
  if (!key) return ''
  
  if (typeof key === 'string') {
    const translations = appTranslations[key as keyof typeof appTranslations]
    if (translations) {
      return translations[safeLanguage.value] || translations.en || key
    }
    return key
  }
  
  // key is an object with en/ar
  return key[safeLanguage.value] || key.en || ''
}

// Admin methods
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  if (isMobileMenuOpen.value) {
    showNotifications.value = false
    showUserMenu.value = false
  }
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
  isMobileMenuOpen.value = false
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  showNotifications.value = false
  isMobileMenuOpen.value = false
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
  if (window.innerWidth < 640) {
    showNotifications.value = false
  }
}

const markAllAsRead = () => {
  notifications.value.forEach(notification => {
    notification.read = true
  })
  if (window.innerWidth < 640) {
    showNotifications.value = false
  }
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

  if (diffMins < 1) return safeTranslate('Just now')
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
  if (diffDays === 1) return safeTranslate('Yesterday')
  return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
}

// Click outside directive for admin dropdowns
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

// Shared methods
const beforeEnter = () => {
  if (routeLayout.value === 'default') {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion.value ? 'auto' : 'smooth' })
  }
}

const afterEnter = () => {
  if (routeLayout.value === 'default') {
    triggerScrollAnimations()
  }
}

// Performance optimized scroll handler (only for default layout)
const handleScroll = () => {
  if (routeLayout.value !== 'default') return
  
  const now = Date.now()
  if (now - lastScrollTime.value < SCROLL_THROTTLE_MS) return
  
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
  }
  
  animationFrameId.value = requestAnimationFrame(() => {
    scrollY.value = window.scrollY
    const header = document.querySelector('.luxury-header')
    
    if (header) {
      if (scrollY.value > 50) {
        header.classList.add('scrolled', 'shadow-luxury-lg')
      } else {
        header.classList.remove('scrolled', 'shadow-luxury-lg')
      }
    }
    
    triggerScrollAnimations()
    lastScrollTime.value = now
  })
}

const triggerScrollAnimations = () => {
  const elements = document.querySelectorAll('.scroll-fade-in')
  const windowHeight = window.innerHeight
  
  elements.forEach((element) => {
    const elementTop = element.getBoundingClientRect().top
    if (elementTop < windowHeight - 100) {
      element.classList.add('visible')
    }
  })
}

const updateHeaderHeight = () => {
  if (routeLayout.value !== 'default') return
  
  const header = document.querySelector('.luxury-header')
  if (header) {
    const height = header.clientHeight
    headerHeight.value = height
    document.documentElement.style.setProperty('--header-height', `${height}px`)
  } else {
    // Fallback to known values
    headerHeight.value = window.innerWidth < 768 ? 53 : 69
    document.documentElement.style.setProperty('--header-height', `${headerHeight.value}px`)
  }
}

const handleResize = () => {
  isMobile.value = window.innerWidth < 768
  if (routeLayout.value === 'default') {
    updateHeaderHeight()
  }
  
  // Handle admin responsive behavior
  if (window.innerWidth >= 1024) {
    isMobileMenuOpen.value = false
  }
}

const handleOnlineStatus = () => {
  if (!navigator.onLine) {
    window.dispatchEvent(new CustomEvent('luxury-notification', {
      detail: {
        type: 'warning',
        title: safeTranslate('offlineTitle'),
        message: safeTranslate('offlineMessage'),
        duration: 3000,
        icon: '📡'
      }
    }))
  } else {
    window.dispatchEvent(new CustomEvent('luxury-notification', {
      detail: {
        type: 'success',
        title: safeTranslate('backOnline'),
        message: safeTranslate('connectionRestored'),
        duration: 2000,
        icon: '📶'
      }
    }))
  }
}

const updatePageTitle = () => {
  const routeTitle = route.meta.title as string | { [key: string]: string } | undefined
  const appName = safeTranslate({ en: 'P.COMMERCE', ar: 'بي.كوميرس' })
  
  if (routeTitle) {
    if (typeof routeTitle === 'object') {
      const title = safeTranslate(routeTitle)
      document.title = `${title} | ${appName}`
    } else {
      const title = safeTranslate(routeTitle)
      document.title = `${title} | ${appName}`
    }
  } else {
    document.title = appName
  }
}

const updateLanguageDirection = () => {
  const html = document.documentElement
  
  // Update lang attribute
  html.setAttribute('lang', currentLanguage.value)
  
  // Update dir attribute
  if (isRTL.value) {
    html.setAttribute('dir', 'rtl')
    html.classList.add('rtl')
    html.classList.remove('ltr')
  } else {
    html.setAttribute('dir', 'ltr')
    html.classList.add('ltr')
    html.classList.remove('rtl')
  }
  
  // Update font family based on language
  if (currentLanguage.value === 'ar') {
    html.style.fontFamily = "'Noto Sans Arabic', 'Inter', system-ui, -apple-system, sans-serif"
  } else {
    html.style.fontFamily = "'Inter', system-ui, -apple-system, sans-serif"
  }
  
  // Update CSS variables for direction
  updateDirectionVariables()
}

const updateDirectionVariables = () => {
  const root = document.documentElement
  
  if (isRTL.value) {
    root.style.setProperty('--text-start', 'right')
    root.style.setProperty('--text-end', 'left')
    root.style.setProperty('--margin-start', 'margin-right')
    root.style.setProperty('--margin-end', 'margin-left')
    root.style.setProperty('--padding-start', 'padding-right')
    root.style.setProperty('--padding-end', 'padding-left')
    root.style.setProperty('--inset-start', 'right')
    root.style.setProperty('--inset-end', 'left')
  } else {
    root.style.setProperty('--text-start', 'left')
    root.style.setProperty('--text-end', 'right')
    root.style.setProperty('--margin-start', 'margin-left')
    root.style.setProperty('--margin-end', 'margin-right')
    root.style.setProperty('--padding-start', 'padding-left')
    root.style.setProperty('--padding-end', 'padding-right')
    root.style.setProperty('--inset-start', 'left')
    root.style.setProperty('--inset-end', 'right')
  }
}

const setupFontLoading = () => {
  if ('fonts' in document) {
    document.fonts.ready.then(() => {
      fontsLoaded.value = true
      document.body.classList.add('fonts-loaded')
    }).catch(() => {
      fontsLoaded.value = true
      document.body.classList.add('fonts-loaded')
    })
  } else {
    setTimeout(() => {
      fontsLoaded.value = true
      document.body.classList.add('fonts-loaded')
    }, 100)
  }
}

const setupReducedMotion = () => {
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    prefersReducedMotion.value = e.matches
  })
}

// Handle Escape key to close admin dropdowns
const handleEscapeKey = (event: KeyboardEvent) => {
  if (routeLayout.value === 'admin' && event.key === 'Escape') {
    showNotifications.value = false
    showUserMenu.value = false
    if (window.innerWidth < 1024) {
      isMobileMenuOpen.value = false
    }
  }
}

// Lifecycle
onMounted(async () => {
  // ✅ Start tenant resolution immediately (it will cache and be fast)
  tenantStore.resolveTenantFromDomain().catch(err => {
    console.warn('Tenant resolution failed, will retry later:', err)
  })

  // Set initial header height with known values
  headerHeight.value = window.innerWidth < 768 ? 53 : 69
  document.documentElement.style.setProperty('--header-height', `${headerHeight.value}px`)
  
  // Mark body as loaded to hide preloader
  document.body.classList.add('loaded')
  
  // Setup reduced motion detection
  setupReducedMotion()
  
  // Setup font loading
  setupFontLoading()
  
  // Update language direction immediately
  updateLanguageDirection()
  
  // Add event listeners
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', handleResize, { passive: true })
  window.addEventListener('online', handleOnlineStatus)
  window.addEventListener('offline', handleOnlineStatus)
  window.addEventListener('keydown', handleEscapeKey)
  
  // Initial calls
  handleResize()
  if (routeLayout.value === 'default') {
    handleScroll()
  }
  
  // Wait for next tick to ensure DOM is ready
  await nextTick()
  if (routeLayout.value === 'default') {
    updateHeaderHeight()
  }
  
  // Initialize stores - ONLY initialize auth on non-public routes
  try {
    if (languageStore.initialize) languageStore.initialize()
    
    // Only initialize auth on protected routes
    if (!isPublicRoute.value) {
      if (authStore.checkAuth) await authStore.checkAuth()
    } else {
      console.log('🌍 Public route detected in App.vue - skipping auth initialization')
    }
    
    // Do NOT manually fetch products here; the products store's watchEffect will handle it after tenant is ready.
    // But we can still initialize cart if needed.
    if (cartStore.initialize) cartStore.initialize()
    
  } catch (error) {
    console.error('❌ Store initialization failed:', error)
  }
  
  // Add scrollbar styling for default layout
  if (routeLayout.value === 'default') {
    document.documentElement.classList.add('luxury-scrollbar')
  }
  
  // Final setup
  updatePageTitle()
})

onUnmounted(() => {
  // Clean up event listeners
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('online', handleOnlineStatus)
  window.removeEventListener('offline', handleOnlineStatus)
  window.removeEventListener('keydown', handleEscapeKey)
  
  // Clean up animation frame
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
  }
  
  // Clean up classes
  document.body.classList.remove('loaded')
  document.documentElement.classList.remove('luxury-scrollbar')
})

// Watch for language changes
watch(() => languageStore.currentLanguage, (newLang) => {
  updateLanguageDirection()
  updatePageTitle()
  
  window.dispatchEvent(new CustomEvent('luxury-notification', {
    detail: {
      type: 'success',
      title: safeTranslate('languageChanged'),
      message: safeTranslate('languageChangedMessage'),
      duration: 2000,
      icon: newLang === 'ar' ? '🌙' : '🌍'
    }
  }))
})

// Watch for RTL changes
watch(() => isRTL.value, () => {
  updateLanguageDirection()
})

// Watch route changes
watch(() => route.path, (_newPath) => {
  updatePageTitle()
  
  // Close admin dropdowns on route change
  if (routeLayout.value === 'admin') {
    isMobileMenuOpen.value = false
    showNotifications.value = false
    showUserMenu.value = false
  }
  
  // Close mobile menu if open (default layout)
  if (routeLayout.value === 'default') {
    const mobileMenu = document.querySelector('.mobile-menu')
    if (mobileMenu?.classList.contains('open')) {
      mobileMenu.classList.remove('open')
    }
  }
  
  // Close cart if open
  if (cartStore.isOpen) {
    cartStore.closeCart()
  }
  
  // Update header height on route change
  if (routeLayout.value === 'default') {
    nextTick(() => {
      updateHeaderHeight()
    })
  }
})
</script>

<style>
/* ========== GLOBAL STYLES - OPTIMIZED SPACING ========== */
/* CSS Variables - Optimized */
:root {
  --header-height: 69px;
  --header-height-mobile: 53px;
  --header-height-desktop: 69px;
  --content-spacing-mobile: 1rem;
  --content-spacing-tablet: 1.5rem;
  --content-spacing-desktop: 2rem;
  --section-spacing-mobile: 2rem;
  --section-spacing-tablet: 3rem;
  --section-spacing-desktop: 4rem;
  --safe-area-inset-top: env(safe-area-inset-top, 0px);
  --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
  --safe-area-inset-left: env(safe-area-inset-left, 0px);
  --safe-area-inset-right: env(safe-area-inset-right, 0px);
  
  /* Theme colors */
  --color-bg-light: #ffffff;
  --color-bg-light-secondary: #f8f5f0;
  --color-text-dark: #1a120b;
  --color-text-dark-secondary: rgba(26, 18, 11, 0.7);
  --color-gold: #d4af37;
  --color-gold-light: #f4e7c1;
  --color-gold-dark: #b8941f;
  --color-red: #c41e3a;
  
  /* Admin colors */
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  
  /* Direction variables */
  --text-start: left;
  --text-end: right;
  --margin-start: margin-left;
  --margin-end: margin-right;
  --padding-start: padding-left;
  --padding-end: padding-right;
  --inset-start: left;
  --inset-end: right;
}

/* App container */
#vue-app {
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
               'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  min-height: 100vh;
  min-height: 100dvh;
  min-height: -webkit-fill-available;
  color: var(--color-text-dark);
  overflow-x: hidden;
}

/* Default layout background */
#vue-app.default-layout {
  background: linear-gradient(135deg, #ffffff 0%, #f8f5f0 100%);
}

/* Admin layout background */
#vue-app.admin-layout,
#vue-app.admin-login-layout {
  background: #f9fafb;
}

/* Font loading states */
body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  margin: 0;
  padding: 0;
}

body.fonts-loaded #vue-app {
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
               'Helvetica Neue', Arial, sans-serif;
}

/* Typography - Optimized spacing */
body {
  font-size: 14px;
  line-height: 1.5;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

@media (min-width: 768px) {
  body {
    font-size: 16px;
    line-height: 1.6;
  }
}

/* Luxury Typography with RTL support */
h1, h2, h3, h4, h5, h6 {
  font-family: 'Cormorant Garamond', 'Times New Roman', Times, serif;
  font-weight: 600;
  letter-spacing: 0.3px;
  color: var(--color-text-dark);
  line-height: 1.2;
  text-align: var(--text-start);
  margin-top: 0;
}

h1 {
  font-size: clamp(1.75rem, 5vw, 2.5rem);
  margin-bottom: 0.75rem;
}

@media (min-width: 768px) {
  h1 {
    margin-bottom: 1rem;
  }
}

h2 {
  font-size: clamp(1.5rem, 4vw, 2rem);
  margin-bottom: 0.625rem;
}

@media (min-width: 768px) {
  h2 {
    margin-bottom: 0.75rem;
  }
}

h3 {
  font-size: clamp(1.25rem, 3.5vw, 1.75rem);
  margin-bottom: 0.5rem;
}

@media (min-width: 768px) {
  h3 {
    margin-bottom: 0.625rem;
  }
}

p {
  margin-top: 0;
  margin-bottom: 1rem;
}

@media (min-width: 768px) {
  p {
    margin-bottom: 1.25rem;
  }
}

/* ========== PRELOADER STYLES (matching index.html) ========== */
.preloader-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: pulse 1.5s infinite;
}

.preloader-brand {
  font-family: 'Cormorant Garamond', serif;
  font-size: 36px;
  color: #d4af37;
  font-weight: 600;
  line-height: 1;
  letter-spacing: 2px;
  margin-bottom: 4px;
}

.preloader-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 10px;
  color: #999999;
  letter-spacing: 3px;
  text-transform: uppercase;
  opacity: 0.9;
  font-weight: 400;
}

.preloader-text {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: #999999;
  letter-spacing: 2px;
  text-transform: uppercase;
  opacity: 0.9;
  font-weight: 400;
  margin-top: 8px;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.03); opacity: 0.9; }
  100% { transform: scale(1); opacity: 1; }
}

/* Override text color for the loading message (keep it gold) */
.preloader-text.text-gold-light {
  color: #f4e7c1;
}

/* Ensure no rounded edges */
.preloader-logo {
  border-radius: 0 !important;
}

/* ========== PAGE TRANSITIONS ========== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
  will-change: opacity;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ========== LUXURY SCROLLBAR ========== */
.luxury-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #d4af37 rgba(248, 245, 240, 0.5);
}

.luxury-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.luxury-scrollbar::-webkit-scrollbar-track {
  background: rgba(248, 245, 240, 0.5);
  border-radius: 3px;
}

.luxury-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #d4af37 0%, #b8941f 100%);
  border-radius: 3px;
}

@media (min-width: 768px) {
  .luxury-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
}

/* ========== RTL/LTR DIRECTION UTILITIES ========== */
/* Direction classes */
.rtl {
  direction: rtl;
  text-align: var(--text-start);
}

.ltr {
  direction: ltr;
  text-align: var(--text-start);
}

/* Logical property utilities */
.text-start {
  text-align: var(--text-start) !important;
}

.text-end {
  text-align: var(--text-end) !important;
}

.margin-start-auto {
  margin-inline-start: auto !important;
}

.margin-end-auto {
  margin-inline-end: auto !important;
}

/* ========== ACCESSIBILITY ========== */
/* Removed skip link */

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.01ms !important;
  }
  
  .preloader-logo {
    animation: none !important;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  #vue-app.default-layout {
    background: linear-gradient(135deg, #1a120b 0%, #0a0a0a 100%);
    color: #f4e7c1;
  }
  
  h1, h2, h3, h4, h5, h6 {
    color: #f4e7c1;
  }
}

/* ========== UTILITY CLASSES ========== */
/* Mobile Viewport Height Fix */
.min-h-screen-mobile {
  min-height: 100vh;
  min-height: 100dvh;
  min-height: -webkit-fill-available;
}

/* Safe area utilities */
.safe-bottom {
  padding-bottom: var(--safe-area-inset-bottom);
}

.safe-top {
  padding-top: var(--safe-area-inset-top);
}

/* Stacking Context */
.fixed {
  position: fixed;
}

.absolute {
  position: absolute;
}

.relative {
  position: relative;
}

.z-10 { z-index: 10; }
.z-20 { z-index: 20; }
.z-30 { z-index: 30; }
.z-40 { z-index: 40; }
.z-50 { z-index: 50; }
.z-[100] { z-index: 100; }

/* Content visibility for performance */
.content-visibility-auto {
  content-visibility: auto;
  contain-intrinsic-size: 0 300px;
}

@media (min-width: 768px) {
  .content-visibility-auto {
    contain-intrinsic-size: 0 500px;
  }
}

/* Admin utility classes */
.bg-gradient-gold {
  background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
}

.text-primary-500 {
  color: var(--color-primary-500);
}

.text-primary-600 {
  color: var(--color-primary-600);
}

.hover\:text-primary-600:hover {
  color: var(--color-primary-600);
}

.hover\:text-primary-700:hover {
  color: var(--color-primary-700);
}

.bg-primary-100 {
  background-color: rgba(59, 130, 246, 0.1);
}

.text-primary-600 {
  color: var(--color-primary-500);
}

/* Admin layout specific */
.admin-app-wrapper {
  display: flex;
  min-height: 100vh;
  min-height: 100dvh;
}

.admin-login-wrapper {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>

<style scoped>
/* ========== APP-SPECIFIC STYLES - OPTIMIZED SPACING ========== */
/* Main Content Area - Default Layout */
.main-content {
  min-height: calc(100dvh - var(--header-height));
  position: relative;
  padding-top: 0;
  margin: 0;
  width: 100%;
}

/* Luxury Loading Overlay - now matches preloader */
.luxury-loading-overlay {
  background: #0a0a0a;
  backdrop-filter: none;
}

/* Safe area support */
.LuxuryCartSidebar,
.LuxurySearchModal,
.LuxuryNotificationCenter,
.luxury-loading-overlay {
  padding-top: var(--safe-area-inset-top);
  padding-bottom: var(--safe-area-inset-bottom);
  padding-left: var(--safe-area-inset-left);
  padding-right: var(--safe-area-inset-right);
}

/* Container utilities - Optimized spacing */
.luxury-container {
  width: 100%;
  max-width: min(1400px, 95vw);
  margin-inline: auto;
  padding-inline: 1rem;
}

@media (min-width: 640px) {
  .luxury-container {
    padding-inline: 1.5rem;
  }
}

@media (min-width: 768px) {
  .luxury-container {
    padding-inline: 2rem;
  }
}

@media (min-width: 1024px) {
  .luxury-container {
    padding-inline: 2.5rem;
  }
}

/* Section spacing utilities */
.section {
  margin-bottom: 2rem;
  padding: 1.5rem 0;
}

@media (min-width: 768px) {
  .section {
    margin-bottom: 3rem;
    padding: 2rem 0;
  }
}

@media (min-width: 1024px) {
  .section {
    margin-bottom: 4rem;
    padding: 2.5rem 0;
  }
}

/* Grid gap utilities */
.grid-gap {
  gap: 1rem;
}

@media (min-width: 768px) {
  .grid-gap {
    gap: 1.25rem;
  }
}

@media (min-width: 1024px) {
  .grid-gap {
    gap: 1.5rem;
  }
}

/* Color Utilities */
.text-gold-light {
  color: #f4e7c1;
}

/* Admin content specific */
.admin-content {
  max-width: 100%;
  overflow-x: hidden;
}

/* Better touch targets for mobile */
@media (max-width: 640px) {
  button:not(.no-mobile-scale),
  a:not(.no-mobile-scale) {
    min-height: 44px;
    min-width: 44px;
  }
}

/* Improve dropdown scroll on mobile */
@media (max-width: 640px) {
  [class*="dropdown"] {
    -webkit-overflow-scrolling: touch;
  }
}

/* Dark mode styles for admin */
:global(.dark) .admin-app-wrapper {
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

/* Smooth sidebar transitions */
.sidebar-transition {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Ensure proper scrolling in admin main content */
.admin-layout main {
  height: calc(100vh - 64px - 56px); /* Viewport - Header - Footer */
}
</style>
