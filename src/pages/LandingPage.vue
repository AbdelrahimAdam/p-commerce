<template>
  <div class="landing-page" :class="{ 'rtl': isRTL }" dir="auto">
    <!-- Hero Section with Luxury Perfume Image -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 bg-cover bg-center bg-no-repeat"
           style="background-image: url('https://images.unsplash.com/photo-1541643602-6c0fd82e9d30?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80');">
      </div>
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
          <h2 class="text-3xl md:text-4xl font-display-en font-bold text-gray-800 mb-4">
            {{ t('featuresTitle') }}
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            {{ t('featuresSubtitle') }}
          </p>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          <!-- 1. Multiple Brands -->
          <div class="feature-card bg-gray-100 rounded-2xl p-5 md:p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div class="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden shadow-md">
              <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&h=150&q=80"
                   alt="Brands" class="w-full h-full object-cover">
            </div>
            <h3 class="text-lg md:text-xl font-bold text-gray-800 mb-2">{{ t('featureMultiTenant') }}</h3>
            <p class="text-sm md:text-base text-gray-600">{{ t('featureMultiTenantDesc') }}</p>
          </div>

          <!-- 2. Product Management -->
          <div class="feature-card bg-gray-100 rounded-2xl p-5 md:p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div class="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden shadow-md">
              <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&h=150&q=80"
                   alt="Product Management" class="w-full h-full object-cover">
            </div>
            <h3 class="text-lg md:text-xl font-bold text-gray-800 mb-2">{{ t('featureProductMgmt') }}</h3>
            <p class="text-sm md:text-base text-gray-600">{{ t('featureProductMgmtDesc') }}</p>
          </div>

          <!-- 3. Multilingual Support -->
          <div class="feature-card bg-gray-100 rounded-2xl p-5 md:p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div class="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden shadow-md">
              <img src="https://images.unsplash.com/photo-1525874684015-58379d421a52?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&h=150&q=80"
                   alt="Languages" class="w-full h-full object-cover">
            </div>
            <h3 class="text-lg md:text-xl font-bold text-gray-800 mb-2">{{ t('featureMultiLang') }}</h3>
            <p class="text-sm md:text-base text-gray-600">{{ t('featureMultiLangDesc') }}</p>
          </div>

          <!-- 4. Shopping Cart & Checkout -->
          <div class="feature-card bg-gray-100 rounded-2xl p-5 md:p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div class="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden shadow-md">
              <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&h=150&q=80"
                   alt="Cart" class="w-full h-full object-cover">
            </div>
            <h3 class="text-lg md:text-xl font-bold text-gray-800 mb-2">{{ t('featureCart') }}</h3>
            <p class="text-sm md:text-base text-gray-600">{{ t('featureCartDesc') }}</p>
          </div>

          <!-- 5. Admin Dashboard -->
          <div class="feature-card bg-gray-100 rounded-2xl p-5 md:p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div class="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden shadow-md">
              <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&h=150&q=80"
                   alt="Dashboard" class="w-full h-full object-cover">
            </div>
            <h3 class="text-lg md:text-xl font-bold text-gray-800 mb-2">{{ t('featureAdmin') }}</h3>
            <p class="text-sm md:text-base text-gray-600">{{ t('featureAdminDesc') }}</p>
          </div>

          <!-- 6. Custom Brand URL -->
          <div class="feature-card bg-gray-100 rounded-2xl p-5 md:p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div class="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden shadow-md">
              <img src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&h=150&q=80"
                   alt="URL" class="w-full h-full object-cover">
            </div>
            <h3 class="text-lg md:text-xl font-bold text-gray-800 mb-2">{{ t('featureSubdomain') }}</h3>
            <p class="text-sm md:text-base text-gray-600">{{ t('featureSubdomainDesc') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="py-16 md:py-24 bg-gray-50">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-display-en font-bold text-gray-800 mb-4">
            {{ t('stepsTitle') }}
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            {{ t('stepsSubtitle') }}
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-amber-600">1</div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">{{ t('step1Title') }}</h3>
            <p class="text-gray-600">{{ t('step1Desc') }}</p>
          </div>
          <div class="text-center">
            <div class="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-amber-600">2</div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">{{ t('step2Title') }}</h3>
            <p class="text-gray-600">{{ t('step2Desc') }}</p>
          </div>
          <div class="text-center">
            <div class="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-amber-600">3</div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">{{ t('step3Title') }}</h3>
            <p class="text-gray-600">{{ t('step3Desc') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section with Gold Gradient (improved contrast) -->
    <section class="py-16 md:py-24 bg-gradient-to-r from-amber-600 to-amber-700 text-white">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl md:text-4xl font-display-en font-bold mb-4 text-shadow">
          {{ t('ctaTitle') }}
        </h2>
        <p class="text-xl mb-8 opacity-90 max-w-2xl mx-auto text-shadow-sm">
          {{ t('ctaSubtitle') }}
        </p>
        <router-link
          to="/register-company"
          class="inline-flex items-center justify-center px-8 py-4 bg-white text-amber-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
        >
          {{ t('ctaButton') }}
          <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </router-link>
      </div>
    </section>
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

/* Feature card styles */
.feature-card {
  transition: all 0.3s ease;
  background-color: #f9fafb; /* even lighter grey */
  border: 1px solid #e5e7eb;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
}

/* Text shadows for better readability on gold background */
.text-shadow {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.text-shadow-sm {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Responsive grid gap */
@media (max-width: 640px) {
  .grid {
    gap: 1rem;
  }
}
</style>