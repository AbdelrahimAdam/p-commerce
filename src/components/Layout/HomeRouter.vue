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
  name: 'HomeRouter',
  setup() {
    const tenantStore = useTenantStore()
    const isLoading = ref(true)
    const activeComponent = shallowRef<any>(null)

    const isMainDomain = computed(() => {
      const hostname = window.location.hostname
      const rootDomain = import.meta.env.VITE_ROOT_DOMAIN || 'p-commerce-peach.vercel.app'
      return hostname === rootDomain
    })

    onMounted(async () => {
      try {
        await tenantStore.whenReady(5000)
        console.log('✅ Tenant resolved:', tenantStore.tenantId)
      } catch (err) {
        console.warn('Tenant resolution timed out or failed, falling back to store home')
      }

      if (isMainDomain.value) {
        const module = await import('@/pages/LandingPage.vue')
        activeComponent.value = module.default
      } else {
        const module = await import('@/pages/HomePage.vue')
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
