<!-- BrandPage.vue -->
<template>
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>

  <div v-else-if="error" class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <p class="text-gray-600 mb-4">{{ error }}</p>
      <router-link to="/brands" class="text-primary-600 hover:underline">
        {{ t('Back to Brands') }}
      </router-link>
    </div>
  </div>

  <div v-else-if="currentBrand" class="min-h-screen bg-white">
    <!-- SEO Head -->
    <SEOHead 
      :title="seoTitle"
      :description="seoDescription"
      :image="brandImage"
      type="website"
    />

    <!-- Breadcrumb - Compact -->
    <div class="container mx-auto px-4 pt-6 lg:pt-8">
      <nav class="flex items-center text-xs lg:text-sm text-gray-600 mb-6 lg:mb-8" 
           :class="{ 'flex-row-reverse': isRTL }">
        <router-link to="/" class="hover:text-primary-600 transition-colors">
          {{ t('Home') }}
        </router-link>
        <span class="mx-2 lg:mx-3">/</span>
        <router-link to="/brands" class="hover:text-primary-600 transition-colors">
          {{ t('Brands') }}
        </router-link>
        <span class="mx-2 lg:mx-3">/</span>
        <span class="text-gray-900 font-medium truncate max-w-[150px] lg:max-w-none">{{ currentBrand.name }}</span>
      </nav>
    </div>

    <!-- Brand Header - Mobile Optimized -->
    <div class="container mx-auto px-4 pb-8 lg:pb-12">
      <!-- Mobile: Horizontal layout with image left, text right -->
      <div class="flex items-start gap-4 lg:hidden mb-6">
        <!-- Brand Logo - Left aligned, not centered -->
        <div class="w-20 h-20 flex-shrink-0 rounded-full overflow-hidden border-3 border-white shadow-md">
          <img 
            :src="brandLogo" 
            :alt="currentBrand.name"
            class="w-full h-full object-cover"
            @error="handleBrandImageError"
          />
        </div>

        <!-- Brand Name & Signature - Right aligned -->
        <div class="flex-1 min-w-0" :class="{ 'text-right': isRTL }">
          <h1 class="text-2xl font-display-en font-bold text-gray-900 mb-1 truncate">
            {{ currentBrand.name }}
          </h1>
          <p v-if="currentBrand.signature" class="text-sm text-gray-600 line-clamp-2">
            {{ currentBrand.signature }}
          </p>

          <!-- Category Badge - Mobile -->
          <div class="flex items-center gap-2 mt-2" :class="{ 'justify-end': isRTL }">
            <span class="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
              {{ currentBrand.category || t('Luxury Brand') }}
            </span>
          </div>
        </div>
      </div>

      <!-- Desktop: Brand Hero -->
      <div class="hidden lg:block bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl shadow-luxury-lg overflow-hidden mb-8">
        <div class="grid lg:grid-cols-3 gap-8 p-8 lg:p-10">
          <!-- Brand Logo & Info - Desktop -->
          <div class="lg:col-span-1 flex flex-col items-start text-left" 
               :class="{ 'lg:text-right lg:items-end': isRTL }">
            <div class="w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden border-4 border-white shadow-lg mb-5">
              <img 
                :src="brandLogo" 
                :alt="currentBrand.name"
                class="w-full h-full object-cover"
                @error="handleBrandImageError"
              />
            </div>

            <div :class="{ 'lg:text-right': isRTL }">
              <h1 class="text-3xl lg:text-4xl xl:text-5xl font-display-en font-bold text-gray-900 mb-2">
                {{ currentBrand.name }}
              </h1>
              <p v-if="currentBrand.signature" class="text-lg text-gray-600">
                {{ currentBrand.signature }}
              </p>
            </div>

            <!-- Brand Badges - Desktop -->
            <div class="flex items-center gap-3 mt-4" :class="{ 'flex-row-reverse': isRTL }">
              <span class="px-4 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
                {{ currentBrand.category || t('Luxury Brand') }}
              </span>
            </div>
          </div>

          <!-- Brand Description & Stats - Desktop -->
          <div class="lg:col-span-2 flex flex-col justify-center" :class="{ 'lg:text-right': isRTL }">
            <div class="prose max-w-none mb-6">
              <p class="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                {{ brandDescription }}
              </p>
            </div>

            <!-- Brand Stats Cards - Desktop -->
            <div class="grid grid-cols-3 gap-4 mt-2">
              <div class="bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-sm">
                <div class="text-2xl font-bold text-primary-600 mb-1">{{ brandProducts.length }}</div>
                <div class="text-sm text-gray-600">{{ t('Products') }}</div>
              </div>
              <div v-if="brandProducts.length > 0" class="bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-sm">
                <div class="text-2xl font-bold text-primary-600 mb-1">
                  {{ formatCompactPrice(brandPriceRange.min) }} - {{ formatCompactPrice(brandPriceRange.max) }}
                </div>
                <div class="text-sm text-gray-600">{{ t('Price Range') }}</div>
              </div>
              <div v-if="currentBrand.createdAt" class="bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-sm">
                <div class="text-2xl font-bold text-primary-600 mb-1">{{ formatYear(currentBrand.createdAt) }}</div>
                <div class="text-sm text-gray-600">{{ t('Since') }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile: Compact Stats Row - 3 column grid -->
      <div class="lg:hidden grid grid-cols-3 gap-2 mb-6">
        <div class="bg-gray-50 rounded-lg p-3 text-center">
          <div class="text-xl font-bold text-primary-600">{{ brandProducts.length }}</div>
          <div class="text-xs text-gray-600">{{ t('Products') }}</div>
        </div>
        <div v-if="brandProducts.length > 0" class="bg-gray-50 rounded-lg p-3 text-center">
          <div class="text-xl font-bold text-primary-600">
            {{ formatCompactPrice(brandPriceRange.min) }}
          </div>
          <div class="text-xs text-gray-600">{{ t('From') }}</div>
        </div>
        <div v-if="currentBrand.createdAt" class="bg-gray-50 rounded-lg p-3 text-center">
          <div class="text-xl font-bold text-primary-600">{{ formatYear(currentBrand.createdAt) }}</div>
          <div class="text-xs text-gray-600">{{ t('Since') }}</div>
        </div>
      </div>

      <!-- Mobile: Brand Description - Collapsible -->
      <div class="lg:hidden mb-4">
        <p class="text-sm text-gray-600 leading-relaxed line-clamp-3" :class="{ 'expanded': !isDescriptionCollapsed }">
          {{ brandDescription }}
        </p>
        <button 
          v-if="brandDescription.length > 120"
          @click="isDescriptionCollapsed = !isDescriptionCollapsed"
          class="text-xs text-primary-600 font-medium mt-1"
        >
          {{ isDescriptionCollapsed ? t('Read more') : t('Show less') }}
        </button>
      </div>
    </div>

    <!-- Collection Header & Filters -->
    <div class="container mx-auto px-4 pb-16 lg:pb-20">
      <div v-if="brandProducts.length > 0">
        <!-- Collection Title - Mobile Optimized -->
        <div class="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-6 lg:mb-8 gap-4">
          <div>
            <h2 class="text-2xl lg:text-3xl font-display-en font-bold text-gray-900 mb-1">
              {{ t('Collection') }}
            </h2>
            <p class="text-sm lg:text-base text-gray-600">
              {{ brandProducts.length }} {{ t('fragrances') }}
            </p>
          </div>

          <!-- Search & Filters - Mobile Stacked -->
          <div v-if="brandProducts.length > 1" class="w-full lg:w-auto">
            <div class="flex flex-col sm:flex-row gap-2 lg:gap-3">
              <!-- Search Input - Mobile Full Width -->
              <div class="relative flex-1 lg:w-64">
                <input
                  v-model="searchQuery"
                  type="text"
                  :placeholder="t('Search...')"
                  class="w-full px-4 py-2.5 pl-10 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                />
                <svg class="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>

              <!-- Filter Button -->
              <div class="relative" ref="filterDropdownRef">
                <button
                  @click="showFilters = !showFilters"
                  class="w-full sm:w-auto px-5 py-2.5 bg-white border border-gray-300 rounded-xl hover:border-primary-500 transition-colors flex items-center justify-center gap-2 text-sm"
                  :class="{ 'border-primary-500': showFilters }"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
                  </svg>
                  {{ t('Filter') }}
                  <span v-if="activeFiltersCount > 0" class="bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded-full text-xs">
                    {{ activeFiltersCount }}
                  </span>
                </button>

                <!-- Filter Dropdown Panel - Mobile Responsive -->
                <div v-if="showFilters" 
                     class="fixed lg:absolute inset-x-0 bottom-0 lg:inset-auto lg:right-0 lg:mt-2 lg:w-96 bg-white rounded-t-2xl lg:rounded-xl shadow-luxury-lg border border-gray-200 p-5 z-50 animate-slide-up lg:animate-fade-in"
                     :class="{ 'lg:left-0': isRTL }">

                  <!-- Mobile Drag Handle -->
                  <div class="lg:hidden flex justify-center mb-4">
                    <div class="w-12 h-1 bg-gray-300 rounded-full"></div>
                  </div>

                  <!-- Mobile Header -->
                  <div class="flex items-center justify-between lg:hidden mb-5">
                    <h3 class="text-lg font-bold text-gray-900">{{ t('Filters') }}</h3>
                    <button @click="showFilters = false" class="text-gray-500 hover:text-gray-700">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>

                  <div class="space-y-5 max-h-[70vh] lg:max-h-none overflow-y-auto">
                    <!-- Sort -->
                    <div>
                      <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{{ t('Sort by') }}</label>
                      <select 
                        v-model="sortBy"
                        @change="handleSortChange"
                        class="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                      >
                        <option value="newest">{{ t('Newest') }}</option>
                        <option value="price-low">{{ t('Price: Low to High') }}</option>
                        <option value="price-high">{{ t('Price: High to Low') }}</option>
                        <option value="name-asc">{{ t('Name') }}</option>
                        <option value="rating">{{ t('Highest Rated') }}</option>
                      </select>
                    </div>

                    <!-- Price Range Filter -->
                    <div>
                      <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">{{ t('Price Range') }}</label>
                      <div class="space-y-3">
                        <div class="flex items-center gap-3">
                          <div class="flex-1">
                            <input
                              v-model.number="minPrice"
                              type="number"
                              :placeholder="t('Min')"
                              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              @input="applyPriceFilter"
                            />
                          </div>
                          <span class="text-gray-500">-</span>
                          <div class="flex-1">
                            <input
                              v-model.number="maxPrice"
                              type="number"
                              :placeholder="t('Max')"
                              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              @input="applyPriceFilter"
                            />
                          </div>
                        </div>

                        <!-- Quick Price Presets -->
                        <div class="flex flex-wrap gap-2">
                          <button
                            v-for="preset in pricePresets"
                            :key="preset.label"
                            @click="setPricePreset(preset)"
                            class="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                          >
                            {{ preset.label }}
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Concentration Filter -->
                    <div v-if="uniqueConcentrations.length > 0">
                      <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{{ t('Concentration') }}</label>
                      <div class="flex flex-wrap gap-2">
                        <button
                          v-for="concentration in uniqueConcentrations"
                          :key="concentration"
                          @click="toggleConcentration(concentration)"
                          :class="[
                            'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                            concentrationFilter === concentration
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          ]"
                        >
                          {{ concentration }}
                        </button>
                      </div>
                    </div>

                    <!-- In Stock Filter -->
                    <div class="flex items-center justify-between pt-2">
                      <span class="text-sm font-medium text-gray-700">{{ t('In Stock Only') }}</span>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          v-model="inStockOnly"
                          @change="filterLocally"
                          class="sr-only peer"
                        />
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                      </label>
                    </div>
                  </div>

                  <!-- Mobile Action Buttons -->
                  <div class="flex gap-3 mt-6 lg:hidden">
                    <button
                      @click="clearAllFilters"
                      class="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50"
                    >
                      {{ t('Clear') }}
                    </button>
                    <button
                      @click="showFilters = false"
                      class="flex-1 px-4 py-3 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600"
                    >
                      {{ t('Apply') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Active Filters Tags - Compact -->
        <div v-if="activeFiltersCount > 0" class="flex flex-wrap items-center gap-2 mb-6">
          <span v-if="searchQuery" class="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs">
            "{{ truncateString(searchQuery, 15) }}"
            <button @click="searchQuery = ''" class="text-gray-500 hover:text-gray-700">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </span>
          <span v-if="minPrice || maxPrice" class="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs">
            {{ formatCompactPrice(minPrice || 0) }} - {{ formatCompactPrice(maxPrice || brandPriceRange.max) }}
            <button @click="clearPriceFilter" class="text-gray-500 hover:text-gray-700">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </span>
          <span v-if="concentrationFilter" class="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs">
            {{ concentrationFilter }}
            <button @click="concentrationFilter = ''" class="text-gray-500 hover:text-gray-700">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </span>
          <span v-if="inStockOnly" class="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs">
            {{ t('In Stock') }}
            <button @click="inStockOnly = false" class="text-gray-500 hover:text-gray-700">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </span>
          <button
            @click="clearAllFilters"
            class="text-xs text-primary-600 hover:text-primary-700 font-medium"
          >
            {{ t('Clear all') }}
          </button>
        </div>

        <!-- Products Grid -->
        <ProductGrid 
          :products="filteredProducts"
          @view-product="viewProduct"
          @add-to-cart="addToCart"
        />

        <!-- No Results Message - Compact -->
        <div v-if="filteredProducts.length === 0" class="text-center py-12 lg:py-16">
          <div class="text-gray-300 mb-3">
            <svg class="w-12 h-12 lg:w-16 lg:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-lg lg:text-xl font-medium text-gray-900 mb-2">{{ t('No products found') }}</h3>
          <p class="text-sm text-gray-600 mb-4">
            {{ t('Try adjusting your filters') }}
          </p>
          <button
            @click="clearAllFilters"
            class="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            {{ t('Clear filters') }}
          </button>
        </div>
      </div>

      <!-- No Products Message - Compact -->
      <div v-else-if="!productsLoading && !brandsStore.isLoading" class="text-center py-16 lg:py-20">
        <div class="text-gray-300 mb-4">
          <svg class="w-16 h-16 lg:w-20 lg:h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-xl lg:text-2xl font-display-en font-bold text-gray-900 mb-2">{{ t('No Products Available') }}</h3>
        <p class="text-sm lg:text-base text-gray-600 mb-6 max-w-sm mx-auto">
          {{ t('There are no products available for this brand yet.') }}
        </p>
        <router-link to="/brands" class="inline-flex items-center gap-2 text-sm lg:text-base text-primary-600 hover:text-primary-700 font-medium">
          {{ t('Browse Other Brands') }}
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
          </svg>
        </router-link>
      </div>
    </div>

    <!-- Related Brands - Mobile Optimized -->
    <div v-if="relatedBrands.length > 0" class="bg-gray-50 py-12 lg:py-16">
      <div class="container mx-auto px-4">
        <div class="text-center mb-8 lg:mb-10">
          <h2 class="text-2xl lg:text-3xl font-display-en font-bold text-gray-900 mb-2">
            {{ t('More Luxury Brands') }}
          </h2>
          <p class="text-sm lg:text-base text-gray-600">
            {{ t('Discover exclusive fragrance houses') }}
          </p>
        </div>

        <div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 lg:gap-6">
          <router-link
            v-for="brand in relatedBrands"
            :key="brand.id"
            :to="`/brand/${brand.slug}`"
            class="group block"
          >
            <div class="aspect-square bg-white rounded-xl lg:rounded-2xl p-3 lg:p-6 flex items-center justify-center 
                        transition-all duration-300 group-hover:shadow-lg border border-gray-100">
              <img 
                :src="brand.image || defaultBrandImage" 
                :alt="brand.name"
                class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                @error="handleBrandImageError"
              />
            </div>
            <p class="text-center text-xs lg:text-sm font-medium text-gray-900 mt-2 group-hover:text-primary-600 truncate">
              {{ brand.name }}
            </p>
          </router-link>
        </div>
      </div>
    </div>
  </div>

  <!-- Brand Not Found - Compact -->
  <div v-else-if="!brandsStore.isLoading" class="min-h-screen flex items-center justify-center">
    <div class="text-center px-4">
      <div class="text-gray-300 mb-4">
        <svg class="w-16 h-16 lg:w-20 lg:h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <h2 class="text-2xl lg:text-3xl font-display-en font-bold text-gray-900 mb-3">{{ t('Brand Not Found') }}</h2>
      <p class="text-sm lg:text-base text-gray-600 mb-6">{{ t('The brand you are looking for does not exist.') }}</p>
      <router-link to="/brands" class="inline-flex items-center gap-2 text-sm lg:text-base text-primary-600 hover:text-primary-700 font-medium">
        {{ t('View All Brands') }}
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
        </svg>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLanguageStore } from '@/stores/language'
import { useBrandsStore } from '@/stores/brands'
import { useCartStore } from '@/stores/cart'
import { useTenantStore } from '@/stores/tenant'
import ProductGrid from '@/components/Products/ProductGrid.vue'
import LoadingSpinner from '@/components/UI/LoadingSpinner.vue'
import SEOHead from '@/components/UI/SEOHead.vue'
import type { Product } from '@/types'

const route = useRoute()
const router = useRouter()
const languageStore = useLanguageStore()
const brandsStore = useBrandsStore()
const cartStore = useCartStore()
const tenantStore = useTenantStore()

const { t, isRTL } = languageStore

// State
const error = ref<string | null>(null)
const sortBy = ref('newest')
const inStockOnly = ref(false)
const concentrationFilter = ref('')
const defaultBrandImage = '/images/brand-default.jpg'
const productsLoading = ref(false)
const searchQuery = ref('')
const showFilters = ref(false)
const filterDropdownRef = ref<HTMLElement | null>(null)
const isDescriptionCollapsed = ref(true)

// Price filter state
const minPrice = ref<number | null>(null)
const maxPrice = ref<number | null>(null)

// Price presets
const pricePresets = [
  { label: t('Under $100'), min: 0, max: 100 },
  { label: t('$100 - $200'), min: 100, max: 200 },
  { label: t('$200 - $300'), min: 200, max: 300 },
  { label: t('Over $300'), min: 300, max: null }
]

// Computed properties
const brandSlug = computed(() => route.params.slug as string)

// Get current brand from store
const currentBrand = computed(() => brandsStore.currentBrand)

// Get brand products directly from currentBrand
const brandProducts = computed(() => {
  if (!currentBrand.value) return []
  return currentBrand.value.products || []
})

// Unique concentrations for filter
const uniqueConcentrations = computed(() => {
  const concentrations = new Set<string>()
  brandProducts.value.forEach(product => {
    if (product.concentration) {
      concentrations.add(product.concentration)
    }
  })
  return Array.from(concentrations).sort()
})

// Active filters count
const activeFiltersCount = computed(() => {
  let count = 0
  if (searchQuery.value) count++
  if (sortBy.value !== 'newest') count++
  if (concentrationFilter.value) count++
  if (inStockOnly.value) count++
  if (minPrice.value !== null || maxPrice.value !== null) count++
  return count
})

// Filtered and sorted products with clever search and price range
const filteredProducts = computed(() => {
  let products = [...brandProducts.value]
  
  // Apply search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    products = products.filter(product => {
      const nameEn = product.name?.en?.toLowerCase() || ''
      const nameAr = product.name?.ar?.toLowerCase() || ''
      const descEn = product.description?.en?.toLowerCase() || ''
      const descAr = product.description?.ar?.toLowerCase() || ''
      const concentration = product.concentration?.toLowerCase() || ''
      const size = product.size?.toLowerCase() || ''
      
      return nameEn.includes(query) || 
             nameAr.includes(query) || 
             descEn.includes(query) || 
             descAr.includes(query) || 
             concentration.includes(query) || 
             size.includes(query)
    })
  }
  
  // Apply price range filter
  if (minPrice.value !== null) {
    products = products.filter(product => product.price >= minPrice.value!)
  }
  if (maxPrice.value !== null) {
    products = products.filter(product => product.price <= maxPrice.value!)
  }
  
  // Apply in stock filter
  if (inStockOnly.value) {
    products = products.filter(product => product.inStock !== false)
  }
  
  // Apply concentration filter
  if (concentrationFilter.value) {
    products = products.filter(product => 
      product.concentration === concentrationFilter.value
    )
  }
  
  // Apply sorting
  switch (sortBy.value) {
    case 'price-low':
      return products.sort((a, b) => a.price - b.price)
    case 'price-high':
      return products.sort((a, b) => b.price - a.price)
    case 'rating':
      return products.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    case 'popular':
      return products.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
    case 'name-asc':
      return products.sort((a, b) => {
        const nameA = a.name?.en || ''
        const nameB = b.name?.en || ''
        return nameA.localeCompare(nameB)
      })
    case 'newest':
    default:
      return products.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0
        const dateB = b.createdAt?.seconds || 0
        return dateB - dateA
      })
  }
})

// Loading state
const isLoading = computed(() => 
  brandsStore.isLoading || productsLoading.value
)

// SEO
const seoTitle = computed(() => 
  currentBrand.value 
    ? `${currentBrand.value.name} | ${t('Luxury Perfumes')}`
    : t('Brand Not Found')
)

const seoDescription = computed(() => 
  currentBrand.value?.signature || 
  currentBrand.value?.description ||
  t('Explore our collection of {brand} luxury perfumes', { brand: currentBrand.value?.name || '' })
)

const brandImage = computed(() => currentBrand.value?.image || defaultBrandImage)
const brandLogo = computed(() => currentBrand.value?.image || defaultBrandImage)

const brandDescription = computed(() => {
  if (!currentBrand.value) return ''
  return currentBrand.value.description || 
    t('Explore our collection of {brand} luxury perfumes', { brand: currentBrand.value.name })
})

const brandPriceRange = computed(() => {
  const products = brandProducts.value
  if (products.length === 0) return { min: 0, max: 0 }
  
  const prices = products.map(p => p.price)
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  }
})

const relatedBrands = computed(() => {
  if (!currentBrand.value) return []
  
  // Get all active brands except current one
  return brandsStore.activeBrands
    .filter(brand => brand.slug !== brandSlug.value)
    .slice(0, 6)
})

// Methods
const loadBrandData = async () => {
  try {
    error.value = null
    productsLoading.value = true
    
    console.log(`🔄 Loading brand: ${brandSlug.value}`)
    
    // Wait for tenant to be ready before proceeding
    await tenantStore.whenReady()
    
    // Load brands if not loaded
    if (brandsStore.brands.length === 0) {
      await brandsStore.loadBrands()
    }
    
    const brand = await brandsStore.getBrandBySlug(brandSlug.value)
    
    if (!brand) {
      error.value = t('Brand not found')
      console.log(`❌ Brand not found: ${brandSlug.value}`)
      return
    }
    
    console.log(`✅ Loaded brand "${brand.name}" with ${brand.products?.length || 0} products`)
    
    // Update page title
    document.title = `${brand.name} | ${t('Luxury Perfumes')}`
    
  } catch (err: any) {
    console.error('❌ Error loading brand data:', err)
    error.value = t('Failed to load brand: ') + (err.message || t('Unknown error'))
  } finally {
    productsLoading.value = false
  }
}

// Filter methods
const filterLocally = () => {
  console.log('Filters updated')
}

const handleSortChange = () => {
  console.log('Sort changed to:', sortBy.value)
}

const toggleConcentration = (concentration: string) => {
  if (concentrationFilter.value === concentration) {
    concentrationFilter.value = ''
  } else {
    concentrationFilter.value = concentration
  }
}

// Price filter methods
const applyPriceFilter = () => {
  // Just trigger computed property update
}

const setPricePreset = (preset: { min: number; max: number | null }) => {
  minPrice.value = preset.min
  maxPrice.value = preset.max
  applyPriceFilter()
}

const clearPriceFilter = () => {
  minPrice.value = null
  maxPrice.value = null
}

const clearAllFilters = () => {
  searchQuery.value = ''
  sortBy.value = 'newest'
  concentrationFilter.value = ''
  inStockOnly.value = false
  minPrice.value = null
  maxPrice.value = null
  showFilters.value = false
}

// Format helpers
const formatCompactPrice = (price: number) => {
  if (price >= 1000) {
    return `EGP ${(price / 1000).toFixed(1)}k`
  }
  return `EGP ${price}`
}

const formatYear = (date: any) => {
  try {
    if (!date) return ''
    if (date.toDate) return date.toDate().getFullYear()
    if (date.seconds) return new Date(date.seconds * 1000).getFullYear()
    return new Date(date).getFullYear()
  } catch {
    return ''
  }
}

const truncateString = (str: string, length: number) => {
  if (str.length <= length) return str
  return str.substring(0, length) + '...'
}

// Click outside to close filter dropdown
const handleClickOutside = (event: MouseEvent) => {
  if (filterDropdownRef.value && !filterDropdownRef.value.contains(event.target as Node)) {
    showFilters.value = false
  }
}

const viewProduct = (product: Product) => {
  if (product.slug) {
    router.push(`/product/${product.slug}`)
  }
}

const addToCart = (product: Product, quantity: number = 1) => {
  cartStore.addToCart(product, quantity)
}

// Image error handlers
const handleBrandImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = defaultBrandImage
  img.onerror = null
}

// Watch for route changes
watch(
  brandSlug,
  async (newSlug, oldSlug) => {
    if (newSlug !== oldSlug) {
      await loadBrandData()
      clearAllFilters()
      isDescriptionCollapsed.value = true
    }
  },
  { immediate: true }
)

// Watch search query with debounce
let searchTimeout: NodeJS.Timeout
watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    filterLocally()
  }, 300)
})

// Initialize on mount
onMounted(async () => {
  // Wait for tenant to be ready before initializing brand store
  await tenantStore.whenReady()
  await brandsStore.initialize()
  document.addEventListener('click', handleClickOutside)
})

// Clean up
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  clearTimeout(searchTimeout)
})
</script>

<style scoped>
/* Luxury shadows */
.shadow-luxury-lg {
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
}

/* Font styles */
.font-display-en {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

/* Line clamp for mobile description */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3.expanded {
  -webkit-line-clamp: unset;
}

/* Mobile filter drawer */
@media (max-width: 1023px) {
  .fixed {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
}

/* Better touch targets */
@media (max-width: 768px) {
  button, 
  .router-link,
  select,
  input,
  label {
    min-height: 44px;
  }
  
  .min-h-44 {
    min-height: 44px;
  }
}

/* Hide number input spinners */
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type=number] {
  -moz-appearance: textfield;
}

/* Toggle switch styles */
.peer:checked ~ .peer-checked\:bg-primary-500 {
  background-color: #3b82f6;
}
.peer:checked ~ .peer-checked\:after\:translate-x-full::after {
  transform: translateX(100%);
}
[dir="rtl"] .peer:checked ~ .peer-checked\:after\:-translate-x-full::after {
  transform: translateX(-100%);
}
</style>