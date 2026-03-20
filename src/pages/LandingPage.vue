<!-- src/pages/LandingPage.vue -->
<template>
  <div class="landing-page" :class="{ 'rtl': isRTL }" dir="auto">
    <!-- Hero Section -->
    <section class="hero relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-b from-white via-white to-amber-50/30"></div>
      <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1594035910385-85c6e90c9e0b?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
      <div class="relative container mx-auto px-4 py-20 sm:py-28 md:py-36 z-10">
        <div class="text-center max-w-4xl mx-auto">
          <h1 class="text-4xl sm:text-5xl md:text-7xl font-display-en font-bold tracking-tight text-gray-900 mb-6 leading-[1.1]">
            Launch Your Fragrance Empire
            <span class="text-amber-600">. Effortlessly.</span>
          </h1>
          <p class="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
            The all‑in‑one platform for emerging perfume brands. Beautiful online stores, powerful tools, and zero technical headaches.
          </p>
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <router-link
              to="/register-company"
              class="inline-flex items-center justify-center px-8 py-4 bg-amber-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:bg-amber-700 transition-all duration-300 text-base sm:text-lg"
            >
              Start Free Trial
              <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </router-link>
            <a
              :href="demoStoreUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-full border border-gray-300 hover:border-amber-500 hover:text-amber-600 transition-all duration-300 text-base sm:text-lg"
            >
              See a Live Store
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Trust Bar (optional) -->
    <div class="bg-gray-50 py-3 border-b border-gray-200">
      <div class="container mx-auto px-4">
        <div class="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
          <span>✨ No credit card required</span>
          <span>⚡ 14‑day free trial</span>
          <span>💳 Cancel anytime</span>
        </div>
      </div>
    </div>

    <!-- Problem / Solution Section -->
    <section class="py-20 sm:py-28 bg-white">
      <div class="container mx-auto px-4">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <h2 class="text-3xl sm:text-4xl font-display-en font-bold text-gray-900 mb-4">
            From idea to sales in minutes
          </h2>
          <p class="text-lg text-gray-600">
            Stop wrestling with complex e‑commerce platforms. Start selling your perfumes with a store that feels as elegant as your fragrance.
          </p>
        </div>
        <div class="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div class="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=1200&q=80"
                alt="Perfume bottles"
                class="w-full h-auto"
              />
              <div class="absolute inset-0 bg-gradient-to-tr from-amber-600/20 to-transparent pointer-events-none"></div>
            </div>
          </div>
          <div class="space-y-6">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">Stunning visual storefronts</h3>
                <p class="text-gray-600">Choose from beautifully designed themes that showcase your fragrances like art. Fully customizable to match your brand identity.</p>
              </div>
            </div>
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">Smart inventory & order management</h3>
                <p class="text-gray-600">Track stock, manage orders, and sync with your physical store – all from one intuitive dashboard.</p>
              </div>
            </div>
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">Real‑time analytics & insights</h3>
                <p class="text-gray-600">Understand your customers, best‑selling scents, and revenue trends to grow your business with confidence.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Grid (with perfume‑focused icons) -->
    <section class="py-20 sm:py-28 bg-gray-50">
      <div class="container mx-auto px-4">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <h2 class="text-3xl sm:text-4xl font-display-en font-bold text-gray-900 mb-4">
            Everything you need to succeed
          </h2>
          <p class="text-lg text-gray-600">
            Powerful features tailored for perfume brands, yet simple enough for anyone to use.
          </p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div class="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mb-4">
              <svg class="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Easy product catalog</h3>
            <p class="text-gray-600">Add perfumes with rich descriptions, fragrance notes, images, and variations in seconds.</p>
          </div>
          <div class="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div class="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mb-4">
              <svg class="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Customizable themes</h3>
            <p class="text-gray-600">Match your store’s look and feel to your brand’s personality with no coding required.</p>
          </div>
          <div class="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div class="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mb-4">
              <svg class="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Flexible pricing</h3>
            <p class="text-gray-600">Set your own prices, offer discounts, and create special offers to boost sales.</p>
          </div>
          <div class="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div class="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mb-4">
              <svg class="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M6 14h12m-6-6V4m-3 0h6" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Inventory tracking</h3>
            <p class="text-gray-600">Never oversell. Real‑time stock updates across your website and any physical location.</p>
          </div>
          <div class="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div class="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mb-4">
              <svg class="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Customer management</h3>
            <p class="text-gray-600">Build relationships with a built‑in CRM, email marketing, and loyalty programs.</p>
          </div>
          <div class="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div class="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mb-4">
              <svg class="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">SEO & social ready</h3>
            <p class="text-gray-600">Get found on Google and share your products beautifully on Instagram, Facebook, and more.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How it works (simplified steps) -->
    <section class="py-20 sm:py-28 bg-white">
      <div class="container mx-auto px-4">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <h2 class="text-3xl sm:text-4xl font-display-en font-bold text-gray-900 mb-4">
            Get your store live in three simple steps
          </h2>
          <p class="text-lg text-gray-600">
            No technical skills required. We handle the tech, you focus on your scents.
          </p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-10">
          <div class="text-center">
            <div class="w-20 h-20 mx-auto rounded-full bg-amber-50 flex items-center justify-center mb-5 text-2xl font-bold text-amber-600 shadow-sm">1</div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Sign up in 60 seconds</h3>
            <p class="text-gray-600">Create your account and choose your subdomain. No credit card required.</p>
          </div>
          <div class="text-center">
            <div class="w-20 h-20 mx-auto rounded-full bg-amber-50 flex items-center justify-center mb-5 text-2xl font-bold text-amber-600 shadow-sm">2</div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Add your products</h3>
            <p class="text-gray-600">Upload your perfumes, descriptions, and images. Use our templates to get started fast.</p>
          </div>
          <div class="text-center">
            <div class="w-20 h-20 mx-auto rounded-full bg-amber-50 flex items-center justify-center mb-5 text-2xl font-bold text-amber-600 shadow-sm">3</div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Start selling</h3>
            <p class="text-gray-600">Your store is live. Manage orders, engage customers, and grow your brand.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonial / Quote -->
    <section class="py-20 sm:py-28 bg-amber-50">
      <div class="container mx-auto px-4 text-center max-w-3xl">
        <svg class="w-12 h-12 text-amber-400 mx-auto mb-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
        <p class="text-xl sm:text-2xl text-gray-700 leading-relaxed">
          “We launched our perfume brand with P.NOTES and had our first sale within 24 hours. It’s the easiest e‑commerce solution we’ve ever used.”
        </p>
        <div class="mt-6">
          <p class="font-semibold text-gray-900">— Sara, Founder of <span class="text-amber-600">Oud Essence</span></p>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="py-20 sm:py-28 bg-amber-600 text-white">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl sm:text-4xl font-display-en font-bold mb-4">
          Ready to share your fragrance with the world?
        </h2>
        <p class="text-lg sm:text-xl mb-8 max-w-2xl mx-auto opacity-90">
          Join hundreds of perfume creators who trust P.NOTES to power their online stores.
        </p>
        <router-link
          to="/register-company"
          class="inline-flex items-center justify-center px-8 py-4 bg-white text-amber-600 font-semibold rounded-full hover:bg-gray-100 transition-colors shadow-lg text-base sm:text-lg"
        >
          Start your 14‑day free trial
          <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </router-link>
      </div>
    </section>

    <!-- Simple Footer -->
    <footer class="bg-gray-900 text-gray-400 py-8">
      <div class="container mx-auto px-4 text-center">
        <p class="text-sm">&copy; {{ new Date().getFullYear() }} P.NOTES. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useLanguageStore } from '@/stores/language'

const languageStore = useLanguageStore()
const { isRTL, t } = languageStore

// Demo store subdomain – adjust as needed
const rootDomain = import.meta.env.VITE_ROOT_DOMAIN || 'localhost:5173'
const demoStoreUrl = `https://mard.${rootDomain}/`
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

/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}

/* Optional: subtle fade-in animation for sections */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

section {
  animation: fadeInUp 0.6s ease-out forwards;
}
</style>