<template>
  <div class="landing-page bg-[#0f0f0f] text-white" :class="{ 'rtl': isRTL }" dir="auto">
    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1600&q=80"
          class="w-full h-full object-cover opacity-40"
          alt="Perfume bottles"
        />
      </div>
      <div class="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black"></div>

      <div class="container mx-auto px-4 py-28 text-center relative z-10">
        <h1 class="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          {{ t('heroTitle') }}
          <span class="text-amber-400"> {{ t('heroHighlight') }} </span>
        </h1>

        <p class="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10">
          {{ t('heroSubtitle') }}
        </p>

        <div class="flex justify-center gap-4 flex-wrap">
          <router-link
            to="/register-company"
            class="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl shadow-lg transition"
          >
            {{ t('startStore') }}
          </router-link>

          <router-link
            to="/brands"
            class="px-8 py-4 border border-amber-400 text-amber-400 rounded-xl hover:bg-amber-400 hover:text-black transition"
          >
            {{ t('exploreDemo') }}
          </router-link>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="py-20">
      <div class="container mx-auto px-4">
        <div class="text-center mb-14">
          <h2 class="text-3xl md:text-4xl font-bold text-amber-400 mb-3">
            {{ t('featuresTitle') }}
          </h2>
          <p class="text-gray-400 max-w-xl mx-auto">
            {{ t('featuresSubtitle') }}
          </p>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Feature Card 1: Multiple Brands -->
          <div class="feature-card">
            <img
              src="https://images.unsplash.com/photo-1615634262417-6c9f5f4b0c5c?auto=format&fit=crop&w=400&q=80"
              alt="Brand logos"
            />
            <h3>{{ t('featureMultiTenant') }}</h3>
            <p>{{ t('featureMultiTenantDesc') }}</p>
          </div>

          <!-- Feature Card 2: Product Management -->
          <div class="feature-card">
            <img
              src="https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?auto=format&fit=crop&w=400&q=80"
              alt="Perfume bottles"
            />
            <h3>{{ t('featureProductMgmt') }}</h3>
            <p>{{ t('featureProductMgmtDesc') }}</p>
          </div>

          <!-- Feature Card 3: Multilingual Support -->
          <div class="feature-card">
            <img
              src="https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=400&q=80"
              alt="Languages"
            />
            <h3>{{ t('featureMultiLang') }}</h3>
            <p>{{ t('featureMultiLangDesc') }}</p>
          </div>

          <!-- Feature Card 4: Shopping Cart & Checkout -->
          <div class="feature-card">
            <img
              src="https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=400&q=80"
              alt="Shopping cart"
            />
            <h3>{{ t('featureCart') }}</h3>
            <p>{{ t('featureCartDesc') }}</p>
          </div>

          <!-- Feature Card 5: Admin Dashboard -->
          <div class="feature-card">
            <img
              src="https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=400&q=80"
              alt="Admin dashboard"
            />
            <h3>{{ t('featureAdmin') }}</h3>
            <p>{{ t('featureAdminDesc') }}</p>
          </div>

          <!-- Feature Card 6: Custom Brand URL -->
          <div class="feature-card">
            <img
              src="https://images.unsplash.com/photo-1591696331111-ef9586a5b17f?auto=format&fit=crop&w=400&q=80"
              alt="Custom URL"
            />
            <h3>{{ t('featureSubdomain') }}</h3>
            <p>{{ t('featureSubdomainDesc') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works (optional, keep if needed) -->
    <section class="py-16 bg-[#1a1a1a]">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl md:text-4xl font-bold text-amber-400 mb-12">
          {{ t('stepsTitle') }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-[#0f0f0f] p-6 rounded-xl border border-gray-800">
            <div class="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-black">1</div>
            <h3 class="text-xl font-bold text-white mb-2">{{ t('step1Title') }}</h3>
            <p class="text-gray-400">{{ t('step1Desc') }}</p>
          </div>
          <div class="bg-[#0f0f0f] p-6 rounded-xl border border-gray-800">
            <div class="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-black">2</div>
            <h3 class="text-xl font-bold text-white mb-2">{{ t('step2Title') }}</h3>
            <p class="text-gray-400">{{ t('step2Desc') }}</p>
          </div>
          <div class="bg-[#0f0f0f] p-6 rounded-xl border border-gray-800">
            <div class="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-black">3</div>
            <h3 class="text-xl font-bold text-white mb-2">{{ t('step3Title') }}</h3>
            <p class="text-gray-400">{{ t('step3Desc') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-20 bg-gradient-to-r from-amber-600 to-yellow-500 text-black text-center">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl md:text-4xl font-bold mb-4">
          {{ t('ctaTitle') }}
        </h2>
        <p class="mb-8 text-lg">
          {{ t('ctaSubtitle') }}
        </p>
        <router-link
          to="/register-company"
          class="px-10 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-900 transition"
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
/* Card Style */
.feature-card {
  background: #1a1a1a;
  border: 1px solid rgba(251, 191, 36, 0.2);
  padding: 1rem;
  border-radius: 1rem;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 10px 30px rgba(251, 191, 36, 0.2);
}

.feature-card img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 0.75rem;
  margin-bottom: 0.75rem;
}

.feature-card h3 {
  color: #fbbf24;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.feature-card p {
  color: #9ca3af;
  font-size: 0.875rem;
  line-height: 1.4;
}

/* RTL */
.rtl {
  direction: rtl;
  text-align: right;
}
</style>