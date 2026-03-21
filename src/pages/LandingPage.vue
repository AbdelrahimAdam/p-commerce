<template>
  <div class="landing-page" :class="{ 'rtl': isRTL }" dir="auto">
    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 bg-cover bg-center bg-no-repeat"
           style="background-image: url('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1350&q=80');">
      </div>
      <div class="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>

      <div class="container mx-auto px-4 py-20 md:py-32 relative z-10 text-center">
        <h1 class="text-4xl md:text-6xl font-display-en font-bold text-white mb-6">
          P.comerce
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

    <!-- Features -->
    <section class="py-16 md:py-24 bg-white">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-display-en font-bold text-gray-800 mb-4">
            {{ t('featuresTitle') }}
          </h2>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">

          <!-- Multiple Brands -->
          <div class="feature-card rounded-2xl p-5 md:p-6 text-center">
            <div class="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden shadow-md">
              <img src="https://images.unsplash.com/photo-1556745757-8d76bdb6984b?auto=format&fit=crop&w=150&h=150&q=80"
                   alt="Brands" class="w-full h-full object-cover">
            </div>
            <h3 class="text-lg md:text-xl font-bold text-gray-800 mb-2">{{ t('featureMultiTenant') }}</h3>
            <p class="text-sm md:text-base text-gray-600">{{ t('featureMultiTenantDesc') }}</p>
          </div>

          <!-- Product Management -->
          <div class="feature-card rounded-2xl p-5 md:p-6 text-center">
            <div class="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden shadow-md">
              <img src="https://images.unsplash.com/photo-1586880244406-556ebe35f282?auto=format&fit=crop&w=150&h=150&q=80"
                   alt="Product" class="w-full h-full object-cover">
            </div>
            <h3 class="text-lg md:text-xl font-bold text-gray-800 mb-2">{{ t('featureProductMgmt') }}</h3>
            <p class="text-sm md:text-base text-gray-600">{{ t('featureProductMgmtDesc') }}</p>
          </div>

          <!-- Multilingual -->
          <div class="feature-card rounded-2xl p-5 md:p-6 text-center">
            <div class="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden shadow-md">
              <img src="https://images.unsplash.com/photo-1526378722484-cc5c5103b1c5?auto=format&fit=crop&w=150&h=150&q=80"
                   alt="Languages" class="w-full h-full object-cover">
            </div>
            <h3 class="text-lg md:text-xl font-bold text-gray-800 mb-2">{{ t('featureMultiLang') }}</h3>
            <p class="text-sm md:text-base text-gray-600">{{ t('featureMultiLangDesc') }}</p>
          </div>

          <!-- Cart -->
          <div class="feature-card rounded-2xl p-5 md:p-6 text-center">
            <div class="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden shadow-md">
              <img src="https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=150&h=150&q=80"
                   alt="Cart" class="w-full h-full object-cover">
            </div>
            <h3 class="text-lg md:text-xl font-bold text-gray-800 mb-2">{{ t('featureCart') }}</h3>
            <p class="text-sm md:text-base text-gray-600">{{ t('featureCartDesc') }}</p>
          </div>

          <!-- Dashboard -->
          <div class="feature-card rounded-2xl p-5 md:p-6 text-center">
            <div class="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden shadow-md">
              <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=150&h=150&q=80"
                   alt="Dashboard" class="w-full h-full object-cover">
            </div>
            <h3 class="text-lg md:text-xl font-bold text-gray-800 mb-2">{{ t('featureAdmin') }}</h3>
            <p class="text-sm md:text-base text-gray-600">{{ t('featureAdminDesc') }}</p>
          </div>

          <!-- Custom URL -->
          <div class="feature-card rounded-2xl p-5 md:p-6 text-center">
            <div class="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden shadow-md">
              <img src="https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=150&h=150&q=80"
                   alt="URL" class="w-full h-full object-cover">
            </div>
            <h3 class="text-lg md:text-xl font-bold text-gray-800 mb-2">{{ t('featureSubdomain') }}</h3>
            <p class="text-sm md:text-base text-gray-600">{{ t('featureSubdomainDesc') }}</p>
          </div>

        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-16 md:py-24 bg-gradient-to-r from-amber-600 to-amber-700 text-white">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl md:text-4xl font-display-en font-bold mb-4">
          {{ t('ctaTitle') }}
        </h2>
        <p class="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
          {{ t('ctaSubtitle') }}
        </p>
        <router-link
          to="/register-company"
          class="inline-flex items-center justify-center px-8 py-4 bg-white text-amber-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
        >
          {{ t('ctaButton') }}
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useLanguageStore } from '@/stores/language'
const { t, isRTL } = useLanguageStore()
</script>

<style scoped>
.rtl {
  direction: rtl;
  text-align: right;
}

.feature-card {
  transition: all 0.3s ease;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}
</style>