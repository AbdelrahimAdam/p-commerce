<template>
  <div class="landing-page" :class="{ 'rtl': isRTL }" dir="auto">
    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 bg-cover bg-center bg-no-repeat"
           style="background-image: url('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1350&q=80');">
      </div>
      <div class="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>
      <div class="container mx-auto px-4 py-20 md:py-32 relative z-10 text-center">
        <h1 class="text-4xl md:text-6xl font-bold text-white mb-6">
          {{ t('heroTitle') }}
          <span class="text-amber-400">{{ t('heroHighlight') }}</span>
        </h1>
        <p class="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
          {{ t('heroSubtitle') }}
        </p>
      </div>
    </section>

    <!-- Features -->
    <section class="py-16 bg-white">
      <div class="container mx-auto px-4 grid grid-cols-2 lg:grid-cols-3 gap-6">

        <!-- Multiple Brands -->
        <div class="feature-card">
          <img src="https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=400&q=80" />
          <h3>{{ t('featureMultiTenant') }}</h3>
          <p>{{ t('featureMultiTenantDesc') }}</p>
        </div>

        <!-- Product Management -->
        <div class="feature-card">
          <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80" />
          <h3>{{ t('featureProductMgmt') }}</h3>
          <p>{{ t('featureProductMgmtDesc') }}</p>
        </div>

        <!-- Multilingual -->
        <div class="feature-card">
          <img src="https://images.unsplash.com/photo-1529078155058-5d716f45d604?auto=format&fit=crop&w=400&q=80" />
          <h3>{{ t('featureMultiLang') }}</h3>
          <p>{{ t('featureMultiLangDesc') }}</p>
        </div>

        <!-- Cart -->
        <div class="feature-card">
          <img src="https://images.unsplash.com/photo-1616627981450-2f8c2c4e1c1c?auto=format&fit=crop&w=400&q=80" />
          <h3>{{ t('featureCart') }}</h3>
          <p>{{ t('featureCartDesc') }}</p>
        </div>

        <!-- Dashboard -->
        <div class="feature-card">
          <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80" />
          <h3>{{ t('featureAdmin') }}</h3>
          <p>{{ t('featureAdminDesc') }}</p>
        </div>

        <!-- Custom URL -->
        <div class="feature-card">
          <img src="https://images.unsplash.com/photo-1596526131083-e8c633c948d2?auto=format&fit=crop&w=400&q=80" />
          <h3>{{ t('featureSubdomain') }}</h3>
          <p>{{ t('featureSubdomainDesc') }}</p>
        </div>

      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useLanguageStore } from '@/stores/language'
const { t, isRTL } = useLanguageStore()
</script>

<style scoped>
.feature-card {
  background: #f9fafb;
  padding: 16px;
  border-radius: 16px;
  text-align: center;
}
.feature-card img {
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 10px;
}
</style>