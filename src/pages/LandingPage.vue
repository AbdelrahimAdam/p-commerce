<!-- src/pages/LandingPage.vue -->
<template>
  <div class="landing-page" :class="{ 'rtl': isRTL }" dir="auto">
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-br from-amber-50 via-white to-amber-50 overflow-hidden">
      <div class="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5"></div>
      <div class="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div class="text-center max-w-4xl mx-auto">
          <h1 class="text-4xl md:text-6xl font-display-en font-bold text-gray-900 mb-6">
            {{ t('heroTitle') }}
            <span class="text-primary-500">{{ t('heroHighlight') }}</span>
          </h1>
          <p class="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
            {{ t('heroSubtitle') }}
          </p>
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <router-link
              to="/register-company"
              class="inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
            >
              {{ t('startStore') }}
              <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </router-link>
            <router-link
              to="/shop"
              class="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:border-primary-500 hover:text-primary-600 transition-colors"
            >
              {{ t('exploreDemo') }}
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 md:py-24 bg-white">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-display-en font-bold text-gray-900 mb-4">
            {{ t('featuresTitle') }}
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            {{ t('featuresSubtitle') }}
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
            <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">{{ t('featureMultiTenant') }}</h3>
            <p class="text-gray-600">{{ t('featureMultiTenantDesc') }}</p>
          </div>
          <div class="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
            <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">{{ t('featureMultiLang') }}</h3>
            <p class="text-gray-600">{{ t('featureMultiLangDesc') }}</p>
          </div>
          <div class="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
            <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">{{ t('featureProductMgmt') }}</h3>
            <p class="text-gray-600">{{ t('featureProductMgmtDesc') }}</p>
          </div>
          <div class="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
            <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">{{ t('featureCart') }}</h3>
            <p class="text-gray-600">{{ t('featureCartDesc') }}</p>
          </div>
          <div class="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
            <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">{{ t('featureAdmin') }}</h3>
            <p class="text-gray-600">{{ t('featureAdminDesc') }}</p>
          </div>
          <div class="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
            <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">{{ t('featureSubdomain') }}</h3>
            <p class="text-gray-600">{{ t('featureSubdomainDesc') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="py-16 md:py-24 bg-gray-50">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-display-en font-bold text-gray-900 mb-4">
            {{ t('stepsTitle') }}
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            {{ t('stepsSubtitle') }}
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-primary-600">1</div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">{{ t('step1Title') }}</h3>
            <p class="text-gray-600">{{ t('step1Desc') }}</p>
          </div>
          <div class="text-center">
            <div class="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-primary-600">2</div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">{{ t('step2Title') }}</h3>
            <p class="text-gray-600">{{ t('step2Desc') }}</p>
          </div>
          <div class="text-center">
            <div class="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-primary-600">3</div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">{{ t('step3Title') }}</h3>
            <p class="text-gray-600">{{ t('step3Desc') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 md:py-24 bg-primary-600 text-white">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl md:text-4xl font-display-en font-bold mb-4">
          {{ t('ctaTitle') }}
        </h2>
        <p class="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
          {{ t('ctaSubtitle') }}
        </p>
        <router-link
          to="/register-company"
          class="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
        >
          {{ t('ctaButton') }}
          <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </router-link>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-gray-400 py-8">
      <div class="container mx-auto px-4 text-center">
        <p>&copy; {{ new Date().getFullYear() }} P.NOTES. {{ t('allRightsReserved') }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()
const { isRTL, t } = languageStore
</script>

<style scoped>
.rtl {
  direction: rtl;
  text-align: right;
}

/* Adjust SVG arrows for RTL */
.rtl svg.ml-2 {
  margin-left: 0;
  margin-right: 0.5rem;
  transform: scaleX(-1);
}

.rtl .flex-row-reverse {
  flex-direction: row-reverse;
}

/* Keep arrow direction in hero and CTA for RTL */
.rtl .hero-arrow svg {
  transform: scaleX(-1);
}
</style>