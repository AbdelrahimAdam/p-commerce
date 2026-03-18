<template>
  <div class="offer-page" :class="{ 'dark-mode': isDarkMode }">
    <div class="container">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>{{ t('loading') || 'Loading offer...' }}</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <p class="error-message">{{ error }}</p>
        <button @click="retry" class="retry-btn">{{ t('retry') || 'Retry' }}</button>
      </div>

      <!-- Offer Not Found -->
      <div v-else-if="!offer" class="not-found">
        <h2>{{ t('offerNotFound') || 'Offer not found' }}</h2>
        <router-link to="/offers" class="back-link">{{ t('viewAllOffers') || 'View All Offers' }}</router-link>
      </div>

      <!-- Offer Details -->
      <div v-else class="offer-details">
        <div v-if="offer.imageUrl" class="offer-image-section">
          <img
            :src="offer.imageUrl"
            :alt="offer.title"
            class="offer-main-image"
            @error="handleImageError"
          />
        </div>
        <!-- Optional fallback when image is missing -->
        <div v-else class="offer-image-section placeholder">
          <span>{{ t('noImage') || 'No image available' }}</span>
        </div>

        <div class="offer-info-section">
          <span class="offer-badge">{{ t('limitedOffer') || 'Limited Offer' }}</span>
          <h1 class="offer-title">{{ offer.title }}</h1>
          <p class="offer-subtitle">{{ offer.subtitle }}</p>

          <div class="offer-pricing">
            <span class="old-price">{{ formatPrice(offer.oldPrice) }}</span>
            <span class="new-price">{{ formatPrice(offer.newPrice) }}</span>
          </div>

          <div class="offer-description" v-html="formattedDescription"></div>

          <!-- Offer Type Badge -->
          <div v-if="offer.offerType" class="offer-type-badge">
            {{ getOfferTypeLabel(offer.offerType) }}
          </div>

          <!-- Terms & Conditions (if any) -->
          <div v-if="offer.terms" class="offer-terms">
            <h3>{{ t('termsAndConditions') || 'Terms & Conditions' }}</h3>
            <p>{{ offer.terms }}</p>
          </div>

          <!-- Validity Period (if dates are set) -->
          <div v-if="offer.startDate || offer.endDate" class="offer-validity">
            <span v-if="offer.startDate">
              {{ t('validFrom') || 'Valid from' }}: {{ formatDate(offer.startDate) }}
            </span>
            <span v-if="offer.endDate">
              {{ t('validUntil') || 'Valid until' }}: {{ formatDate(offer.endDate) }}
            </span>
          </div>

          <button class="buy-now-button" @click="navigateToBuy(offer)">
            <span class="button-text">{{ t('buyNow') || 'Buy Now' }}</span>
            <span class="button-icon">↗</span>
          </button>

          <router-link to="/offers" class="back-to-offers">
            ← {{ t('backToOffers') || 'Back to Offers' }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHomepageStore } from '@/stores/homepage'
import { useLanguageStore } from '@/stores/language'
import { useOffersStore } from '@/stores/offers'

const route = useRoute()
const router = useRouter()
const homepageStore = useHomepageStore()
const offersStore = useOffersStore()
const languageStore = useLanguageStore()
const { t, formatDate } = languageStore

// =================== UTILITY FUNCTIONS (DEFINED FIRST) ===================
const formatPrice = (price: number): string => {
  try {
    return new Intl.NumberFormat('en-EG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price || 0)
  } catch (err) {
    console.warn('Error formatting price:', err)
    return String(price || 0)
  }
}

// =================== LOCAL STATE ===================
const isLoading = ref(false)
const error = ref<string | null>(null)

// =================== COMPUTED ===================
const isDarkMode = computed(() => homepageStore.homepageData?.settings?.isDarkMode || false)
const activeOffers = computed(() => homepageStore.homepageData?.activeOffers || [])

const slugOrId = computed(() => route.params.slug as string)

// Find the offer by slug OR id from multiple sources
const offer = computed(() => {
  const identifier = slugOrId.value
  if (!identifier) return null
  
  console.log('🔍 Looking for offer with identifier:', identifier)
  
  // Try to find in homepage store first (fastest)
  let found = activeOffers.value.find(o => 
    o.slug === identifier || o.id === identifier
  )
  
  if (found) {
    console.log('✅ Offer found in homepage store:', found.title)
    return found
  }
  
  // If not found in homepage, try offers store (direct from Firebase)
  if (offersStore.offers.length > 0) {
    found = offersStore.offers.find(o => 
      o.slug === identifier || o.id === identifier
    )
    if (found) {
      console.log('✅ Offer found in offers store:', found.title)
      return found
    }
  }
  
  // Also check currentOffer from offers store
  if (offersStore.currentOffer && 
      (offersStore.currentOffer.slug === identifier || offersStore.currentOffer.id === identifier)) {
    console.log('✅ Offer found as currentOffer:', offersStore.currentOffer.title)
    return offersStore.currentOffer
  }
  
  console.log('❌ No offer found with identifier:', identifier)
  return null
})

// Format description with line breaks
const formattedDescription = computed(() => {
  if (!offer.value?.description) return ''
  return offer.value.description.replace(/\n/g, '<br />')
})

// =================== METHODS ===================
const loadOffer = async () => {
  const identifier = slugOrId.value
  if (!identifier) return
  
  isLoading.value = true
  error.value = null
  
  try {
    console.log('📥 Loading offer with identifier:', identifier)
    
    // First, ensure homepage data is loaded
    if (!homepageStore.homepageData?.activeOffers?.length) {
      await homepageStore.loadHomepageData()
    }
    
    // Check if we already have the offer in homepage store
    const existingOffer = activeOffers.value.find(o => 
      o.slug === identifier || o.id === identifier
    )
    
    if (existingOffer) {
      console.log('✅ Offer already loaded from homepage')
      return
    }
    
    // If not found in homepage, try direct from offers store
    console.log('🔄 Offer not in homepage, loading from offers store...')
    await offersStore.loadOffers(true) // Load only active offers
    
    // Try to get by slug specifically
    const offerFromStore = await offersStore.getOfferBySlug(identifier)
    if (offerFromStore) {
      console.log('✅ Offer loaded from offers store by slug')
      return
    }
    
    // If still not found and identifier might be an ID, try loading all and searching
    console.log('⚠️ Offer not found by slug, checking by ID in loaded offers...')
    const foundById = offersStore.offers.find(o => o.id === identifier)
    if (foundById) {
      console.log('✅ Offer found by ID in offers store')
      return
    }
    
    // If we get here, no offer was found
    console.log('❌ No offer found with identifier:', identifier)
    
  } catch (err: any) {
    console.error('❌ Error loading offer:', err)
    error.value = err.message || 'Failed to load offer'
  } finally {
    isLoading.value = false
  }
}

const retry = () => {
  loadOffer()
}

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  console.warn('Offer image failed to load:', img.src)
  // Hide the image instead of setting a 404 fallback
  img.style.display = 'none'
  // Optionally show a placeholder message in the parent div
  const parent = img.parentElement
  if (parent) {
    const placeholder = document.createElement('span')
    placeholder.className = 'image-placeholder'
    placeholder.textContent = t('imageNotAvailable') || 'Image not available'
    parent.appendChild(placeholder)
  }
}

const getOfferTypeLabel = (type: string): string => {
  const types: Record<string, string> = {
    percentage: t('percentageDiscount') || 'Percentage Discount',
    fixed: t('fixedAmount') || 'Fixed Amount',
    bundle: t('bundleOffer') || 'Bundle Offer',
    'free-shipping': t('freeShipping') || 'Free Shipping',
    'buy-one-get-one': t('buyOneGetOne') || 'Buy One Get One'
  }
  return types[type] || type
}

const navigateToBuy = (offer: any) => {
  if (offer?.linkUrl) {
    if (offer.linkUrl.startsWith('http')) {
      window.open(offer.linkUrl, '_blank')
    } else {
      router.push(offer.linkUrl)
    }
  } else {
    alert(t('offerNoDirectLink') || 'No direct link available for this offer')
  }
}

// =================== WATCHERS ===================
watch(() => route.params.slug, () => {
  loadOffer()
})

// =================== LIFECYCLE ===================
onMounted(() => {
  loadOffer()
})
</script>

<style scoped>
.offer-page {
  min-height: 100vh;
  background: var(--bg-primary, #f8f5f0);
  padding: 2rem 1rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Loading & Error states */
.loading-state,
.error-state,
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(212, 175, 55, 0.2);
  border-top-color: #d4af37;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin { to { transform: rotate(360deg); } }

.error-message {
  color: #e53e3e;
  margin-bottom: 1rem;
}

.retry-btn,
.back-link {
  background: #d4af37;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
}
.retry-btn:hover,
.back-link:hover {
  background: #b8941f;
}

/* Offer Details Layout */
.offer-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  background: var(--bg-secondary, #ffffff);
  border: 1px solid var(--border-color, rgba(212,175,55,0.15));
  padding: 2rem;
}

@media (max-width: 768px) {
  .offer-details {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

.offer-image-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  background: #f9f9f9;
}

.offer-image-section.placeholder {
  color: #999;
  font-style: italic;
}

.offer-main-image {
  max-width: 100%;
  max-height: 500px;
  object-fit: contain;
  border: 1px solid var(--border-color, rgba(212,175,55,0.15));
}

.image-placeholder {
  display: block;
  padding: 1rem;
  color: #999;
  font-style: italic;
}

.offer-info-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.offer-badge {
  background: linear-gradient(to right, #c41e3a, #e63946);
  color: white;
  padding: 0.3rem 1rem;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 1px;
  align-self: flex-start;
}

.offer-title {
  font-size: 2.5rem;
  font-weight: 400;
  color: var(--text-primary, #1a120b);
  letter-spacing: 2px;
  margin: 0;
}

.offer-subtitle {
  font-size: 1.2rem;
  color: var(--text-secondary, rgba(26,18,11,0.7));
  font-style: italic;
  margin: 0;
}

.offer-pricing {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin: 1rem 0;
}

.old-price {
  font-size: 1.5rem;
  color: var(--text-tertiary, rgba(26,18,11,0.5));
  text-decoration: line-through;
}

.new-price {
  font-size: 3rem;
  color: #d4af37;
  font-weight: 800;
}

.offer-description {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-secondary, rgba(26,18,11,0.8));
  white-space: pre-line;
}

.offer-type-badge {
  display: inline-block;
  background: var(--gold-primary, #d4af37);
  color: white;
  padding: 0.2rem 0.8rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  align-self: flex-start;
}

.offer-terms {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--bg-tertiary, #f9f9f9);
  border-left: 3px solid #d4af37;
}
.offer-terms h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.offer-terms p {
  font-size: 0.9rem;
  color: var(--text-secondary, rgba(26,18,11,0.7));
}

.offer-validity {
  font-size: 0.9rem;
  color: var(--text-secondary, rgba(26,18,11,0.6));
  display: flex;
  gap: 1rem;
}

.buy-now-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  background: linear-gradient(135deg, #d4af37, #b8941f);
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 8px 20px rgba(212,175,55,0.3);
  width: fit-content;
}

.buy-now-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(212,175,55,0.4);
}

.button-icon {
  font-size: 1.3rem;
}

.back-to-offers {
  color: var(--text-secondary, rgba(26,18,11,0.7));
  text-decoration: none;
  font-size: 0.9rem;
  margin-top: 1rem;
}
.back-to-offers:hover {
  color: #d4af37;
}

/* Dark mode support */
.dark-mode .offer-details {
  background: #1a1a1a;
}
.dark-mode .offer-title,
.dark-mode .offer-subtitle,
.dark-mode .offer-description,
.dark-mode .offer-terms p {
  color: #f5f5f5;
}
.dark-mode .old-price { color: rgba(255,255,255,0.6); }
.dark-mode .new-price { color: #f0d475; }
.dark-mode .offer-terms {
  background: #2a2a2a;
}
</style>