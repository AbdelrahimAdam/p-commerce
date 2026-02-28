<template>
  <div v-if="loading" class="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>

  <div v-else-if="error" class="min-h-screen flex items-center justify-center">
    <div class="text-center px-4">
      <p class="text-gray-600 mb-4">{{ error }}</p>
      <router-link to="/" class="text-primary-600 hover:underline">
        {{ t('Back to Home') }}
      </router-link>
    </div>
  </div>

  <div v-else-if="product" class="min-h-screen bg-white">
    <SEOHead 
      :title="productName"
      :description="productDescription"
      :image="productImage"
      type="product"
    />

    <!-- Breadcrumb - Compact -->
    <div class="container mx-auto px-4 pt-6 lg:pt-8">
      <nav class="flex items-center text-xs lg:text-sm text-gray-600 mb-6 lg:mb-8" 
           :class="{ 'flex-row-reverse': isRTL }">
        <router-link to="/" class="hover:text-primary-600 transition-colors">
          {{ t('Home') }}
        </router-link>
        <span class="mx-2 lg:mx-3">/</span>
        <router-link 
          v-if="brandSlug"
          :to="`/brand/${brandSlug}`" 
          class="hover:text-primary-600 transition-colors truncate max-w-[120px] lg:max-w-none"
        >
          {{ brandName }}
        </router-link>
        <span v-else class="text-gray-500 truncate max-w-[120px] lg:max-w-none">
          {{ brandName }}
        </span>
        <span class="mx-2 lg:mx-3">/</span>
        <span class="text-gray-900 font-medium truncate max-w-[150px] lg:max-w-none">
          {{ productName }}
        </span>
      </nav>
    </div>

    <!-- Product Details - Optimized Spacing -->
    <div class="container mx-auto px-4 pb-16 lg:pb-20">
      <div class="grid lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-20">
        <!-- Image Gallery - Mobile Optimized -->
        <div class="lg:sticky lg:top-24 lg:self-start">
          <div class="bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden shadow-luxury-lg relative">
            <img 
              :src="productImage" 
              :alt="productName"
              class="w-full h-auto object-cover aspect-square lg:aspect-auto"
              loading="eager"
            />
            <!-- Wishlist Button Overlay -->
            <button
              @click="toggleWishlist"
              class="absolute top-4 right-4 w-10 h-10 lg:w-12 lg:h-12 bg-white/90 backdrop-blur-sm 
                     hover:bg-white flex items-center justify-center shadow-lg 
                     transition-all duration-300 group z-10"
              :class="{ 'active': isInWishlist }"
              :aria-label="isInWishlist ? t('Remove from Wishlist') : t('Add to Wishlist')"
            >
              <svg 
                class="w-5 h-5 lg:w-6 lg:h-6 transition-colors duration-300"
                :class="isInWishlist ? 'text-pink-500 fill-current' : 'text-gray-600 group-hover:text-pink-500'"
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor"
              >
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="1.5" 
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          </div>
          
          <!-- Thumbnails - Compact Scroll -->
          <div v-if="productImages.length > 1" class="flex gap-2 lg:gap-3 mt-3 lg:mt-4 overflow-x-auto pb-1">
            <button
              v-for="(img, index) in productImages"
              :key="index"
              @click="selectedImage = img"
              :class="[
                'flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 overflow-hidden border-2 transition-all',
                selectedImage === img 
                  ? 'border-primary-500' 
                  : 'border-transparent hover:border-gray-300'
              ]"
            >
              <img 
                :src="img" 
                :alt="`${productName} - ${index + 1}`"
                class="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          </div>
        </div>

        <!-- Product Info - Compact Spacing -->
        <div :class="{ 'text-right': isRTL }" class="space-y-5 lg:space-y-6">
          <!-- Brand & Badges - Compact -->
          <div class="flex items-center flex-wrap gap-2 lg:gap-3">
            <span class="px-3 lg:px-4 py-1 lg:py-1.5 bg-primary-50 text-primary-700 text-xs lg:text-sm font-medium">
              {{ brandName }}
            </span>
            <span 
              v-if="product.isBestSeller"
              class="px-3 lg:px-4 py-1 lg:py-1.5 bg-emerald-100 text-emerald-700 text-xs lg:text-sm font-medium"
            >
              {{ t('Best Seller') }}
            </span>
            <span 
              v-if="isNewArrival"
              class="px-3 lg:px-4 py-1 lg:py-1.5 bg-blue-100 text-blue-700 text-xs lg:text-sm font-medium"
            >
              {{ t('New Arrival') }}
            </span>
          </div>

          <!-- Product Name - Responsive Typography -->
          <h1 class="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-display-en font-bold text-gray-900 leading-tight">
            {{ productName }}
          </h1>

          <!-- Price & Size - Compact -->
          <div class="flex flex-wrap items-center gap-3 lg:gap-4">
            <span class="text-2xl lg:text-3xl font-bold text-primary-600">
              {{ t('currencyLE') }} {{ product.price.toFixed(2) }}
            </span>
            <span class="text-gray-500 text-sm lg:text-lg">
              {{ product.size }} • {{ product.concentration }}
            </span>
          </div>

          <!-- Rating - Compact -->
          <div class="flex items-center gap-2">
            <div class="flex text-yellow-400">
              <svg v-for="i in 5" :key="i" class="w-4 h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            </div>
            <span class="text-sm lg:text-base text-gray-600">
              {{ productRating }} • {{ product.reviewCount || 0 }} {{ t('reviews') }}
            </span>
          </div>

          <!-- Description - Clean Typography -->
          <div class="prose prose-sm lg:prose-base max-w-none">
            <p class="text-gray-700 leading-relaxed whitespace-pre-line">
              {{ productDescriptionFull }}
            </p>
          </div>

          <!-- Fragrance Notes - Responsive Grid -->
          <div v-if="hasFragranceNotes" class="space-y-3 lg:space-y-4">
            <h3 class="text-lg lg:text-xl font-display-en font-bold">
              {{ t('Fragrance Notes') }}
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              <div class="bg-gray-50 p-4 lg:p-5" v-if="product.notes?.top?.length">
                <div class="text-primary-600 font-bold mb-2 flex items-center gap-2 text-sm lg:text-base">
                  <span class="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-primary-500 rounded-full"></span>
                  {{ t('Top Notes') }}
                </div>
                <div class="flex flex-wrap gap-1.5 lg:gap-2">
                  <span 
                    v-for="note in product.notes.top" 
                    :key="note"
                    class="px-2 lg:px-3 py-1 bg-white text-gray-700 text-xs lg:text-sm rounded-full"
                  >
                    {{ note }}
                  </span>
                </div>
              </div>
              <div class="bg-gray-50 p-4 lg:p-5" v-if="product.notes?.heart?.length">
                <div class="text-primary-600 font-bold mb-2 flex items-center gap-2 text-sm lg:text-base">
                  <span class="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-primary-500 rounded-full"></span>
                  {{ t('Heart Notes') }}
                </div>
                <div class="flex flex-wrap gap-1.5 lg:gap-2">
                  <span 
                    v-for="note in product.notes.heart" 
                    :key="note"
                    class="px-2 lg:px-3 py-1 bg-white text-gray-700 text-xs lg:text-sm rounded-full"
                  >
                    {{ note }}
                  </span>
                </div>
              </div>
              <div class="bg-gray-50 p-4 lg:p-5" v-if="product.notes?.base?.length">
                <div class="text-primary-600 font-bold mb-2 flex items-center gap-2 text-sm lg:text-base">
                  <span class="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-primary-500 rounded-full"></span>
                  {{ t('Base Notes') }}
                </div>
                <div class="flex flex-wrap gap-1.5 lg:gap-2">
                  <span 
                    v-for="note in product.notes.base" 
                    :key="note"
                    class="px-2 lg:px-3 py-1 bg-white text-gray-700 text-xs lg:text-sm rounded-full"
                  >
                    {{ note }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Add to Cart - Compact -->
          <div class="bg-gradient-to-br from-gray-50 to-gray-100 p-5 lg:p-6 space-y-5 lg:space-y-6">
            <!-- Quantity - Compact -->
            <div>
              <label class="block text-xs lg:text-sm font-medium text-gray-700 mb-2 lg:mb-3">
                {{ t('Quantity') }}
              </label>
              <div class="flex items-center gap-3 lg:gap-4">
                <button
                  @click="decreaseQuantity"
                  :disabled="quantity <= 1"
                  class="w-10 h-10 lg:w-12 lg:h-12 bg-white border border-gray-300 
                         flex items-center justify-center hover:border-primary-500 
                         disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span class="text-lg lg:text-xl">-</span>
                </button>
                <span class="text-xl lg:text-2xl font-bold w-8 lg:w-12 text-center">{{ quantity }}</span>
                <button
                  @click="increaseQuantity"
                  class="w-10 h-10 lg:w-12 lg:h-12 bg-white border border-gray-300 
                         flex items-center justify-center hover:border-primary-500"
                >
                  <span class="text-lg lg:text-xl">+</span>
                </button>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="space-y-3 lg:space-y-4">
              <button
                @click="addToCart"
                class="w-full bg-primary-500 text-white py-3 lg:py-4 font-bold 
                       hover:bg-primary-600 transition-all duration-300 
                       hover:-translate-y-0.5 shadow-gold-lg text-sm lg:text-base
                       relative overflow-hidden"
                :disabled="!product.isActive || isAddingToCart"
              >
                <!-- Loading state -->
                <span v-if="isAddingToCart" class="flex items-center justify-center gap-2">
                  <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{{ t('Adding...') }}</span>
                </span>
                
                <!-- Success animation -->
                <span v-else-if="showQuantityAnimation" class="flex items-center justify-center gap-2">
                  <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>{{ t('Added!') }}</span>
                </span>
                
                <!-- Normal state -->
                <template v-else>
                  <template v-if="!product.isActive">
                    {{ t('Out of Stock') }}
                  </template>
                  <template v-else>
                    {{ t('Add to Cart') }} • {{ t('currencyLE') }} {{ (product.price * quantity).toFixed(2) }}
                  </template>
                </template>
              </button>
              
              <!-- Wishlist Button -->
              <button
                @click="toggleWishlist"
                class="w-full border-2 py-3 lg:py-4 font-bold transition-all duration-300 text-sm lg:text-base
                       flex items-center justify-center gap-2"
                :class="[
                  isInWishlist 
                    ? 'border-pink-500 bg-pink-50 text-pink-600 hover:bg-pink-100' 
                    : 'border-gray-300 text-gray-700 hover:border-pink-500 hover:text-pink-600 hover:bg-pink-50'
                ]"
              >
                <svg 
                  class="w-5 h-5 lg:w-6 lg:h-6"
                  :class="isInWishlist ? 'fill-current' : ''"
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor"
                >
                  <path 
                    stroke-linecap="round" 
                    stroke-linejoin="round" 
                    stroke-width="1.5" 
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span>{{ isInWishlist ? t('Remove from Wishlist') : t('Add to Wishlist') }}</span>
              </button>
            </div>

            <!-- Shipping Info - Compact -->
            <div class="pt-5 lg:pt-6 border-t border-gray-200 space-y-3 lg:space-y-4">
              <div class="flex items-start gap-2 lg:gap-3" :class="{ 'flex-row-reverse': isRTL }">
                <svg class="w-4 h-4 lg:w-5 lg:h-5 text-primary-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M5 13l4 4L19 7"/>
                </svg>
                <div>
                  <p class="text-xs lg:text-sm font-medium text-gray-900">{{ t('Free Shipping') }}</p>
                  <p class="text-xs lg:text-sm text-gray-600">
                    {{ t('Free shipping on orders over $200') }}
                  </p>
                </div>
              </div>
              <div class="flex items-start gap-2 lg:gap-3" :class="{ 'flex-row-reverse': isRTL }">
                <svg class="w-4 h-4 lg:w-5 lg:h-5 text-primary-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M5 13l4 4L19 7"/>
                </svg>
                <div>
                  <p class="text-xs lg:text-sm font-medium text-gray-900">{{ t('Easy Returns') }}</p>
                  <p class="text-xs lg:text-sm text-gray-600">
                    {{ t('30-day return policy') }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Products - Optimized Spacing -->
      <div v-if="relatedProducts.length > 0" class="mt-16 lg:mt-20">
        <h2 class="text-2xl lg:text-3xl font-display-en font-bold mb-6 lg:mb-8">
          {{ t('You May Also Like') }}
        </h2>
        <ProductGrid 
          :products="relatedProducts" 
          @view-product="viewProduct"
          @add-to-cart="handleRelatedProductAdd"
          class="grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useLanguageStore } from '@/stores/language'
import { useProductsStore } from '@/stores/products'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import { useBrandsStore } from '@/stores/brands'
import ProductGrid from '@/components/Products/ProductGrid.vue'
import LoadingSpinner from '@/components/UI/LoadingSpinner.vue'
import SEOHead from '@/components/UI/SEOHead.vue'
import type { Product } from '@/types'

const route = useRoute()
const router = useRouter()
const languageStore = useLanguageStore()
const productsStore = useProductsStore()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()
const brandsStore = useBrandsStore()

// ✅ Use storeToRefs for reactive language refs
const { currentLanguage, isRTL } = storeToRefs(languageStore)
const { t } = languageStore  // t is a function, not a ref

// Safe language for indexing (only 'en' or 'ar')
const safeLang = computed(() => {
  const lang = currentLanguage.value
  return lang === 'en' || lang === 'ar' ? lang : 'en'
})

const product = ref<Product | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const quantity = ref(1)
const selectedImage = ref('')
const brandDetails = ref<any>(null)
const isAddingToCart = ref(false)
const showQuantityAnimation = ref(false)

// Computed properties with safe language indexing
const productName = computed(() => {
  return product.value?.name?.[safeLang.value] || ''
})

const productDescription = computed(() => {
  const desc = product.value?.description?.[safeLang.value] || ''
  return desc.length > 160 ? desc.substring(0, 160) + '...' : desc
})

// Full description for the main paragraph
const productDescriptionFull = computed(() => {
  return product.value?.description?.[safeLang.value] || ''
})

const productImage = computed(() => {
  return selectedImage.value || product.value?.imageUrl || ''
})

const productImages = computed(() => {
  if (!product.value) return []
  
  const images = [product.value.imageUrl || '']
  
  if (product.value.images && Array.isArray(product.value.images)) {
    product.value.images.forEach(img => {
      if (img && !images.includes(img)) {
        images.push(img)
      }
    })
  }
  
  return images.filter(Boolean)
})

const isNewArrival = computed(() => {
  if (!product.value?.isNew) return false
  return product.value.isNew
})

const productRating = computed(() => {
  if (!product.value?.rating) return '0.0'
  return typeof product.value.rating === 'number' ? product.value.rating.toFixed(1) : '0.0'
})

const hasFragranceNotes = computed(() => {
  if (!product.value?.notes) return false
  const notes = product.value.notes
  return (notes.top && notes.top.length > 0) || 
         (notes.heart && notes.heart.length > 0) || 
         (notes.base && notes.base.length > 0)
})

const brandSlug = computed(() => {
  return product.value?.brandSlug || product.value?.brand || ''
})

const brandName = computed(() => {
  if (brandDetails.value) {
    return brandDetails.value.name
  }
  
  if (product.value?.brandName) {
    return product.value.brandName
  }
  
  return brandSlug.value
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
})

const relatedProducts = computed(() => {
  if (!product.value) return []
  
  const sameBrandProducts = productsStore.products.filter(p => 
    p.id !== product.value?.id && 
    p.brandSlug === product.value?.brandSlug &&
    p.isActive
  )
  
  if (sameBrandProducts.length < 4) {
    const similarCategoryProducts = productsStore.products.filter(p => 
      p.id !== product.value?.id && 
      p.category === product.value?.category &&
      p.isActive &&
      !sameBrandProducts.find(sp => sp.id === p.id)
    )
    
    return [...sameBrandProducts, ...similarCategoryProducts].slice(0, 4)
  }
  
  return sameBrandProducts.slice(0, 4)
})

// Wishlist computed
const isInWishlist = computed(() => {
  if (!product.value) return false
  return wishlistStore.hasItem(product.value.id)
})

// Methods
const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const increaseQuantity = () => {
  quantity.value++
}

const addToCart = async () => {
  if (!product.value || !product.value.isActive) return
  
  isAddingToCart.value = true
  
  try {
    cartStore.addToCart(product.value, quantity.value)
    
    // Show success animation
    showQuantityAnimation.value = true
    setTimeout(() => {
      showQuantityAnimation.value = false
    }, 1000)
    
  } catch (error) {
    console.error('Failed to add to cart:', error)
  } finally {
    isAddingToCart.value = false
  }
}

const toggleWishlist = () => {
  if (!product.value) return
  wishlistStore.toggleWishlist(product.value)
}

const viewProduct = (relatedProduct: Product) => {
  router.push(`/product/${relatedProduct.slug}`)
}

const handleRelatedProductAdd = (relatedProduct: Product) => {
  cartStore.addToCart(relatedProduct, 1)
}

const loadBrandDetails = async () => {
  if (!brandSlug.value) return
  try {
    const brand = await brandsStore.getBrandBySlug(brandSlug.value)
    if (brand) {
      brandDetails.value = brand
    }
  } catch (error) {
    console.error('Failed to load brand details:', error)
  }
}

// Watch for route changes
watch(
  () => route.params.slug,
  async (newSlug) => {
    if (newSlug) {
      loading.value = true
      error.value = null
      
      try {
        const fetchedProduct = await productsStore.fetchProductBySlug(newSlug as string)
        
        if (!fetchedProduct) {
          error.value = t('Product not found')
          product.value = null
        } else {
          product.value = fetchedProduct
          selectedImage.value = product.value.imageUrl || ''
          quantity.value = 1
          await loadBrandDetails()
        }
      } catch (err: any) {
        error.value = err.message || t('Failed to load product')
        product.value = null
      } finally {
        loading.value = false
      }
    }
  },
  { immediate: true }
)

// On mounted
onMounted(async () => {
  if (productsStore.products.length === 0) {
    await productsStore.fetchProducts()
  }
  
  if (brandsStore.brands.length === 0) {
    await brandsStore.loadBrands()
  }
})
</script>

<style scoped>
/* ... (same styles as before) ... */
.shadow-luxury-lg {
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
}

.shadow-gold-lg {
  box-shadow: 0 10px 40px rgba(245, 158, 11, 0.3);
}

.font-display-en {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Responsive Sticky */
@media (min-width: 1024px) {
  .lg\:sticky {
    position: sticky;
    top: 24px;
  }
}

/* Loading Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

div[class*="bg-gradient"] {
  animation: fadeIn 0.5s ease-out;
}

/* Optimized Scrollbar - Thumbnails */
.overflow-x-auto::-webkit-scrollbar {
  height: 3px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 10px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Better Touch Targets - Mobile */
@media (max-width: 767px) {
  button, 
  .router-link,
  .brand-badge {
    min-height: 44px;
    min-width: 44px;
  }
  
  /* Prevent text overflow */
  .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

/* Aspect Ratio for Main Image - Mobile Only */
@media (max-width: 1023px) {
  .aspect-square {
    aspect-ratio: 1 / 1;
  }
}

/* Remove rounded corners */
.bg-gradient-to-br,
.bg-gray-50,
.bg-white,
.bg-primary-500,
.bg-primary-50,
.bg-emerald-100,
.bg-blue-100,
button,
img,
.overflow-hidden {
  border-radius: 0 !important;
}

/* Keep rounded-full only for dots and badges */
.rounded-full {
  border-radius: 9999px !important;
}

/* Prose optimizations */
.prose {
  max-width: none;
}

.prose p {
  margin-top: 0;
  margin-bottom: 1rem;
}

@media (min-width: 768px) {
  .prose p {
    margin-bottom: 1.25rem;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Animation for cart button */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.animate-pulse {
  animation: pulse 0.5s ease-in-out;
}

/* Wishlist button active state */
button.active svg {
  animation: heartBeat 0.3s ease-in-out;
}

@keyframes heartBeat {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
</style>