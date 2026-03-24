<!-- src/components/Layout/HomeRouter.vue -->
<template>
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center">
    <div class="luxury-loading-spinner"></div>
  </div>
  <component :is="activeComponent" v-else />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTenantStore } from '@/stores/tenant'
import LandingPage from '@/pages/LandingPage.vue'
import HomePage from '@/pages/HomePage.vue'

const tenantStore = useTenantStore()
const isLoading = ref(true)

// Determine if current tenant is the main domain (not a subdomain)
// The main domain is the one that matches the root domain (no subdomain prefix)
const isMainDomain = computed(() => {
  const hostname = window.location.hostname
  const rootDomain = import.meta.env.VITE_ROOT_DOMAIN || 'p-commerce-peach.vercel.app'
  
  // Check if current hostname equals the root domain (no subdomain)
  // Examples:
  // - p-commerce-peach.vercel.app -> main domain (no subdomain)
  // - mycompany.p-commerce-peach.vercel.app -> subdomain (tenant store)
  return hostname === rootDomain
})

// Decide which component to render once tenant is known
const activeComponent = computed(() => {
  // If this is the main domain, show the marketing landing page
  if (isMainDomain.value) {
    return LandingPage
  }
  // Otherwise (subdomain) show the store home page
  return HomePage
})

onMounted(async () => {
  // Wait for tenant resolution with a 5-second timeout
  try {
    await tenantStore.whenReady(5000)
    console.log('✅ Tenant resolved:', tenantStore.tenantId)
  } catch (err) {
    console.warn('Tenant resolution timed out or failed, falling back to store home')
  }
  // Hide the spinner
  isLoading.value = false
})
</script>

<style scoped>
.luxury-loading-spinner {
  width: 40px;
  height: 40px;
  border: 2px solid rgba(212, 175, 55, 0.2);
  border-top: 2px solid #d4af37;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
