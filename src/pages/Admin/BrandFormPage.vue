<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-2xl font-display-en font-bold text-gray-900">
              {{ editing ? t('Edit Brand') : t('Add New Brand') }}
            </h1>
            <p class="text-gray-600 mt-1">
              {{ t('Fill in the brand details below') }}
            </p>
          </div>
          <router-link
            to="/admin/brands"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {{ t('Back to Brands') }}
          </router-link>
        </div>
        
        <!-- Progress Steps -->
        <div class="flex items-center justify-center mb-8">
          <div class="flex items-center space-x-4">
            <div :class="[
              'flex items-center justify-center w-8 h-8 rounded-full',
              step >= 1 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-400'
            ]">
              1
            </div>
            <div :class="[
              'h-1 w-12',
              step >= 2 ? 'bg-primary-500' : 'bg-gray-200'
            ]"></div>
            <div :class="[
              'flex items-center justify-center w-8 h-8 rounded-full',
              step >= 2 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-400'
            ]">
              2
            </div>
          </div>
        </div>
      </div>

      <!-- Form -->
      <div class="bg-white rounded-xl shadow-luxury overflow-hidden">
        <!-- Step 1: Basic Information -->
        <div v-if="step === 1" class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">
            {{ t('Basic Information') }}
          </h3>
          
          <div class="space-y-6">
            <!-- Brand Image -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">
                {{ t('Brand Logo') }} *
                <span class="text-xs text-gray-500 ml-2">
                  {{ t('Recommended: 400x400px, Max 2MB') }}
                </span>
              </label>
              <div class="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <!-- Image upload area -->
                <div 
                  @click="triggerImageInput"
                  class="w-40 h-40 flex-shrink-0 border-2 border-dashed border-gray-300 rounded-lg 
                         flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 
                         transition-colors bg-gray-50"
                >
                  <div v-if="imagePreview" class="relative w-full h-full">
                    <img 
                      :src="imagePreview" 
                      :alt="t('Brand logo preview')" 
                      class="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      @click.stop="removeImage"
                      class="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white 
                             rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div v-else class="text-center p-4">
                    <svg class="w-10 h-10 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <p class="mt-2 text-sm text-gray-600">{{ t('Upload Logo') }}</p>
                    <p class="mt-1 text-xs text-gray-500">
                      {{ t('Click to upload') }}
                    </p>
                  </div>
                  <input
                    ref="imageInput"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleImageUpload"
                  />
                </div>
                
                <!-- Image tips -->
                <div class="flex-1">
                  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 class="text-sm font-medium text-blue-800 mb-2">
                      {{ t('Logo Requirements') }}
                    </h4>
                    <ul class="text-xs text-blue-700 space-y-1">
                      <li class="flex items-start gap-2">
                        <svg class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{{ t('Square format works best') }}</span>
                      </li>
                      <li class="flex items-start gap-2">
                        <svg class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{{ t('Transparent background recommended') }}</span>
                      </li>
                      <li class="flex items-start gap-2">
                        <svg class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{{ t('High resolution logo') }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <p v-if="errors.image" class="mt-2 text-sm text-red-600">{{ errors.image }}</p>
            </div>

            <!-- Brand Name & Slug -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('Brand Name') }} *
                </label>
                <input
                  v-model="formData.name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  :class="{ 'border-red-300': errors.name }"
                  :placeholder="t('e.g., Tom Ford')"
                />
                <p v-if="errors.name" class="mt-1 text-sm text-red-600">
                  {{ errors.name }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('Slug') }} *
                  <span class="text-xs text-gray-500 ml-2">
                    {{ t('URL-friendly identifier') }}
                  </span>
                </label>
                <div class="flex items-center">
                  <span class="bg-gray-100 border border-r-0 border-gray-300 rounded-l-md px-3 py-2 text-sm text-gray-500">
                    /brand/
                  </span>
                  <input
                    v-model="formData.slug"
                    type="text"
                    required
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-r-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    :class="{ 'border-red-300': errors.slug }"
                    :placeholder="t('tom-ford')"
                  />
                </div>
                <p v-if="errors.slug" class="mt-1 text-sm text-red-600">
                  {{ errors.slug }}
                </p>
              </div>
            </div>

            <!-- Signature & Category -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('Signature Scent') }}
                </label>
                <input
                  v-model="formData.signature"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  :placeholder="t('e.g., Noir Extreme')"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('Category') }} *
                </label>
                <select
                  v-model="formData.category"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  :class="{ 'border-red-300': errors.category }"
                >
                  <option value="">{{ t('Select category') }}</option>
                  <option value="luxury">{{ t('Luxury') }}</option>
                  <option value="designer">{{ t('Designer') }}</option>
                  <option value="niche">{{ t('Niche') }}</option>
                  <option value="celebrity">{{ t('Celebrity') }}</option>
                  <option value="independent">{{ t('Independent') }}</option>
                  <option value="arabic">{{ t('Arabic') }}</option>
                  <option value="french">{{ t('French') }}</option>
                </select>
                <p v-if="errors.category" class="mt-1 text-sm text-red-600">
                  {{ errors.category }}
                </p>
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('Description') }}
              </label>
              <textarea
                v-model="formData.description"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                :placeholder="t('Tell customers about this brand...')"
              />
            </div>

            <!-- Price Range & Status -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('Average Price') }} ($)
                </label>
                <input
                  v-model.number="formData.price"
                  type="number"
                  min="0"
                  step="0.01"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  :placeholder="t('0.00')"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('Status') }}
                </label>
                <div class="flex items-center gap-4">
                  <label class="inline-flex items-center">
                    <input
                      v-model="formData.isActive"
                      type="radio"
                      :value="true"
                      class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <span class="ml-2 text-sm text-gray-700">{{ t('Active') }}</span>
                  </label>
                  <label class="inline-flex items-center">
                    <input
                      v-model="formData.isActive"
                      type="radio"
                      :value="false"
                      class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <span class="ml-2 text-sm text-gray-700">{{ t('Inactive') }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="flex justify-between pt-6 mt-6 border-t border-gray-200">
            <router-link
              to="/admin/brands"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              {{ t('Cancel') }}
            </router-link>
            <button
              @click="nextStep"
              class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              {{ t('Continue to Products') }}
            </button>
          </div>
        </div>

        <!-- Step 2: Products Selection -->
        <div v-else class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">
            {{ t('Assign Products') }}
            <span class="text-sm font-normal text-gray-500 ml-2">
              {{ t('(Optional - you can add products later)') }}
            </span>
          </h3>
          
          <div class="mb-6">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h4 class="font-medium text-gray-900">{{ t('Available Products') }}</h4>
                <p class="text-sm text-gray-500">{{ t('Select products to assign to this brand') }}</p>
              </div>
              <button
                @click="showAllProducts = !showAllProducts"
                class="text-sm text-primary-600 hover:text-primary-700"
              >
                {{ showAllProducts ? t('Show Less') : t('Show All') }}
              </button>
            </div>
            
            <!-- Products Grid -->
            <div v-if="availableProducts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2">
              <div
                v-for="product in shownProducts"
                :key="product.id"
                @click="toggleProductSelection(product)"
                :class="[
                  'p-3 border rounded-lg cursor-pointer transition-all',
                  selectedProducts.some(p => p.id === product.id)
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                ]"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 flex-shrink-0">
                    <img 
                      :src="product.imageUrl || '/images/placeholder-product.jpg'" 
                      :alt="product.name?.en"
                      class="w-10 h-10 rounded object-cover"
                    />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h5 class="text-sm font-medium text-gray-900 truncate">
                      {{ product.name?.en || t('Unnamed Product') }}
                    </h5>
                    <p class="text-xs text-gray-500">
                      ${{ product.price?.toFixed(2) || '0.00' }}
                    </p>
                  </div>
                  <div v-if="selectedProducts.some(p => p.id === product.id)" class="text-primary-600">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else class="text-center py-8 text-gray-500">
              {{ t('No products available') }}
            </div>
          </div>

          <!-- Selected Products -->
          <div v-if="selectedProducts.length > 0" class="mb-6">
            <h4 class="font-medium text-gray-900 mb-3">
              {{ t('Selected Products') }} ({{ selectedProducts.length }})
            </h4>
            <div class="space-y-2">
              <div
                v-for="product in selectedProducts"
                :key="product.id"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 flex-shrink-0">
                    <img 
                      :src="product.imageUrl || '/images/placeholder-product.jpg'" 
                      :alt="product.name?.en"
                      class="w-8 h-8 rounded object-cover"
                    />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ product.name?.en || t('Unnamed Product') }}</p>
                    <p class="text-xs text-gray-500">${{ product.price?.toFixed(2) || '0.00' }}</p>
                  </div>
                </div>
                <button
                  @click="removeProduct(product)"
                  class="text-red-600 hover:text-red-800 p-1"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex justify-between pt-6 mt-6 border-t border-gray-200">
            <button
              @click="step = 1"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              {{ t('Back') }}
            </button>
            <div class="flex items-center gap-3">
              <button
                @click="saveWithoutProducts"
                class="px-4 py-2 border border-primary-500 text-primary-500 rounded-lg hover:bg-primary-50"
                :disabled="saving"
              >
                {{ t('Save Without Products') }}
              </button>
              <!-- Fixed: wrap saveBrand in an arrow function to avoid event argument -->
              <button
                @click="() => saveBrand()"
                :disabled="saving"
                class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="saving" class="flex items-center gap-2">
                  <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ t('Saving...') }}
                </span>
                <span v-else>{{ editing ? t('Update Brand') : t('Save Brand') }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLanguageStore } from '@/stores/language'
import { useBrandsStore } from '@/stores/brands'
import { useProductsStore } from '@/stores/products'
// Removed unused Brand type import
import type { Product } from '@/types'

const route = useRoute()
const router = useRouter()
const languageStore = useLanguageStore()
const brandsStore = useBrandsStore()
const productsStore = useProductsStore()

const { t } = languageStore

// State
const step = ref(1)
const saving = ref(false)
const showAllProducts = ref(false)
const imageInput = ref<HTMLInputElement | null>(null)
const imagePreview = ref('')
const editing = computed(() => route.name === 'admin-brand-edit')

// Form Data
const formData = reactive({
  name: '',
  slug: '',
  signature: '',
  category: '',
  description: '',
  image: '',
  imageFile: undefined as File | undefined,
  price: 0,
  isActive: true
})

const errors = reactive<Record<string, string>>({})
const selectedProducts = ref<Product[]>([])
const availableProducts = ref<Product[]>([])

// Computed
const shownProducts = computed(() => {
  if (showAllProducts.value) return availableProducts.value
  return availableProducts.value.slice(0, 9)
})

// Initialize form
const initializeForm = async () => {
  if (editing.value && route.params.id) {
    await loadBrandData(route.params.id as string)
  }
  
  // Load available products
  await loadAvailableProducts()
}

const loadBrandData = async (brandId: string) => {
  try {
    // Load brand data
    const brand = brandsStore.brands.find(b => b.id === brandId)
    if (brand) {
      Object.assign(formData, {
        name: brand.name,
        slug: brand.slug,
        signature: brand.signature || '',
        category: brand.category || '',
        description: brand.description || '',
        image: brand.image || '',
        price: brand.price || 0,
        isActive: brand.isActive !== false
      })
      
      if (brand.image) {
        imagePreview.value = brand.image
      }
      
      // Load selected products
      if (brand.productIds?.length) {
        // You might want to load actual product data here
        // For now, we'll just mark them as selected
        selectedProducts.value = []
      }
    }
  } catch (err) {
    console.error('Error loading brand data:', err)
  }
}

const loadAvailableProducts = async () => {
  try {
    await productsStore.fetchProducts()
    availableProducts.value = productsStore.products
  } catch (err) {
    console.error('Error loading products:', err)
  }
}

// Image handling
const triggerImageInput = () => {
  imageInput.value?.click()
}

const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  
  if (!file) return
  
  // Validate image
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  const maxSize = 2 * 1024 * 1024 // 2MB
  
  if (!validTypes.includes(file.type)) {
    alert(t('Please upload a JPEG, PNG, or WebP image'))
    return
  }
  
  if (file.size > maxSize) {
    alert(t('Image size must be less than 2MB'))
    return
  }
  
  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string
    formData.imageFile = file
  }
  reader.readAsDataURL(file)
}

const removeImage = () => {
  imagePreview.value = ''
  formData.image = ''
  formData.imageFile = undefined
  if (imageInput.value) {
    imageInput.value.value = ''
  }
}

// Product selection
const toggleProductSelection = (product: Product) => {
  const index = selectedProducts.value.findIndex(p => p.id === product.id)
  if (index === -1) {
    selectedProducts.value.push(product)
  } else {
    selectedProducts.value.splice(index, 1)
  }
}

const removeProduct = (product: Product) => {
  const index = selectedProducts.value.findIndex(p => p.id === product.id)
  if (index !== -1) {
    selectedProducts.value.splice(index, 1)
  }
}

// Validation
const validateStep1 = (): boolean => {
  let isValid = true
  
  // Reset errors
  Object.keys(errors).forEach(key => delete errors[key])
  
  if (!formData.name.trim()) {
    errors.name = t('Brand name is required')
    isValid = false
  }
  
  if (!formData.slug.trim()) {
    errors.slug = t('Slug is required')
    isValid = false
  } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
    errors.slug = t('Slug can only contain lowercase letters, numbers, and hyphens')
    isValid = false
  }
  
  if (!formData.category) {
    errors.category = t('Category is required')
    isValid = false
  }
  
  if (!imagePreview.value && !formData.image) {
    errors.image = t('Brand logo is required')
    isValid = false
  }
  
  return isValid
}

// Navigation
const nextStep = () => {
  if (validateStep1()) {
    step.value = 2
  }
}

// Save operations
const saveWithoutProducts = async () => {
  await saveBrand(false)
}

const saveBrand = async (withProducts = true) => {
  saving.value = true
  
  try {
    // Prepare brand data
    const brandData = {
      name: formData.name,
      slug: formData.slug,
      signature: formData.signature,
      category: formData.category,
      description: formData.description,
      image: formData.image,
      price: formData.price,
      isActive: formData.isActive
    }
    
    if (editing.value && route.params.id) {
      // Update existing brand
      await brandsStore.updateBrand(route.params.id as string, brandData)
      router.push('/admin/brands')
    } else {
      // Create new brand
      const productsData = withProducts ? selectedProducts.value.map(p => ({
        ...p,
        brand: formData.slug
      })) : []
      
      const brandId = await brandsStore.addBrandWithProducts(brandData, productsData)
      if (brandId) {
        router.push('/admin/brands')
      }
    }
  } catch (err) {
    console.error('Error saving brand:', err)
    alert(t('Failed to save brand. Please try again.'))
  } finally {
    saving.value = false
  }
}

// Initialize
onMounted(() => {
  initializeForm()
})
</script>

<style scoped>
.shadow-luxury {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.transition-colors {
  transition: all 0.2s ease-in-out;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>