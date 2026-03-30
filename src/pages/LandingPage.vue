<template>
  <div class="landing-page bg-[#0f0f0f] text-white" :class="{ 'rtl': isRTL }" dir="auto">
    <!-- Hero Section -->
    <section class="relative overflow-hidden min-h-[85vh] flex items-center">
      <div class="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=1600&q=80"
          class="w-full h-full object-cover opacity-30 scale-105"
          alt="Luxury perfume bottles"
          loading="eager"
        />
      </div>
      <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black"></div>

      <div class="container mx-auto px-6 relative z-10 mt-16 md:mt-20">
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-[1.2]">
            {{ t('heroTitle') }}
            <span class="text-amber-400 block sm:inline mt-2 sm:mt-0">
              {{ t('heroHighlight') }}
            </span>
          </h1>

          <p class="text-gray-300 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 md:mb-12 px-4">
            {{ t('heroSubtitle') }}
          </p>

          <div class="flex flex-col sm:flex-row justify-center gap-4 px-4">
            <router-link
              to="/register-company"
              class="px-6 sm:px-8 py-3 sm:py-4 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 text-center"
            >
              {{ t('startStore') }}
            </router-link>

            <router-link
              to="/brands"
              class="px-6 sm:px-8 py-3 sm:py-4 border-2 border-amber-400 text-amber-400 rounded-xl hover:bg-amber-400 hover:text-black transition-all duration-300 text-center font-medium"
            >
              {{ t('exploreDemo') }}
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="py-16 md:py-24">
      <div class="container mx-auto px-6">
        <div class="text-center mb-12 md:mb-16">
          <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-amber-400 mb-3">
            {{ t('featuresTitle') }}
          </h2>
          <p class="text-gray-400 text-sm sm:text-base max-w-xl mx-auto px-4">
            {{ t('featuresSubtitle') }}
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          <div v-for="(feature, index) in features" :key="index" class="feature-card group">
            <div class="feature-image-wrapper">
              <img
                :src="feature.image"
                :alt="feature.title"
                class="feature-image"
                loading="lazy"
              />
            </div>

            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Steps -->
    <section class="py-16 md:py-20 bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f]">
      <div class="container mx-auto px-6">
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-amber-400 text-center mb-10 md:mb-14">
          {{ t('stepsTitle') }}
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          <div v-for="(step, index) in steps" :key="index" class="step-card">
            <div class="step-number">{{ index + 1 }}</div>
            <h3 class="step-title">{{ step.title }}</h3>
            <p class="step-description">{{ step.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-16 md:py-20 bg-gradient-to-r from-amber-600 to-amber-500 text-black text-center">
      <div class="container mx-auto px-6">
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">
          {{ t('ctaTitle') }}
        </h2>

        <p class="mb-6 md:mb-8 text-base sm:text-lg text-black/80 max-w-xl mx-auto">
          {{ t('ctaSubtitle') }}
        </p>

        <router-link
          to="/register-company"
          class="inline-block px-8 md:px-10 py-3 md:py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-900 transition-all duration-300 transform hover:scale-105 shadow-lg"
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

const features = [
  {
    title: t('featureMultiTenant'),
    description: t('featureMultiTenantDesc'),
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: t('featureProductMgmt'),
    description: t('featureProductMgmtDesc'),
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: t('featureMultiLang'),
    description: t('featureMultiLangDesc'),
    image: 'https://images.unsplash.com/photo-1529336953121-ad5a0d43d0d2?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: t('featureCart'),
    description: t('featureCartDesc'),
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: t('featureAdmin'),
    description: t('featureAdminDesc'),
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: t('featureSubdomain'),
    description: t('featureSubdomainDesc'),
    image: 'https://images.unsplash.com/photo-1581092335878-2d9ff86ca2bf?auto=format&fit=crop&w=800&q=80'
  }
]

const steps = [
  { title: t('step1Title'), description: t('step1Desc') },
  { title: t('step2Title'), description: t('step2Desc') },
  { title: t('step3Title'), description: t('step3Desc') }
]
</script>