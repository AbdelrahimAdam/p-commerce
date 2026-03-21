<template>
  <div class="landing-page" :class="{ 'rtl': isRTL }" dir="auto">
    <!-- Hero Section with Luxury Perfume Image -->
    <section class="relative overflow-hidden">
      <!-- Background Image with Overlay -->
      <div 
        class="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style="background-image: url('https://images.unsplash.com/photo-1541643602-6c0fd82e9d30?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80');"
      ></div>
      <div class="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>
      <div class="container mx-auto px-4 py-20 md:py-32 relative z-10 text-center">
        <h1 class="text-4xl md:text-6xl font-display-en font-bold text-white mb-6">
          {{ t('heroTitle') }}
          <span class="text-amber-400">{{ t('heroHighlight') }}</span>
        </h1>
        <p class="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed max-w-3xl mx-auto">
          {{ t('heroSubtitle') }}
        </p>
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <router-link
            to="/register-company"
            class="inline-flex items-center justify-center px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
          >
            {{ t('startStore') }}
            <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </router-link>
          <router-link
            to="/brands"
            class="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/30 hover:bg-white/20 transition-colors"
          >
            {{ t('exploreDemo') }}
          </router-link>
        </div>
      </div>
    </section>

    <!-- Features Section – Two‑column cards on mobile -->
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
        <div class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          <!-- 1. Multiple Brands -->
          <div class="bg-gray-50 rounded-2xl p-5 md:p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div class="w-14 h-14 md:w-16 md:h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7 md:w-8 md:h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 class="text-lg md:text-xl font-bold text-gray-900 mb-2">{{ t('featureMultiTenant') }}</h3>
            <p class="text-sm md:text-base text-gray-600">{{ t('featureMultiTenantDesc') }}</p>
          </div>

          <!-- 2. Product Management -->
          <div class="bg-gray-50 rounded-2xl p-5 md:p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div class="w-14 h-14 md:w-16 md:h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7 md:w-8 md:h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-lg md:text-xl font-bold text-gray-900 mb-2">{{ t('featureProductMgmt') }}</h3>
            <p class="text-sm md:text-base text-gray-600">{{ t('featureProductMgmtDesc') }}</p>
          </div>

          <!-- 3. Multilingual Support -->
          <div class="bg-gray-50 rounded-2xl p-5 md:p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div class="w-14 h-14 md:w-16 md:h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7 md:w-8 md:h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <h3 class="text-lg md:text-xl font-bold text-gray-900 mb-2">{{ t('featureMultiLang') }}</h3>
            <p class="text-sm md:text-base text-gray-600">{{ t('featureMultiLangDesc') }}</p>
          </div>

          <!-- 4. Shopping Cart & Checkout -->
          <div class="bg-gray-50 rounded-2xl p-5 md:p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div class="w-14 h-14 md:w-16 md:h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7 md:w-8 md:h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 class="text-lg md:text-xl font-bold text-gray-900 mb-2">{{ t('featureCart') }}</h3>
            <p class="text-sm md:text-base text-gray-600">{{ t('featureCartDesc') }}</p>
          </div>

          <!-- 5. Admin Dashboard -->
          <div class="bg-gray-50 rounded-2xl p-5 md:p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div class="w-14 h-14 md:w-16 md:h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7 md:w-8 md:h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 class="text-lg md:text-xl font-bold text-gray-900 mb-2">{{ t('featureAdmin') }}</h3>
            <p class="text-sm md:text-base text-gray-600">{{ t('featureAdminDesc') }}</p>
          </div>

          <!-- 6. Custom Brand URL -->
          <div class="bg-gray-50 rounded-2xl p-5 md:p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div class="w-14 h-14 md:w-16 md:h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7 md:w-8 md:h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-lg md:text-xl font-bold text-gray-900 mb-2">{{ t('featureSubdomain') }}</h3>
            <p class="text-sm md:text-base text-gray-600">{{ t('featureSubdomainDesc') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="py-16 md:py-24 bg-gray-100">
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
            <div class="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-amber-600">1</div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">{{ t('step1Title') }}</h3>
            <p class="text-gray-600">{{ t('step1Desc') }}</p>
          </div>
          <div class="text-center">
            <div class="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-amber-600">2</div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">{{ t('step2Title') }}</h3>
            <p class="text-gray-600">{{ t('step2Desc') }}</p>
          </div>
          <div class="text-center">
            <div class="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-amber-600">3</div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">{{ t('step3Title') }}</h3>
            <p class="text-gray-600">{{ t('step3Desc') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section with Gold Gradient -->
    <section class="py-16 md:py-24 bg-gradient-to-r from-amber-500 to-amber-600 text-white">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl md:text-4xl font-display-en font-bold mb-4">
          {{ t('ctaTitle') }}
        </h2>
        <p class="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
          {{ t('ctaSubtitle') }}
        </p>
        <router-link
          to="/register-company"
          class="inline-flex items-center justify-center px-8 py-4 bg-white text-amber-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
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
const { t, isRTL } = languageStore
</script>

<style scoped>
/* Direction adjustments */
.rtl {
  direction: rtl;
  text-align: right;
}

/* SVG arrow direction in RTL */
.rtl svg.ml-2 {
  margin-left: 0;
  margin-right: 0.5rem;
  transform: scaleX(-1);
}

/* Feature cards: ensure consistent height on all screen sizes */
.feature-card {
  transition: all 0.3s ease;
}
.feature-card:hover {
  transform: translateY(-2px);
}

/* Responsive grid gap adjustments */
@media (max-width: 640px) {
  .grid {
    gap: 1rem;
  }
}
</style>