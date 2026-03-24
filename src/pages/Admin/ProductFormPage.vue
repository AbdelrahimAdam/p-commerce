<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Remove AdminSidebar - it's already provided by the admin layout -->
    
    <div class="lg:ml-64">
      <!-- Header -->
      <div class="bg-white border-b border-gray-200">
        <div class="px-8 py-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-display-en font-bold text-gray-900">
                {{ isEditing ? t('Edit Product') : t('Add New Product') }}
              </h1>
              <p class="text-gray-600 mt-1">
                {{ isEditing ? t('Update product details') : t('Create a new product') }}
              </p>
            </div>
            <div class="flex items-center gap-4">
              <router-link
                to="/admin/products"
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg 
                       hover:bg-gray-50 transition-colors"
              >
                {{ t('Back to Products') }}
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Form -->
      <div class="p-8">
        <ProductForm 
          :product="product || undefined"
          @saved="handleProductSaved"
          @close="handleFormClose"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLanguageStore } from '@/stores/language'
import { useProductsStore } from '@/stores/products'
import ProductForm from '@/components/Admin/ProductForm.vue'
import type { Product } from '@/types'

const route = useRoute()
const router = useRouter()
const languageStore = useLanguageStore()
const productsStore = useProductsStore()

const { t } = languageStore

const product = ref<Product | null>(null)
const loading = ref(true)

const isEditing = computed(() => !!route.params.id)

// Fetch product data if editing
onMounted(async () => {
  if (isEditing.value) {
    loading.value = true
    const productId = route.params.id as string
    try {
      const fetchedProduct = await productsStore.fetchProductBySlug(productId)
      product.value = fetchedProduct
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      loading.value = false
    }
  }
})

const handleProductSaved = () => {
  router.push('/admin/products')
}

const handleFormClose = () => {
  router.push('/admin/products')
}

// Mark handlers as used (they are called in template)
void handleProductSaved;
void handleFormClose;
</script>
