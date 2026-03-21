<!-- src/components/Layout/LandingLayout.vue -->
<template>
  <div class="landing-layout">
    <!-- Sticky Header (transparent on top, solid on scroll) -->
    <header
      ref="headerRef"
      :class="[
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-gray-900/95 backdrop-blur-sm shadow-lg'
          : 'bg-transparent'
      ]"
    >
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16 md:h-20">
          <!-- Logo -->
          <router-link
            to="/"
            class="text-2xl md:text-3xl font-bold tracking-tight"
            :class="isScrolled ? 'text-amber-400' : 'text-white'"
          >
            P.COMMERCE
          </router-link>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center space-x-6">
            <button
              @click="toggleLanguage"
              class="text-sm transition-colors"
              :class="isScrolled ? 'text-gray-300 hover:text-amber-400' : 'text-gray-200 hover:text-white'"
            >
              {{ currentLanguage === 'en' ? 'العربية' : 'English' }}
            </button>
            <router-link
              to="/login"
              class="transition-colors"
              :class="isScrolled ? 'text-gray-300 hover:text-amber-400' : 'text-gray-200 hover:text-white'"
            >
              {{ t('login') }}
            </router-link>
            <router-link
              to="/register-company"
              class="bg-amber-500 text-gray-900 px-5 py-2 rounded-lg hover:bg-amber-400 transition-colors shadow-sm font-semibold"
            >
              {{ t('startStore') }}
            </router-link>
          </div>

          <!-- Mobile Menu Button -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden p-2 rounded-lg focus:outline-none transition-colors"
            :class="isScrolled ? 'text-gray-300 hover:bg-gray-800' : 'text-white hover:bg-white/10'"
            aria-label="Toggle menu"
          >
            <svg
              v-if="!mobileMenuOpen"
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg
              v-else
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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
          <div v-if="mobileMenuOpen" class="md:hidden py-4 border-t border-gray-800">
            <div class="flex flex-col space-y-3">
              <button
                @click="toggleLanguage"
                class="text-left px-2 py-2 text-gray-300 hover:text-amber-400 hover:bg-gray-800 rounded-lg transition-colors"
              >
                {{ currentLanguage === 'en' ? 'العربية' : 'English' }}
              </button>
              <router-link
                to="/login"
                class="px-2 py-2 text-gray-300 hover:text-amber-400 hover:bg-gray-800 rounded-lg transition-colors"
                @click="mobileMenuOpen = false"
              >
                {{ t('login') }}
              </router-link>
              <router-link
                to="/register-company"
                class="px-2 py-2 text-amber-400 font-medium hover:bg-gray-800 rounded-lg transition-colors"
                @click="mobileMenuOpen = false"
              >
                {{ t('startStore') }}
              </router-link>
            </div>
          </div>
        </transition>
      </div>
    </header>

    <!-- Main Content (adds padding-top to avoid being hidden under fixed header) -->
    <main class="flex-1 pt-16 md:pt-20">
      <slot />
    </main>

    <!-- Footer (dark theme, matching landing page) -->
    <footer class="bg-gray-900 text-gray-400 py-8 border-t border-gray-800">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div class="text-sm">
            &copy; {{ new Date().getFullYear() }} P.COMMERCE. {{ t('allRightsReserved') }}
          </div>
          <div class="flex space-x-6 text-sm">
            <router-link to="/privacy" class="hover:text-white transition-colors">
              {{ t('privacyPolicy') }}
            </router-link>
            <router-link to="/terms" class="hover:text-white transition-colors">
              {{ t('termsOfService') }}
            </router-link>
            <router-link to="/contact" class="hover:text-white transition-colors">
              {{ t('contactUs') }}
            </router-link>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()
const { currentLanguage, toggleLanguage, t } = languageStore

const mobileMenuOpen = ref(false)
const isScrolled = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.landing-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #0f0f0f; /* match landing page background */
}

/* Ensure the main content expands to push footer down */
.flex-1 {
  flex: 1 1 0%;
}

/* Smooth transitions for header */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style>