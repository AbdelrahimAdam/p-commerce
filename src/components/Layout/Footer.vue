<template>
  <footer class="luxury-footer" :class="{ 'rtl': isRTL }">
    <!-- Main Footer -->
    <div class="footer-main">
      <div class="footer-container">
        <!-- Footer Grid - Optimized Spacing -->
        <div class="footer-grid">
          <!-- Brand Column - Left -->
          <div class="footer-brand">
            <router-link to="/" class="footer-logo">
              <!-- Luxurious "P" Logo -->
              <div class="footer-p-logo">
                <div class="footer-p-letter">{{ brandLetter }}</div>
              </div>
              <div class="footer-logo-text">
                <h3 class="footer-logo-title">{{ storeName }}</h3>
                <p class="footer-logo-subtitle">{{ storeTagline }}</p>
              </div>
            </router-link>

            <p class="footer-description">
              {{ $t('footerDescription') }}
            </p>

            <!-- Social Links - Updated Icons -->
            <div class="footer-social">
              <a :href="socialLinks.facebook" class="social-link" target="_blank" rel="noopener" aria-label="Facebook" v-if="socialLinks.facebook">
                <svg class="social-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" 
                        stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </a>
              <a :href="socialLinks.instagram" class="social-link" target="_blank" rel="noopener" aria-label="Instagram" v-if="socialLinks.instagram">
                <svg class="social-icon" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" stroke-width="1.5"/>
                  <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.5"/>
                  <circle cx="18" cy="6" r="1" fill="currentColor"/>
                </svg>
              </a>
              <a :href="socialLinks.twitter" class="social-link" target="_blank" rel="noopener" aria-label="X (Twitter)" v-if="socialLinks.twitter">
                <svg class="social-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M17.751 3H20.818L13.918 10.78L22 20H15.828L10.994 14.487L5.464 20H2.394L9.809 11.611L2 3H8.328L12.692 7.958L17.751 3ZM16.675 
18.272H18.368L7.404 4.633H5.58L16.675 18.272Z" 
                        stroke="currentColor" stroke-width="1.5" fill="currentColor"/>
                </svg>
              </a>
              <a :href="socialLinks.whatsapp" class="social-link" target="_blank" rel="noopener" aria-label="WhatsApp" v-if="socialLinks.whatsapp">
                <svg class="social-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M12.031 2C6.482 2 2 6.482 2 12.031c0 2.283.784 4.401 2.099 6.114L2.5 21.5l3.44-1.612A10.014 10.014 0 0012.031 22c5.549 0 
10.031-4.482 10.031-10.031C22.062 6.482 17.58 2 12.031 2z" 
                        stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                  <path d="M16.532 13.95c-.285.797-1.398 1.458-2.28 
1.528-.86.067-1.5-.048-2.64-.668-1.246-.68-2.4-1.748-3.141-2.875-.441-.668-.825-1.489-.905-2.288-.08-.799.285-1.594.84-2.08.192-.168.42-.26.666-.267.243-.007.437.003.612.441.173.437.59 
1.506.642 1.615.052.109.09.234.036.375-.055.141-.082.229-.17.354-.087.125-.185.273-.263.364-.088.105-.18.219-.076.429.105.209.466.77.999 1.247.686.614 
1.264.804 1.442.886.18.082.284.068.39-.041.105-.109.45-.526.571-.706.12-.18.24-.15.405-.09.165.06 1.043.492 1.222.58.18.09.3.135.346.21.045.075.045.434-.24 
1.231z" 
                        stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- Quick Links - Single Column -->
          <div class="footer-links">
            <h4 class="links-title">{{ $t('quickLinks') }}</h4>
            <ul class="links-list">
              <li><router-link to="/" class="footer-link">{{ $t('home') }}</router-link></li>
              <li><router-link to="/shop" class="footer-link">{{ $t('shop') }}</router-link></li>
              <li><router-link to="/brands" class="footer-link">{{ $t('brands') }}</router-link></li>
              <li><router-link to="/about" class="footer-link">{{ $t('about') }}</router-link></li>
              <li><router-link to="/contact" class="footer-link">{{ $t('contact') }}</router-link></li>
            </ul>
          </div>

          <!-- Newsletter - Right -->
          <div class="footer-newsletter">
            <h4 class="newsletter-title">{{ $t('stayUpdated') }}</h4>
            <p class="newsletter-description">
              {{ $t('newsletterDescription') }}
            </p>

            <form @submit.prevent="subscribeNewsletter" class="newsletter-form">
              <div class="newsletter-input-group">
                <input
                  v-model="newsletterEmail"
                  type="email"
                  :placeholder="$t('yourEmail')"
                  class="newsletter-input"
                  required
                  aria-label="Email for newsletter subscription"
                />
                <button type="submit" class="newsletter-button" aria-label="Subscribe">
                  <svg class="newsletter-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" 
                          stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Divider -->
        <div class="footer-divider"></div>

        <!-- Bottom Section - Compact -->
        <div class="footer-bottom">
          <!-- Copyright -->
          <div class="footer-copyright">
            <p class="copyright-text">© {{ currentYear }} {{ storeName }}. {{ $t('allRightsReserved') }}</p>
          </div>

          <!-- Legal Links -->
          <div class="footer-legal">
            <router-link to="/privacy" class="legal-link">{{ $t('privacy') }}</router-link>
            <router-link to="/terms" class="legal-link">{{ $t('terms') }}</router-link>
            <router-link to="/cookies" class="legal-link">{{ $t('cookies') }}</router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Back to Top -->
    <button v-if="showBackToTop" @click="scrollToTop" class="back-to-top" :class="{ 'show': showBackToTop }" aria-label="Back to top">
      <svg class="back-to-top-icon" viewBox="0 0 24 24" fill="none">
        <path d="M12 19V5M5 12L12 5L19 12" 
              stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </footer>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useLanguageStore } from '@/stores/language'
import { useTenantStore } from '@/stores/tenant'
import { showNotification } from '@/utils/notifications'

const languageStore = useLanguageStore()
const tenantStore = useTenantStore()
const { t: $t, currentLanguage } = languageStore

// State
const newsletterEmail = ref('')
const showBackToTop = ref(false)

// Computed
const currentYear = computed(() => new Date().getFullYear())
const isRTL = computed(() => currentLanguage === 'ar')

// Tenant-aware branding
const storeName = computed(() => {
  if (tenantStore.tenantId === 'main') {
    return 'P.COMMERCE'
  }
  return 'P.COMMERCE'
})

const storeTagline = computed(() => {
  if (tenantStore.tenantId === 'main') {
    return 'LUXURY PERFUME STORE'
  }
  return 'PERFUME STORE'
})

const brandLetter = computed(() => {
  return storeName.value.charAt(0).toUpperCase()
})

// Social links (can be made tenant-aware in the future)
const socialLinks = computed(() => ({
  facebook: import.meta.env.VITE_FACEBOOK_URL || 'https://facebook.com',
  instagram: import.meta.env.VITE_INSTAGRAM_URL || 'https://instagram.com',
  twitter: import.meta.env.VITE_TWITTER_URL || 'https://x.com',
  whatsapp: import.meta.env.VITE_WHATSAPP_URL || 'https://wa.me/1234567890'
}))

// Methods
const subscribeNewsletter = async () => {
  if (!newsletterEmail.value) return
  
  try {
    // Here you would integrate with your Supabase newsletter subscription endpoint
    // For now, simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    showNotification({
      type: 'success',
      title: $t('newsletterSuccess'),
      message: $t('newsletterSuccessMessage'),
      duration: 5000
    })
    
    newsletterEmail.value = ''
  } catch (error) {
    showNotification({
      type: 'error',
      title: $t('newsletterError'),
      message: $t('newsletterErrorMessage'),
      duration: 5000
    })
  }
}

const handleScroll = () => {
  showBackToTop.value = window.scrollY > 300
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* ===== MOBILE-FIRST FOOTER - OPTIMIZED SPACING ===== */
.luxury-footer {
  background: linear-gradient(180deg, #0a0a0a 0%, #1a120b 100%);
  border-top: 1px solid rgba(212, 175, 55, 0.1);
  margin-top: auto;
  width: 100%;
  direction: ltr;
}

.luxury-footer.rtl {
  direction: rtl;
}

.footer-main {
  padding: 2rem 1rem;
}

@media (min-width: 768px) {
  .footer-main {
    padding: 2.5rem 1.5rem;
  }
}

@media (min-width: 1024px) {
  .footer-main {
    padding: 3rem 2rem;
  }
}

.footer-container {
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
}

/* ===== FOOTER GRID - CLEAN 3-COLUMN LAYOUT ===== */
.footer-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 2rem;
}

@media (min-width: 768px) {
  .footer-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 2rem;
    align-items: start;
  }
}

@media (min-width: 1024px) {
  .footer-grid {
    gap: 3rem;
  }
}

/* ===== BRAND COLUMN ===== */
.footer-brand {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  margin-bottom: 1.25rem;
}

.footer-p-logo {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.2);
  animation: logo-glow 3s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes logo-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(212, 175, 55, 0.3); }
  50% { box-shadow: 0 0 30px rgba(212, 175, 55, 0.5); }
}

@media (min-width: 768px) {
  .footer-p-logo {
    width: 52px;
    height: 52px;
  }
}

.footer-p-letter {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.75rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1;
}

@media (min-width: 768px) {
  .footer-p-letter {
    font-size: 2rem;
  }
}

.footer-logo-text {
  display: flex;
  flex-direction: column;
}

.footer-logo-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #d4af37;
  margin: 0 0 0.15rem 0;
  line-height: 1;
  letter-spacing: 0.5px;
}

.luxury-footer.rtl .footer-logo-title {
  text-align: right;
}

@media (min-width: 768px) {
  .footer-logo-title {
    font-size: 1.6rem;
  }
}

.footer-logo-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 0.65rem;
  color: #999999;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin: 0;
  line-height: 1;
  font-weight: 400;
}

.luxury-footer.rtl .footer-logo-subtitle {
  text-align: right;
}

.footer-description {
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  line-height: 1.5;
  color: #f4e7c1;
  opacity: 0.8;
  margin-bottom: 1.25rem;
  max-width: 280px;
}

@media (min-width: 768px) {
  .footer-description {
    font-size: 0.9rem;
    max-width: 260px;
  }
}

/* ===== SOCIAL LINKS - UPDATED ===== */
.footer-social {
  display: flex;
  gap: 0.5rem;
}

.social-link {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(212, 175, 55, 0.08);
  border: 1px solid rgba(212, 175, 55, 0.15);
  color: #f4e7c1;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.social-link:hover {
  background: rgba(212, 175, 55, 0.15);
  border-color: #d4af37;
  color: #d4af37;
  transform: translateY(-2px);
}

.social-icon {
  width: 18px;
  height: 18px;
  stroke: currentColor;
}

/* ===== QUICK LINKS - SINGLE COLUMN ===== */
.footer-links {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

@media (min-width: 768px) {
  .footer-links {
    align-items: center;
  }
}

.links-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: #d4af37;
  margin: 0 0 1rem 0;
  letter-spacing: 0.5px;
}

@media (min-width: 768px) {
  .links-title {
    font-size: 1.2rem;
    margin-bottom: 1.25rem;
  }
}

.links-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.links-list li {
  margin-bottom: 0.5rem;
}

@media (min-width: 768px) {
  .links-list li {
    margin-bottom: 0.6rem;
  }
}

.footer-link {
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  color: #f4e7c1;
  opacity: 0.8;
  text-decoration: none;
  transition: all 0.2s ease;
  display: inline-block;
  line-height: 1.4;
}

.footer-link:hover {
  color: #d4af37;
  opacity: 1;
  transform: translateX(3px);
}

.luxury-footer.rtl .footer-link:hover {
  transform: translateX(-3px);
}

/* ===== NEWSLETTER ===== */
.footer-newsletter {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

@media (min-width: 768px) {
  .footer-newsletter {
    align-items: flex-end;
  }
}

.newsletter-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: #d4af37;
  margin: 0 0 0.75rem 0;
  letter-spacing: 0.5px;
}

@media (min-width: 768px) {
  .newsletter-title {
    font-size: 1.2rem;
    margin-bottom: 1rem;
    text-align: right;
  }
  .luxury-footer.rtl .newsletter-title {
    text-align: left;
  }
}

.newsletter-description {
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  line-height: 1.5;
  color: #f4e7c1;
  opacity: 0.8;
  margin-bottom: 1rem;
  max-width: 280px;
}

@media (min-width: 768px) {
  .newsletter-description {
    font-size: 0.9rem;
    text-align: right;
    max-width: 260px;
  }
  .luxury-footer.rtl .newsletter-description {
    text-align: left;
  }
}

.newsletter-input-group {
  position: relative;
  width: 100%;
  max-width: 280px;
}

.newsletter-input {
  width: 100%;
  padding: 0.7rem 2.8rem 0.7rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(212, 175, 55, 0.2);
  color: #f4e7c1;
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.luxury-footer.rtl .newsletter-input {
  padding: 0.7rem 1rem 0.7rem 2.8rem;
}

.newsletter-input:focus {
  outline: none;
  border-color: #d4af37;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.1);
}

.newsletter-button {
  position: absolute;
  right: 0.3rem;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.2);
  color: #f4e7c1;
  cursor: pointer;
  transition: all 0.2s ease;
}

.luxury-footer.rtl .newsletter-button {
  right: auto;
  left: 0.3rem;
}

.newsletter-button:hover {
  background: rgba(212, 175, 55, 0.2);
  border-color: #d4af37;
  color: #d4af37;
}

.newsletter-icon {
  width: 16px;
  height: 16px;
  stroke: currentColor;
}

/* ===== DIVIDER ===== */
.footer-divider {
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(212, 175, 55, 0.2) 50%, 
    transparent 100%);
  margin: 1.5rem 0;
}

@media (min-width: 768px) {
  .footer-divider {
    margin: 2rem 0;
  }
}

/* ===== BOTTOM SECTION - COMPACT ===== */
.footer-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

@media (min-width: 768px) {
  .footer-bottom {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.footer-copyright {
  order: 2;
}

@media (min-width: 768px) {
  .footer-copyright {
    order: 1;
  }
}

.copyright-text {
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  color: #f4e7c1;
  opacity: 0.7;
  margin: 0;
}

.footer-legal {
  order: 1;
  display: flex;
  gap: 1.25rem;
}

@media (min-width: 768px) {
  .footer-legal {
    order: 2;
    gap: 1.5rem;
  }
}

.legal-link {
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  color: #f4e7c1;
  opacity: 0.7;
  text-decoration: none;
  transition: color 0.2s ease;
}

.legal-link:hover {
  color: #d4af37;
  opacity: 1;
}

/* ===== BACK TO TOP ===== */
.back-to-top {
  position: fixed;
  bottom: 1.25rem;
  right: 1.25rem;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(212, 175, 55, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(212, 175, 55, 0.2);
  color: #f4e7c1;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 999;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
}

.luxury-footer.rtl .back-to-top {
  right: auto;
  left: 1.25rem;
}

.back-to-top:hover {
  background: rgba(212, 175, 55, 0.2);
  border-color: #d4af37;
  color: #d4af37;
}

.back-to-top.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.back-to-top-icon {
  width: 20px;
  height: 20px;
  stroke: currentColor;
}

@media (min-width: 768px) {
  .back-to-top {
    bottom: 1.5rem;
    right: 1.5rem;
    width: 48px;
    height: 48px;
  }
  .luxury-footer.rtl .back-to-top {
    left: 1.5rem;
    right: auto;
  }
}
</style>

<script lang="ts">
export const Footer = {}
</script>
