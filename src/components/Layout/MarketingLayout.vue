<!-- src/components/Layout/MarketingLayout.vue -->
<template>
  <div class="landing-layout" :class="{ 'rtl': isRTL }" :dir="direction">
    <!-- Sticky Header -->
    <header
      ref="headerRef"
      :class="[
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-800/50'
          : 'bg-transparent'
      ]"
    >
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16 md:h-20">
          <!-- Logo -->
          <router-link
            to="/"
            class="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight transition-colors duration-200"
            :class="isScrolled ? 'text-amber-400' : 'text-white hover:text-amber-400'"
          >
            P.COMMERCE
          </router-link>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center gap-6">
            <button
              @click="handleLanguageToggle"
              class="text-sm font-medium transition-colors duration-200"
              :class="isScrolled ? 'text-gray-300 hover:text-amber-400' : 'text-gray-200 hover:text-white'"
              :aria-label="currentLanguage === 'en' ? 'Switch to Arabic' : 'Switch to English'"
            >
              {{ currentLanguage === 'en' ? 'العربية' : 'English' }}
            </button>
            <router-link
              to="/login"
              class="text-sm font-medium transition-colors duration-200"
              :class="isScrolled ? 'text-gray-300 hover:text-amber-400' : 'text-gray-200 hover:text-white'"
            >
              {{ t('login') }}
            </router-link>
            <router-link
              to="/register-company"
              class="bg-amber-500 text-gray-900 px-5 py-2 rounded-lg hover:bg-amber-400 transition-all duration-200 shadow-sm font-semibold transform hover:scale-105"
            >
              {{ t('startStore') }}
            </router-link>
          </div>

          <!-- Mobile Menu Button -->
          <button
            @click="toggleMobileMenu"
            class="md:hidden p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors duration-200"
            :class="isScrolled ? 'text-gray-300 hover:bg-gray-800' : 'text-white hover:bg-white/10'"
            aria-label="Toggle menu"
            :aria-expanded="mobileMenuOpen"
          >
            <svg
              v-if="!mobileMenuOpen"
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg
              v-else
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Mobile Menu Dropdown -->
        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform -translate-y-2 opacity-0"
          enter-to-class="transform translate-y-0 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="transform translate-y-0 opacity-100"
          leave-to-class="transform -translate-y-2 opacity-0"
        >
          <div v-if="mobileMenuOpen" class="md:hidden py-4 border-t border-gray-800/50">
            <div class="flex flex-col space-y-2">
              <button
                @click="handleMobileLanguageToggle"
                class="text-left px-3 py-2.5 text-gray-300 hover:text-amber-400 hover:bg-gray-800/50 rounded-lg transition-colors duration-200"
              >
                {{ currentLanguage === 'en' ? 'العربية' : 'English' }}
              </button>
              <router-link
                to="/login"
                class="px-3 py-2.5 text-gray-300 hover:text-amber-400 hover:bg-gray-800/50 rounded-lg transition-colors duration-200"
                @click="closeMobileMenu"
              >
                {{ t('login') }}
              </router-link>
              <router-link
                to="/register-company"
                class="px-3 py-2.5 text-amber-400 font-medium hover:bg-gray-800/50 rounded-lg transition-colors duration-200"
                @click="closeMobileMenu"
              >
                {{ t('startStore') }}
              </router-link>
            </div>
          </div>
        </transition>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900/95 backdrop-blur-sm text-gray-400 py-8 border-t border-gray-800/50">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div class="text-sm">
            &copy; {{ new Date().getFullYear() }} P.COMMERCE. {{ t('allRightsReserved') }}
          </div>
          <div class="flex flex-wrap justify-center gap-4 md:gap-6 text-sm">
            <router-link to="/privacy" class="hover:text-white transition-colors duration-200">
              {{ t('privacyPolicy') }}
            </router-link>
            <router-link to="/terms" class="hover:text-white transition-colors duration-200">
              {{ t('termsOfService') }}
            </router-link>
            <router-link to="/contact" class="hover:text-white transition-colors duration-200">
              {{ t('contactUs') }}
            </router-link>
          </div>
        </div>
      </div>
    </footer>

    <!-- Backdrop for mobile menu -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="mobileMenuOpen"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
        @click="closeMobileMenu"
        aria-hidden="true"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()
const { currentLanguage, toggleLanguage, t, isRTL, direction } = languageStore

const mobileMenuOpen = ref(false)
const isScrolled = ref(false)

let scrollTimeout: ReturnType<typeof setTimeout>

const handleScroll = () => {
  // Throttle scroll events for better performance
  if (scrollTimeout) clearTimeout(scrollTimeout)
  scrollTimeout = setTimeout(() => {
    isScrolled.value = window.scrollY > 20
  }, 10)
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
  // Prevent body scroll when menu is open
  if (mobileMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
  document.body.style.overflow = ''
}

const handleLanguageToggle = () => {
  toggleLanguage()
  // Update document direction - use the direction computed property
  document.documentElement.dir = direction.value
}

const handleMobileLanguageToggle = () => {
  handleLanguageToggle()
  closeMobileMenu()
}

// Close mobile menu on window resize if screen becomes desktop
const handleResize = () => {
  if (window.innerWidth >= 768 && mobileMenuOpen.value) {
    closeMobileMenu()
  }
}

// Update document attributes when language changes
watch(currentLanguage, () => {
  document.documentElement.dir = direction.value
  document.documentElement.lang = currentLanguage.value
}, { immediate: true })

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', handleResize)
  handleScroll()
  // Set initial document attributes
  document.documentElement.dir = direction.value
  document.documentElement.lang = currentLanguage.value
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleResize)
  document.body.style.overflow = ''
  if (scrollTimeout) clearTimeout(scrollTimeout)
})
</script>

<style scoped>
.landing-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #0f0f0f;
  position: relative;
}

.flex-1 {
  flex: 1 1 0%;
  min-height: 0; /* Fix for flex children overflow */
}

/* Smooth transitions */
.transition-all,
.transition-colors,
.transition-transform {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* RTL Support */
.rtl {
  direction: rtl;
}

.rtl .flex,
.rtl .flex-col,
.rtl .flex-row {
  direction: rtl;
}

.rtl .space-x-6 > :not([hidden]) ~ :not([hidden]) {
  --tw-space-x-reverse: 1;
}

.rtl .text-left {
  text-align: right;
}

/* Mobile menu backdrop */
.backdrop-blur-sm {
  backdrop-filter: blur(8px);
}

/* Focus styles for accessibility */
*:focus-visible {
  outline: 2px solid #fbbf24;
  outline-offset: 2px;
  border-radius: 2px;
}

/* Touch-friendly tap targets on mobile */
@media (max-width: 768px) {
  .px-3 {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
  
  .py-2\.5 {
    padding-top: 0.625rem;
    padding-bottom: 0.625rem;
  }
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>