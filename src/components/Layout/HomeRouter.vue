<!-- src/components/Layout/HomeRouter.vue -->
<template>
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center">
    <div class="luxury-loading-spinner"></div>
  </div>
  <component v-else :is="activeComponent" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, shallowRef, type Component } from 'vue'
import { useTenantStore } from '@/stores/tenant'

const tenantStore = useTenantStore()
const isLoading = ref(true)
const activeComponent = shallowRef<Component | null>(null)

// Determine if current tenant is the main domain (not a subdomain)
const isMainDomain = computed(() => {
  const hostname = window.location.hostname
  const rootDomain = import.meta.env.VITE_ROOT_DOMAIN || 'p-commerce-peach.vercel.app'
  
  // Check if current hostname equals the root domain (no subdomain)
  return hostname === rootDomain
})

onMounted(async () => {
  // Wait for tenant resolution with a 5-second timeout
  try {
    await tenantStore.whenReady(5000)
    console.log('✅ Tenant resolved:', tenantStore.tenantId)
  } catch (err) {
    console.warn('Tenant resolution timed out or failed, falling back to store home')
  }
  
  // Dynamically load the appropriate component based on domain
  if (isMainDomain.value) {
    // Load LandingPage dynamically
    const module = await import('@/pages/LandingPage.vue')
    activeComponent.value = module.default
  } else {
    // Load HomePage dynamically
    const module = await import('@/pages/HomePage.vue')
    activeComponent.value = module.default
  }
  
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
