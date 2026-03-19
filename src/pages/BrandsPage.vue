<!-- BrandsPage.vue -->
<template>
  <div class="min-h-screen bg-white">
    <!-- SEO Head -->
    <SEOHead 
      :title="seoTitle"
      :description="seoDescription"
      type="website"
    />

    <div class="container mx-auto px-4 py-8">
      <!-- Breadcrumb -->
      <nav class="flex items-center text-sm text-gray-600 mb-8" 
           :class="{ 'flex-row-reverse': isRTL }">
        <router-link to="/" class="hover:text-primary-600 transition-colors">
          {{ t('Home') }}
        </router-link>
        <span class="mx-3">/</span>
        <span class="text-gray-900 font-medium">{{ t('Brands') }}</span>
      </nav>

      <!-- Category Filter -->
      <div class="mb-8 flex flex-wrap items-center gap-3" :class="{ 'flex-row-reverse': isRTL }">
        <span class="text-sm font-medium text-gray-700">{{ t('Filter by:') }}</span>
        <button
          @click="selectedCategory = null"
          :class="[
            'px-4 py-2 text-sm font-medium transition-colors',
            !selectedCategory
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          {{ t('All Brands') }}
        </button>
        <button
          v-for="category in uniqueCategories"
          :key="category"
          @click="selectedCategory = category"
          :class="[
            'px-4 py-2 text-sm font-medium transition-colors',
            selectedCategory === category
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          {{ category }}
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="brandsStore.isLoading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        <p class="mt-4 text-gray-600">{{ t('Loading brands...') }}</p>
      </div>

      <!-- Error State -->
      <div v-else-if="brandsStore.error" class="text-center py-12">
        <div class="bg-red-50 border border-red-200 p-4">
          <p class="text-red-600">{{ brandsStore.error }}</p>
          <button @click="loadBrands" class="mt-4 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 transition-colors">
            {{ t('Try Again') }}
          </button>
        </div>
      </div>

      <!-- Brands Grid -->
      <div v-else-if="filteredBrands.length > 0" class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        <div
          v-for="brand in filteredBrands"
          :key="brand.id"
          class="group relative bg-white overflow-hidden"
        >
          <router-link :to="`/brand/${brand.slug}`" class="block">
            <!-- Brand Image - Full Card -->
            <div class="relative aspect-[4/5] md:aspect-[3/4]">
              <img 
                :src="brand.image || defaultBrandImage"
                :alt="brand.name"
                class="w-full h-full object-cover"
                @error="handleImageError"
              />

              <!-- Status Badge - Always Visible -->
              <div class="absolute top-4 left-4 z-10">
                <span :class="[
                  'px-3 py-1 text-xs font-medium',
                  brand.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                ]">
                  {{ brand.isActive ? t('Active') : t('Inactive') }}
                </span>
              </div>

              <!-- Desktop: Brand Details Overlay - Hidden by default, visible on hover -->
              <div class="absolute inset-0 md:block hidden">
                <!-- Gradient overlay that fades in on hover -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent opacity-0 md:group-hover:opacity-100 transition-opacity duration-300"></div>

                <!-- Content overlay that slides up on hover -->
                <div class="absolute inset-x-0 bottom-0 p-4 md:p-6 transform translate-y-full md:group-hover:translate-y-0 transition-transform duration-300 ease-out">
                  <h3 class="text-lg md:text-xl font-display-en font-bold text-white mb-1">
                    {{ brand.name }}
                  </h3>
                  <p v-if="brand.signature" class="text-sm text-gray-200 mb-2 line-clamp-2">
                    {{ brand.signature }}
                  </p>
                  <p v-else-if="brand.description" class="text-sm text-gray-200 mb-2 line-clamp-2">
                    {{ brand.description }}
                  </p>
                  <div class="flex items-center justify-between">
                    <div>
                      <span class="text-xs font-medium text-primary-300">
                        {{ t('Products') }}: {{ brand.productIds?.length || 0 }}
                      </span>
                      <span class="mx-2 text-gray-400">•</span>
                      <span class="text-xs text-gray-300">
                        {{ brand.category }}
                      </span>
                    </div>
                    <span class="text-primary-300 text-sm">
                      {{ isRTL ? 'استكشف ←' : 'Explore →' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Mobile: Brand Details Static at Bottom -->
              <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-3 md:hidden">
                <h3 class="text-sm font-display-en font-bold text-white mb-0.5 truncate">
                  {{ brand.name }}
                </h3>
                <div class="flex items-center justify-between">
                  <span class="text-xs text-gray-200">
                    {{ brand.productIds?.length || 0 }} {{ t('Products') }}
                  </span>
                  <span class="text-primary-300 text-xs">
                    {{ isRTL ? 'استكشف' : 'Explore' }}
                  </span>
                </div>
              </div>
            </div>
          </router-link>
        </div>
      </div>

      <!-- No Brands Message -->
      <div v-else class="text-center py-20">
        <div class="text-gray-400 mb-4">
          <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 class="text-xl font-medium text-gray-900 mb-2">
          {{ t('No Brands Available') }}
        </h3>
        <p class="text-gray-600">
          {{ t('Brands will be added soon by the administrator.') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useLanguageStore } from '@/stores/language'
import { useBrandsStore } from '@/stores/brands'
import { useTenantStore } from '@/stores/tenant'
import SEOHead from '@/components/UI/SEOHead.vue'

const languageStore = useLanguageStore()
const brandsStore = useBrandsStore()
const tenantStore = useTenantStore()

const { currentLanguage, isRTL } = storeToRefs(languageStore)
const { t } = languageStore

// State
const selectedCategory = ref<string | null>(null)
const defaultBrandImage = '/images/brand-default.jpg'

// Page SEO
const seoTitle = computed(() => 
  currentLanguage.value === 'en' ? 'Brands | Luxury Perfume Collections' : 'الماركات | مجموعات العطور الفاخرة'
)

const seoDescription = computed(() => 
  currentLanguage.value === 'en'
    ? 'Explore our luxury perfume collections from premium brands worldwide. All prices in EGP.'
    : 'استكشف مجموعات العطور الفاخرة من أفضل الماركات العالمية. جميع الأسعار بالجنيه المصري.'
)

// Get active brands from store
const activeBrands = computed(() => brandsStore.activeBrands)

// Filter brands by category
const filteredBrands = computed(() => {
  let brands = activeBrands.value
  
  if (selectedCategory.value) {
    brands = brands.filter(b => b.category === selectedCategory.value)
  }
  
  return brands
})

// Get unique categories from active brands
const uniqueCategories = computed(() => {
  const categories = new Set<string>()
  activeBrands.value.forEach(brand => {
    if (brand.category) categories.add(brand.category)
  })
  return Array.from(categories).sort()
})

// Handle image error
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = defaultBrandImage
}

// Load brands (manual retry)
const loadBrands = async () => {
  await brandsStore.loadBrands()
}

// Initialize
onMounted(async () => {
  console.log('🏠 BrandsPage mounted - waiting for tenant...')
  // Wait for tenant to be resolved
  try {
    await tenantStore.whenReady()
    console.log('✅ Tenant ready, initializing brands...')
    await brandsStore.initialize()
    console.log('🎉 BrandsPage ready with', activeBrands.value.length, 'active brands')
  } catch (err) {
    console.error('❌ Tenant resolution failed:', err)
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Card styling */
.group {
  position: relative;
  width: 100%;
}

/* Ensure no rounded corners */
.group,
.group .relative,
.group img,
.group .absolute {
  border-radius: 0 !important;
}

/* Aspect ratio for consistent card sizing */
.aspect-\[4\/5\] {
  aspect-ratio: 4/5;
}

.aspect-\[3\/4\] {
  aspect-ratio: 3/4;
}

/* Desktop overlay animations */
@media (min-width: 768px) {
  .group .md\:group-hover\:translate-y-0 {
    transform: translateY(0) !important;
  }
  
  .group .translate-y-full {
    transform: translateY(100%);
  }
  
  .group .opacity-0 {
    opacity: 0;
  }
  
  .group:hover .md\:group-hover\:opacity-100 {
    opacity: 1;
  }
}

/* Mobile grid adjustments */
@media (max-width: 767px) {
  .container {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
  
  .grid {
    gap: 0.75rem;
  }
}

/* Category filter buttons */
button {
  border-radius: 0 !important;
}
</style>