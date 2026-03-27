<template>
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center">
    <div class="luxury-loading-spinner"></div>
  </div>
  <component v-else :is="activeComponent" />
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, shallowRef } from 'vue'
import { useTenantStore } from '@/stores/tenant'

export default defineComponent({
  name: 'RootRouter',
  setup() {
    const tenantStore = useTenantStore()
    const isLoading = ref(true)
    const activeComponent = shallowRef<any>(null)

    const isMainDomain = computed(() => {
      const hostname = window.location.hostname
      const rootDomain = import.meta.env.VITE_ROOT_DOMAIN || 'p-commerce-peach.vercel.app'
      return hostname === rootDomain || hostname === 'localhost'
    })

    const isTenantPath = computed(() => {
      const pathname = window.location.pathname
      return pathname.startsWith('/store/')
    })

    onMounted(async () => {
      try {
        // Check if we're on a tenant path (path-based routing)
        if (isTenantPath.value) {
          console.log('📁 Tenant path detected - resolving tenant from path...')
          await tenantStore.resolveTenantFromDomain()
          console.log('✅ Tenant resolved from path:', tenantStore.tenantId)
        }
        // Check if we're on a subdomain
        else if (!isMainDomain.value) {
          console.log('🌍 Subdomain detected - resolving tenant from domain...')
          await tenantStore.resolveTenantFromDomain()
          console.log('✅ Tenant resolved from domain:', tenantStore.tenantId)
        } 
        // Main domain - no tenant needed
        else {
          console.log('🏠 Main domain detected - no tenant resolution needed')
          tenantStore.setIsInitialized(true)
        }
      } catch (err) {
        console.warn('Tenant resolution failed:', err)
        // For main domain, we can still proceed
        if (isMainDomain.value) {
          tenantStore.setIsInitialized(true)
        }
      }

      // Determine which component to load
      // Always load HomePage for tenant paths and subdomains
      if (isTenantPath.value || !isMainDomain.value) {
        console.log('🏪 Loading HomePage for tenant store')
        const module = await import('@/pages/HomePage.vue')
        activeComponent.value = module.default
      } else {
        console.log('📄 Loading LandingPage for main domain')
        const module = await import('@/pages/LandingPage.vue')
        activeComponent.value = module.default
      }

      isLoading.value = false
    })

    return {
      isLoading,
      activeComponent
    }
  }
})

// Named export for any code that still expects it
export const HomeRouter = {}
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