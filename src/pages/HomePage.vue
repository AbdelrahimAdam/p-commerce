<!-- src/pages/HomePage.vue -->
<template>
  <div class="luxury-perfume-homepage" :class="{ 'dark-mode': isDarkMode, 'rtl-direction': isRTL, 'ltr-direction': !isRTL }">
    <!-- Loading Spinner -->
    <div v-if="homepageStore.isLoading || brandsStore.isLoading" class="loading-overlay">
      <div class="luxury-spinner">
        <div class="spinner-gold-ring"></div>
        <div class="spinner-glow"></div>
        <div class="spinner-diamond">◆</div>
      </div>
    </div>

    <!-- Hero Banner - Sticky at Top -->
    <section class="hero-banner">
      <div class="banner-image-wrapper">
        <img 
          :src="heroBanner.imageUrl || '/images/banner.jpg'" 
          alt="Luxury Perfume Banner"
          class="hero-image"
          @error="handleImageError"
        />
        <div class="gradient-overlay"></div>
      </div>

      <div class="banner-container">
        <router-link :to="heroBanner.linkUrl || '/shop'" class="shop-now-link">
          <span class="link-icon">↗</span>
          <span class="link-text">{{ heroBanner.linkText || t('shopNow') }}</span>
        </router-link>
      </div>
    </section>

    <!-- Main Content -->
    <section class="main-content-section">
      <div class="content-container">
        <!-- MOBILE LAYOUT (with slider) -->
        <div class="mobile-content-layout">
          <div class="section-header">
            <h2 class="section-title">{{ t('featuredBrands') }}</h2>
            <div class="section-header-right">
              <router-link to="/brands" class="explore-more-link">
                <span>{{ t('exploreMore') }}</span>
                <span class="explore-icon">↗</span>
              </router-link>
            </div>
          </div>

          <div class="main-content-layout">
            <div class="featured-brands-section">
              <div v-if="displayBrands.length > 0" class="brands-grid">
                <router-link
                  v-for="brand in displayBrands"
                  :key="brand.id || brand.name"
                  :to="`/brand/${brand.slug || brand.id || 'brand'}`"
                  class="brand-card-link"
                >
                  <div class="brand-card">
                    <div class="brand-image-full">
                      <img 
                        :src="brand.image || '/images/default-brand.jpg'" 
                        :alt="brand.name || 'Brand'" 
                        loading="lazy"
                        class="brand-image"
                        @error="handleBrandImageError"
                      />
                      <div class="image-gradient-overlay"></div>
                    </div>
                    <div class="brand-info-overlay">
                      <h3 class="brand-name">{{ brand.name || t('brandName') }}</h3>
                      <p class="brand-signature">{{ brand.signature || t('luxurySignature') }}</p>
                      <div class="product-count">
                        <span class="count-number">{{ getProductCount(brand) }}</span>
                        <span class="count-label">{{ t('products') }}</span>
                      </div>
                    </div>
                  </div>
                </router-link>
              </div>
              <div v-else class="no-data-message">
                <p>{{ t('noBrandsAvailable') }}</p>
              </div>
            </div>

            <!-- Mobile Offer Card - with slider -->
            <aside class="offer-sidebar">
              <div v-if="activeOffers.length > 0" class="offer-card offer-card-slider">
                <div class="offer-badge">{{ t('offer') }}</div>

                <Transition name="fade" mode="out-in">
                  <div
                    v-if="activeOffers.length > 0"
                    :key="currentOfferIndex"
                    class="offer-slide"
                  >
                    <div class="offer-image-full">
                      <img
                        :src="activeOffers[currentOfferIndex].imageUrl || PLACEHOLDER_IMAGE"
                        :alt="activeOffers[currentOfferIndex].title || t('exclusiveOffer')"
                        class="offer-image"
                        @error="handleOfferImageError"
                      />
                      <div class="offer-gradient-overlay"></div>
                    </div>
                    <div class="offer-details-overlay">
                      <h3 class="offer-title">{{ activeOffers[currentOfferIndex].title || t('specialOffer') }}</h3>
                      <p class="offer-subtitle">{{ activeOffers[currentOfferIndex].subtitle || t('limitedTime') }}</p>
                      <div class="offer-pricing">
                        <span class="old-price">{{ formatPrice(activeOffers[currentOfferIndex].oldPrice || 0) }}</span>
                        <span class="new-price">{{ formatPrice(activeOffers[currentOfferIndex].newPrice || 0) }}</span>
                      </div>
                      <button class="buy-now-button" @click="navigateToOffer(activeOffers[currentOfferIndex])">
                        <span class="button-text">{{ t('buyNow') }}</span>
                        <span class="button-icon">↗</span>
                      </button>
                    </div>
                  </div>
                </Transition>

                <div v-if="activeOffers.length > 1" class="slide-indicators">
                  <span
                    v-for="(_, index) in activeOffers"
                    :key="index"
                    class="indicator-dot"
                    :class="{ active: index === currentOfferIndex }"
                    @click="goToOffer(index)"
                  ></span>
                </div>
              </div>
              <div v-else class="no-offer-message">
                <p>{{ t('noOffers') }}</p>
              </div>
            </aside>
          </div>
        </div>

        <!-- DESKTOP LAYOUT (with slider) -->
        <div class="desktop-content-layout">
          <div class="featured-brands">
            <div class="section-header">
              <h2 class="section-title">{{ t('featuredBrands') }}</h2>
              <router-link to="/brands" class="view-more-brands">
                <span>{{ t('exploreMore') }}</span>
                <span class="explore-icon">↗</span>
              </router-link>
            </div>

            <div v-if="displayBrands.length > 0" class="brands-grid">
              <router-link
                v-for="brand in displayBrands"
                :key="brand.id || brand.name"
                :to="`/brand/${brand.slug || brand.id || 'brand'}`"
                class="brand-card-link"
              >
                <div class="brand-card">
                  <div class="brand-image-wrapper">
                    <img 
                      :src="brand.image || '/images/default-brand.jpg'" 
                      :alt="brand.name || 'Brand'" 
                      loading="lazy"
                      class="brand-image"
                      @error="handleBrandImageError"
                    />
                  </div>
                  <div class="brand-info">
                    <h3 class="brand-name">{{ brand.name || t('brandName') }}</h3>
                    <p class="brand-signature">{{ brand.signature || t('luxurySignature') }}</p>
                    <p class="brand-price">{{ getProductCount(brand) }} {{ t('products') }}</p>
                  </div>
                </div>
              </router-link>
            </div>
            <div v-else class="no-data-message">
              <p>{{ t('noBrandsAvailable') }}</p>
            </div>
          </div>

          <!-- Desktop Offer Card - with slider -->
          <aside class="offer-sidebar">
            <div v-if="activeOffers.length > 0" class="offer-card offer-card-slider">
              <div class="offer-badge">{{ t('exclusive') }}</div>

              <Transition name="fade" mode="out-in">
                <div
                  v-if="activeOffers.length > 0"
                  :key="currentOfferIndex"
                  class="offer-slide"
                >
                  <div class="offer-image-full">
                    <img
                      :src="activeOffers[currentOfferIndex].imageUrl || PLACEHOLDER_IMAGE"
                      :alt="activeOffers[currentOfferIndex].title || t('exclusiveOffer')"
                      class="offer-image"
                      @error="handleOfferImageError"
                    />
                    <div class="offer-gradient-overlay"></div>
                  </div>
                  <div class="offer-details-overlay">
                    <h3 class="offer-title">{{ activeOffers[currentOfferIndex].title || t('specialOffer') }}</h3>
                    <p class="offer-subtitle">{{ activeOffers[currentOfferIndex].subtitle || t('limitedTime') }}</p>
                    <div class="offer-pricing">
                      <span class="old-price">{{ formatPrice(activeOffers[currentOfferIndex].oldPrice || 0) }}</span>
                      <span class="new-price">{{ formatPrice(activeOffers[currentOfferIndex].newPrice || 0) }}</span>
                    </div>
                    <button class="buy-now-button" @click="navigateToOffer(activeOffers[currentOfferIndex])">
                      <span class="button-text">{{ t('View Offer') }}</span>
                      <span class="button-icon">↗</span>
                    </button>
                  </div>
                </div>
              </Transition>

              <div v-if="activeOffers.length > 1" class="slide-indicators">
                <span
                  v-for="(_, index) in activeOffers"
                  :key="index"
                  class="indicator-dot"
                  :class="{ active: index === currentOfferIndex }"
                  @click="goToOffer(index)"
                ></span>
              </div>
            </div>
            <div v-else class="no-offer-message">
              <p>{{ t('noOffers') }}</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguageStore } from '@/stores/language'
import { useHomepageStore } from '@/stores/homepage'
import { useBrandsStore } from '@/stores/brands'
import { useTenantStore } from '@/stores/tenant'
import type { Brand } from '@/types'

// ========== PROPS ==========
// The isPreview prop is used to indicate when the homepage is rendered in the admin preview.
// It is not used in the template to keep logic unchanged, but is available for future use.
defineProps<{
  isPreview?: boolean
}>()

// Transparent 1x1 GIF placeholder (data URI) – no network request
const PLACEHOLDER_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///y5BAEAAAAALAAAAAABAAEAAAIBRAA7'

const router = useRouter()
const languageStore = useLanguageStore()
const homepageStore = useHomepageStore()
const brandsStore = useBrandsStore()
const tenantStore = useTenantStore()
const { t } = languageStore

// =================== COMPUTED ===================
const homepageData = computed(() => homepageStore.homepageData || {})
const heroBanner = computed(() => homepageData.value.heroBanner || {})
const activeOffers = computed(() => homepageData.value.activeOffers || [])

const dataSource = computed(() => homepageData.value.source || 'unknown')
const isDarkMode = computed(() => homepageData.value.settings?.isDarkMode || false)

const isRTL = computed(() => {
  const currentLang = languageStore.currentLanguage;
  return currentLang === 'ar' || currentLang === 'fa' || currentLang === 'he';
})

const activeBrands = computed(() => brandsStore.activeBrands || [])
const allBrands = computed(() => brandsStore.brands || [])

const displayBrands = computed(() => {
  const brands = activeBrands.value.length > 0 ? activeBrands.value : allBrands.value
  return brands.slice(0, 6)
})

const getProductCount = (brand: Brand) => {
  if (!brand.id) return 0
  if (Array.isArray(brand.productIds) && brand.productIds.length > 0) {
    return brand.productIds.length
  }
  if (brand.productCount !== undefined) return brand.productCount
  return 0
}

// =================== OFFER SLIDER STATE ===================
const currentOfferIndex = ref(0)
let offerTimer: NodeJS.Timeout | null = null

// Start auto-rotation if more than one offer
const startOfferRotation = () => {
  if (offerTimer) clearInterval(offerTimer)
  if (activeOffers.value.length > 1) {
    offerTimer = setInterval(() => {
      currentOfferIndex.value = (currentOfferIndex.value + 1) % activeOffers.value.length
    }, 10000) // 10 seconds
  }
}

const stopOfferRotation = () => {
  if (offerTimer) {
    clearInterval(offerTimer)
    offerTimer = null
  }
}

const goToOffer = (index: number) => {
  currentOfferIndex.value = index
  // Reset timer on manual navigation
  stopOfferRotation()
  startOfferRotation()
}

// Watch for changes in offers (admin updates)
watch(activeOffers, (_newOffers) => {
  currentOfferIndex.value = 0
  stopOfferRotation()
  startOfferRotation()
}, { deep: true })

// =================== LIFECYCLE ===================
onMounted(async () => {
  console.log('🏠 HomePage.vue mounted - Tenant:', tenantStore.tenantId, 'Slug:', tenantStore.tenantSlug)
  document.documentElement.style.scrollBehavior = 'smooth'
  
  // Subscribe to homepage updates
  homepageStore.subscribeToUpdates((data) => {
    console.log('📡 Homepage store update notification:', {
      source: data.source,
      offers: data.activeOffers?.length,
      timestamp: data.lastUpdated,
      tenant: tenantStore.tenantId
    })
  })
  
  try {
    console.log('📥 Loading homepage data for tenant:', tenantStore.tenantId || tenantStore.tenantSlug)
    await Promise.all([
      homepageStore.loadHomepageData(),
      brandsStore.initialize()
    ])
    
    console.log('✅ All data loaded:', {
      source: dataSource.value,
      allBrands: allBrands.value.length,
      activeBrands: activeBrands.value.length,
      displayBrands: displayBrands.value.length,
      offers: activeOffers.value.length,
      darkMode: isDarkMode.value,
      tenant: tenantStore.tenantId,
      brandsStoreError: brandsStore.error
    })
    
    // Start offer rotation after data loaded
    startOfferRotation()
    
  } catch (err: any) {
    console.error('❌ Could not load homepage data:', err.message)
  }
  
  // Intersection observer for animations (unchanged)
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view')
        }
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  )
  
  setTimeout(() => {
    document.querySelectorAll('.brand-card, .offer-card').forEach((el) => {
      observer.observe(el)
    })
  }, 100)
})

onUnmounted(() => {
  stopOfferRotation()
  homepageStore.stopListening()
})

// =================== OTHER METHODS ===================
// Updated navigateToOffer with linkUrl support
const navigateToOffer = (offer: any) => {
  if (offer?.linkUrl) {
    // Check if it's an external link
    if (offer.linkUrl.startsWith('http')) {
      window.open(offer.linkUrl, '_blank')
    } else {
      router.push(offer.linkUrl)
    }
  } else if (offer?.slug) {
    router.push(`/offer/${offer.slug}`)
  } else if (offer?.id) {
    router.push(`/offer/${offer.id}`)
  } else {
    router.push('/offers')
  }
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-EG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/images/default-logo.png'
}

const handleBrandImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/images/default-brand.jpg'
}

const handleOfferImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  // Use the same transparent placeholder to avoid further errors
  img.src = PLACEHOLDER_IMAGE
}
</script>

<style scoped>
/* ============================================= */
/* STICKY BANNER - FIXED AT TOP */
/* ============================================= */

.luxury-perfume-homepage {
  --bg-primary: linear-gradient(135deg, #ffffff 0%, #f8f5f0 100%);
  --bg-secondary: #ffffff;
  --text-primary: #1a120b;
  --text-secondary: rgba(26, 18, 11, 0.7);
  --text-tertiary: rgba(26, 18, 11, 0.5);
  --gold-primary: #d4af37;
  --gold-secondary: #c9a42e;
  --gold-tertiary: #b8941f;
  --gold-glow: rgba(212, 175, 55, 0.8);
  --border-color: rgba(212, 175, 55, 0.15);
  --card-shadow: 0 4px 12px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
  --glass-bg: rgba(255, 255, 255, 0.12);
  --glass-border: rgba(212, 175, 55, 0.25);
  --offer-badge: linear-gradient(to right, #c41e3a, #e63946);
  --overlay-gradient: linear-gradient(to bottom, transparent 60%, rgba(0, 0, 0, 0.95));
  
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Georgia', 'Times New Roman', serif;
  overflow-x: hidden;
  min-height: 100vh;
  transition: all 0.3s ease;
  margin: 0;
  padding: 0;
}

/* Dark Mode */
.luxury-perfume-homepage.dark-mode {
  --bg-primary: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
  --bg-secondary: #1a1a1a;
  --text-primary: #f5f5f5;
  --text-secondary: rgba(245, 245, 245, 0.8);
  --text-tertiary: rgba(245, 245, 245, 0.6);
  --gold-primary: #f0d475;
  --gold-secondary: #e6c158;
  --gold-tertiary: #d4af37;
  --gold-glow: rgba(240, 212, 117, 0.9);
  --border-color: rgba(212, 175, 55, 0.25);
  --card-shadow: 0 4px 12px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.3);
  --glass-bg: rgba(26, 26, 26, 0.3);
  --glass-border: rgba(212, 175, 55, 0.4);
  --offer-badge: linear-gradient(to right, #e63946, #ff6b6b);
}

/* ===== NO ROUNDED EDGES ===== */
.banner-image-wrapper,
.shop-now-link,
.brand-card,
.offer-card,
.buy-now-button,
.explore-more-link,
.view-more-brands,
.product-count,
.slide-indicators .indicator-dot {
  border-radius: 0 !important;
}

/* ===== LOADING SPINNER ===== */
.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.luxury-perfume-homepage.dark-mode .loading-overlay {
  background: rgba(15, 15, 15, 0.95);
}

.luxury-spinner {
  position: relative;
  width: 60px;
  height: 60px;
}

.spinner-gold-ring {
  width: 100%;
  height: 100%;
  border: 3px solid rgba(212, 175, 55, 0.2);
  border-top: 3px solid var(--gold-primary);
  border-right: 3px solid var(--gold-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-glow {
  position: absolute;
  inset: -8px;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%);
  border-radius: 50%;
}

.spinner-diamond {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--gold-primary);
  font-size: 20px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@keyframes pulse { 
  0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
}

/* ===== HERO BANNER ===== */
.hero-banner {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-top: 0;
  padding-top: 0;
  background: var(--bg-primary);
}

.banner-image-wrapper {
  position: relative;
  width: 100%;
  line-height: 0;
}

.hero-image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: contain;
  object-position: center;
}

.gradient-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.4) 100%);
  z-index: 2;
  pointer-events: none;
}

.banner-container {
  position: absolute;
  inset: 0;
  z-index: 4;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  padding: 1.5rem 1rem;
  pointer-events: none;
}

.shop-now-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--gold-primary) !important;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-decoration: none;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
  padding: 0.5rem 0;
  pointer-events: auto;
  transition: opacity 0.2s ease;
}

.shop-now-link:hover {
  opacity: 0.8;
  text-decoration: underline;
  text-underline-offset: 4px;
}

.link-icon {
  font-size: 1.1rem;
  font-weight: bold;
  color: inherit;
}

.link-text {
  color: inherit;
}

@media (max-width: 480px) {
  .shop-now-link {
    font-size: 0.85rem;
    gap: 0.3rem;
  }
  .link-icon {
    font-size: 0.95rem;
  }
}

@media (min-width: 481px) and (max-width: 768px) {
  .shop-now-link {
    font-size: 0.9rem;
  }
}

.luxury-perfume-homepage.dark-mode .shop-now-link {
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
}

/* ===== MAIN CONTENT ===== */
.main-content-section {
  padding: 1.5rem 1rem;
  background: var(--bg-primary);
  position: relative;
  z-index: 1;
}

@media (min-width: 640px) {
  .main-content-section { padding: 2rem 1.5rem; }
}

@media (min-width: 1024px) {
  .main-content-section { padding: 3rem 2rem; }
}

.content-container {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* ===== MOBILE LAYOUT (with slider) ===== */
.mobile-content-layout {
  display: block;
}

@media (min-width: 1024px) {
  .mobile-content-layout { display: none; }
}

/* Section Header */
.mobile-content-layout .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  gap: 0.75rem;
}

.mobile-content-layout .section-title {
  font-size: 1.6rem;
  font-weight: 400;
  background: linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #D4AF37 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: 1.5px;
  margin: 0;
}

.mobile-content-layout .explore-more-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #D4AF37 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.8rem;
  letter-spacing: 0.8px;
  padding: 0.4rem 0.8rem;
  border: 1px solid rgba(212, 175, 55, 0.3);
}

/* Main Content Layout - 3 Column Grid */
.mobile-content-layout .main-content-layout {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  align-items: start;
}

.mobile-content-layout .featured-brands-section {
  grid-column: span 2;
  width: 100%;
}

.mobile-content-layout .offer-sidebar {
  grid-column: 3;
  width: 100%;
  height: 100%;
}

/* Brands Grid */
.mobile-content-layout .brands-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

/* Brand Card */
.mobile-content-layout .brand-card-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.mobile-content-layout .brand-card {
  display: block;
  width: 100%;
  position: relative;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  overflow: hidden;
  aspect-ratio: 3/4;
}

.mobile-content-layout .brand-image-full {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.mobile-content-layout .brand-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  transition: transform 0.4s ease;
}

.mobile-content-layout .brand-card:hover .brand-image {
  transform: scale(1.05);
}

.mobile-content-layout .image-gradient-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.8) 100%);
  pointer-events: none;
}

.mobile-content-layout .brand-info-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.75rem;
  z-index: 2;
}

.mobile-content-layout .brand-name {
  font-size: 0.85rem;
  color: #ffffff;
  letter-spacing: 0.8px;
  margin: 0 0 0.2rem 0;
  font-weight: 600;
  text-transform: uppercase;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.mobile-content-layout .brand-signature {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 0.4rem 0;
  font-style: italic;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.mobile-content-layout .product-count {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  padding: 0.2rem 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.mobile-content-layout .count-number {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--gold-primary);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.mobile-content-layout .count-label {
  font-size: 0.55rem;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

/* Mobile Offer Card - Slider Version */
.mobile-content-layout .offer-card-slider {
  position: relative;
  background: var(--bg-secondary);
  border: 2px solid var(--gold-primary);
  overflow: hidden;
  height: 100%;
  min-height: 380px;
  width: 100%;
}

.mobile-content-layout .offer-slide {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.mobile-content-layout .offer-image-full {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.mobile-content-layout .offer-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

.mobile-content-layout .offer-gradient-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, 
    transparent 0%, 
    rgba(0, 0, 0, 0.4) 50%, 
    rgba(0, 0, 0, 0.9) 100%);
  pointer-events: none;
}

.mobile-content-layout .offer-details-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  z-index: 2;
  text-align: center;
  color: #ffffff;
}

.mobile-content-layout .offer-title {
  font-size: 1.1rem;
  letter-spacing: 1px;
  margin: 0 0 0.2rem 0;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.mobile-content-layout .offer-subtitle {
  font-size: 0.7rem;
  margin-bottom: 0.6rem;
  font-style: italic;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.mobile-content-layout .offer-pricing {
  margin: 0.6rem 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.6rem;
}

.mobile-content-layout .old-price {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: line-through;
}

.mobile-content-layout .new-price {
  font-size: 1.3rem;
  color: var(--gold-primary);
  font-weight: 800;
  text-shadow: 0 2px 8px rgba(212, 175, 55, 0.5);
}

.mobile-content-layout .buy-now-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  background: linear-gradient(135deg, var(--gold-primary) 0%, var(--gold-tertiary) 100%);
  color: #ffffff;
  border: none;
  padding: 0.6rem 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  width: 100%;
}

.mobile-content-layout .offer-badge {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 5;
  background: var(--offer-badge);
  color: #ffffff;
  text-align: center;
  padding: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
}

/* Slide indicators */
.mobile-content-layout .slide-indicators {
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 8px;
  z-index: 10;
}

.mobile-content-layout .indicator-dot {
  width: 8px;
  height: 8px;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.mobile-content-layout .indicator-dot.active {
  background: var(--gold-primary);
  transform: scale(1.2);
}

/* Mobile spacing optimizations */
@media (max-width: 767px) {
  .mobile-content-layout .main-content-layout { gap: 0.625rem; }
  .mobile-content-layout .brands-grid { gap: 0.625rem; }
  .mobile-content-layout .brand-card { aspect-ratio: 3/4; }
  .mobile-content-layout .offer-card-slider { min-height: 340px; }
  .mobile-content-layout .brand-name { font-size: 0.8rem; }
  .mobile-content-layout .brand-signature { font-size: 0.6rem; }
  .mobile-content-layout .brand-info-overlay { padding: 0.6rem; }
}

@media (max-width: 640px) {
  .mobile-content-layout .brands-grid { gap: 0.5rem; }
  .mobile-content-layout .brand-card { min-height: 160px; }
  .mobile-content-layout .brand-name { font-size: 0.75rem; }
  .mobile-content-layout .offer-card-slider { min-height: 320px; }
}

@media (max-width: 480px) {
  .mobile-content-layout .main-content-layout { gap: 0.5rem; }
  .mobile-content-layout .brands-grid { gap: 0.5rem; }
  .mobile-content-layout .brand-card { min-height: 140px; }
  .mobile-content-layout .brand-name { font-size: 0.7rem; letter-spacing: 0.6px; }
  .mobile-content-layout .brand-signature { font-size: 0.55rem; }
  .mobile-content-layout .brand-info-overlay { padding: 0.5rem; }
  .mobile-content-layout .offer-card-slider { min-height: 300px; }
}

@media (max-width: 360px) {
  .mobile-content-layout .brands-grid { gap: 0.375rem; }
  .mobile-content-layout .brand-card { min-height: 120px; }
  .mobile-content-layout .brand-name { font-size: 0.65rem; }
  .mobile-content-layout .brand-signature { font-size: 0.5rem; }
  .mobile-content-layout .offer-card-slider { min-height: 280px; }
}

/* ===== DESKTOP LAYOUT (with slider) ===== */
.desktop-content-layout {
  display: none;
}

@media (min-width: 1024px) {
  .desktop-content-layout {
    display: flex;
    flex-direction: row;
    gap: 3rem;
  }
}

.desktop-content-layout .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.desktop-content-layout .section-title {
  font-size: 2rem;
  font-weight: 400;
  color: var(--text-primary);
  letter-spacing: 2px;
  margin: 0;
}

.desktop-content-layout .view-more-brands {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #D4AF37 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 1px;
  padding: 0.5rem 1rem;
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.desktop-content-layout .featured-brands {
  flex: 1;
}

.desktop-content-layout .brands-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

/* Desktop Brand Cards */
.desktop-content-layout .brand-card-link {
  text-decoration: none;
  color: inherit;
}

.desktop-content-layout .brand-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  overflow: hidden;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.desktop-content-layout .brand-card:hover {
  border-color: var(--gold-primary);
  transform: translateY(-4px);
  box-shadow: 0 15px 30px rgba(212, 175, 55, 0.15);
}

.desktop-content-layout .brand-image-wrapper {
  width: 100%;
  aspect-ratio: 3/4;
  overflow: hidden;
}

.desktop-content-layout .brand-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.desktop-content-layout .brand-card:hover .brand-image {
  transform: scale(1.08);
}

.desktop-content-layout .brand-info {
  padding: 1rem;
  text-align: center;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
}

.desktop-content-layout .brand-name {
  font-size: 1rem;
  color: var(--text-primary);
  letter-spacing: 1.2px;
  margin: 0 0 0.3rem 0;
  font-weight: 600;
  text-transform: uppercase;
}

.desktop-content-layout .brand-signature {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: 0 0 0.5rem 0;
  font-style: italic;
}

.desktop-content-layout .brand-price {
  font-size: 0.8rem;
  color: var(--gold-primary);
  font-weight: 600;
}

/* Desktop Offer Card - Slider Version */
.desktop-content-layout .offer-sidebar {
  width: 100%;
  max-width: 360px;
  align-self: start;
  position: sticky;
  top: 100px;
}

.desktop-content-layout .offer-card-slider {
  position: relative;
  background: var(--bg-secondary);
  border: 2px solid var(--gold-primary);
  overflow: hidden;
  min-height: 800px; /* Increased to match height of two brand cards */
  width: 100%;
}

.desktop-content-layout .offer-slide {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.desktop-content-layout .offer-image-full {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.desktop-content-layout .offer-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

.desktop-content-layout .offer-gradient-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, 
    transparent 0%, 
    rgba(0, 0, 0, 0.4) 50%, 
    rgba(0, 0, 0, 0.9) 100%);
  pointer-events: none;
}

.desktop-content-layout .offer-details-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.5rem;
  z-index: 2;
  text-align: center;
  color: #ffffff;
}

.desktop-content-layout .offer-title {
  font-size: 1.6rem;
  letter-spacing: 1.5px;
  margin: 0 0 0.3rem 0;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.desktop-content-layout .offer-subtitle {
  font-size: 0.85rem;
  margin-bottom: 1rem;
  font-style: italic;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.desktop-content-layout .offer-pricing {
  margin: 1.2rem 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.2rem;
}

.desktop-content-layout .old-price {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: line-through;
}

.desktop-content-layout .new-price {
  font-size: 2rem;
  color: var(--gold-primary);
  font-weight: 800;
  text-shadow: 0 2px 8px rgba(212, 175, 55, 0.5);
}

.desktop-content-layout .buy-now-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  background: linear-gradient(135deg, var(--gold-primary) 0%, var(--gold-tertiary) 100%);
  color: #ffffff;
  border: none;
  padding: 0.8rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
  width: 100%;
}

.desktop-content-layout .buy-now-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(212, 175, 55, 0.4);
}

.desktop-content-layout .offer-badge {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 5;
  background: var(--offer-badge);
  color: #ffffff;
  text-align: center;
  padding: 0.75rem;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

/* Slide indicators for desktop */
.desktop-content-layout .slide-indicators {
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 8px;
  z-index: 10;
}

.desktop-content-layout .indicator-dot {
  width: 8px;
  height: 8px;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.desktop-content-layout .indicator-dot.active {
  background: var(--gold-primary);
  transform: scale(1.2);
}

/* Fade transition for slides (shared) */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ===== NO DATA MESSAGES ===== */
.no-data-message,
.no-offer-message {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--text-secondary);
  font-style: italic;
  font-size: 0.9rem;
}

/* ===== RTL SUPPORT ===== */
.luxury-perfume-homepage.rtl-direction {
  direction: rtl;
  text-align: right;
}

.luxury-perfume-homepage.rtl-direction .section-header {
  flex-direction: row-reverse;
}

.luxury-perfume-homepage.rtl-direction .explore-more-link,
.luxury-perfume-homepage.rtl-direction .view-more-brands,
.luxury-perfume-homepage.rtl-direction .shop-now-link,
.luxury-perfume-homepage.rtl-direction .buy-now-button {
  flex-direction: row-reverse;
}

/* ===== PERFORMANCE & ACCESSIBILITY ===== */
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}

@media print {
  .hero-banner, .shop-now-link, .buy-now-button { display: none; }
}
</style>