<template>
  <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <!-- Background overlay -->
    <div class="fixed inset-0 bg-black bg-opacity-75 transition-opacity" @click="close"></div>

    <div class="flex min-h-screen items-end justify-center p-4 text-center sm:items-center sm:p-0">
      <!-- Modal panel -->
      <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg w-full max-w-md mx-auto">
        <!-- Modal header -->
        <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 class="text-lg font-semibold leading-6 text-gray-900" id="modal-title">
                {{ editing ? t('Edit Offer') : t('Add New Offer') }}
              </h3>
              <p class="mt-1 text-sm text-gray-500">
                {{ t('Create special promotions and discounts') }}
              </p>
            </div>
            <button
              type="button"
              class="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
              @click="close"
            >
              <span class="sr-only">{{ t('Close') }}</span>
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Modal content -->
        <div class="px-4 pb-3 sm:px-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div class="space-y-4">
            <!-- Offer Title -->
            <div>
              <label for="offer-title" class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('Offer Title') }} *
              </label>
              <input
                id="offer-title"
                v-model="formData.title"
                type="text"
                :placeholder="t('e.g., Summer Sale')"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                :class="{ 'border-red-300': errors.title }"
                required
              />
              <p v-if="errors.title" class="mt-1 text-sm text-red-600">{{ errors.title }}</p>
            </div>

            <!-- Slug (for URL) -->
            <div>
              <label for="offer-slug" class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('Slug') }} *
              </label>
              <input
                id="offer-slug"
                v-model="formData.slug"
                type="text"
                :placeholder="t('e.g., summer-sale-2025')"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                :class="{ 'border-red-300': errors.slug }"
                required
              />
              <p v-if="errors.slug" class="mt-1 text-sm text-red-600">{{ errors.slug }}</p>
              <p class="mt-1 text-xs text-gray-500">{{ t('Used in the URL: /offer/[slug]') }}</p>
            </div>

            <!-- Image Upload Section (URL + File Upload) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('Offer Image') }} *
              </label>

              <!-- URL Input -->
              <div class="mb-3">
                <label class="block text-xs text-gray-600 mb-1">{{ t('Image URL (optional)') }}</label>
                <div class="flex flex-col sm:flex-row gap-2">
                  <input
                    v-model="formData.imageUrl"
                    type="text"
                    placeholder="https://example.com/offer.jpg"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    :class="{ 'border-red-300': errors.imageUrl }"
                  />
                  <button
                    type="button"
                    @click="previewImage(formData.imageUrl)"
                    class="inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 whitespace-nowrap"
                  >
                    {{ t('Preview') }}
                  </button>
                </div>
              </div>

              <!-- File Upload -->
              <div class="mb-3">
                <label class="block text-xs text-gray-600 mb-1">{{ t('Or Upload Image') }}</label>
                <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <input
                    ref="offerImageInput"
                    type="file"
                    accept="image/*"
                    @change="handleImageUpload"
                    class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                  />
                  <button
                    v-if="imageFile || formData.imageUrl"
                    @click="removeImage"
                    type="button"
                    class="inline-flex items-center justify-center px-3 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 text-sm whitespace-nowrap"
                  >
                    {{ t('Remove') }}
                  </button>
                </div>
                <p class="mt-1 text-xs text-gray-500">
                  {{ t('Images will be stored in Firebase Storage (no size limit). JPG, PNG, GIF recommended.') }}
                </p>
              </div>

              <p v-if="errors.imageUrl" class="mt-1 text-sm text-red-600">{{ errors.imageUrl }}</p>

              <!-- Image Preview -->
              <div v-if="imagePreview" class="mt-3">
                <p class="text-sm text-gray-600 mb-1">{{ t('Image Preview') }}:</p>
                <div class="relative h-40 w-full border border-gray-300 rounded-md overflow-hidden">
                  <img
                    :src="imagePreview"
                    :alt="t('Offer Image Preview')"
                    class="h-full w-full object-cover"
                    @error="handleImageError"
                  />
                  <button
                    @click="clearImagePreview"
                    class="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    :title="t('Clear')"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>

            <!-- Link URL (optional) -->
            <div>
              <label for="offer-link" class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('Link URL') }} ({{ t('optional') }})
              </label>
              <input
                id="offer-link"
                v-model="formData.linkUrl"
                type="text"
                :placeholder="t('e.g., /product/chanel-5 or https://example.com')"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
              <p class="mt-1 text-xs text-gray-500">
                {{ t('Where users go when they click Buy Now. Leave empty to use offer detail page.') }}
              </p>
            </div>

            <!-- Subtitle -->
            <div>
              <label for="offer-subtitle" class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('Subtitle') }}
              </label>
              <input
                id="offer-subtitle"
                v-model="formData.subtitle"
                type="text"
                :placeholder="t('e.g., Up to 50% off on selected items')"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <!-- Prices -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="offer-old-price" class="block text-sm font-medium text-gray-700 mb-1">
                  {{ t('Old Price') }} ({{ t('currencyLE') }}) *
                </label>
                <div class="relative rounded-md shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="text-gray-500 sm:text-sm">EGP</span>
                  </div>
                  <input
                    id="offer-old-price"
                    v-model.number="formData.oldPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    :placeholder="t('1500')"
                    class="w-full pl-14 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    :class="{ 'border-red-300': errors.oldPrice }"
                    required
                  />
                </div>
                <p v-if="errors.oldPrice" class="mt-1 text-sm text-red-600">{{ errors.oldPrice }}</p>
              </div>

              <div>
                <label for="offer-new-price" class="block text-sm font-medium text-gray-700 mb-1">
                  {{ t('New Price') }} ({{ t('currencyLE') }}) *
                </label>
                <div class="relative rounded-md shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="text-gray-500 sm:text-sm">EGP</span>
                  </div>
                  <input
                    id="offer-new-price"
                    v-model.number="formData.newPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    :placeholder="t('150')"
                    class="w-full pl-14 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    :class="{ 'border-red-300': errors.newPrice }"
                    required
                  />
                </div>
                <p v-if="errors.newPrice" class="mt-1 text-sm text-red-600">{{ errors.newPrice }}</p>
              </div>
            </div>

            <!-- Discount Percentage -->
            <div v-if="formData.oldPrice && formData.newPrice && formData.oldPrice > 0">
              <div class="bg-emerald-50 border border-emerald-200 rounded-md p-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-emerald-800">
                    {{ t('Discount') }}
                  </span>
                  <span class="text-lg font-bold text-emerald-600">
                    {{ calculateDiscount }}%
                  </span>
                </div>
                <div class="mt-1 text-xs text-emerald-700">
                  {{ t('You save') }}: <span class="font-bold">{{ (formData.oldPrice - formData.newPrice).toFixed(2) }} {{ t('currencyLE') }}</span>
                </div>
              </div>
            </div>

            <!-- Validity Period -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="offer-start-date" class="block text-sm font-medium text-gray-700 mb-1">
                  {{ t('Start Date') }}
                </label>
                <input
                  id="offer-start-date"
                  v-model="formData.startDate"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label for="offer-end-date" class="block text-sm font-medium text-gray-700 mb-1">
                  {{ t('End Date') }}
                </label>
                <input
                  id="offer-end-date"
                  v-model="formData.endDate"
                  type="date"
                  :min="formData.startDate"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>

            <!-- Offer Type -->
            <div>
              <label for="offer-type" class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('Offer Type') }}
              </label>
              <select
                id="offer-type"
                v-model="formData.offerType"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="percentage">{{ t('Percentage Discount') }}</option>
                <option value="fixed">{{ t('Fixed Amount') }}</option>
                <option value="bundle">{{ t('Bundle Offer') }}</option>
                <option value="free-shipping">{{ t('Free Shipping') }}</option>
                <option value="buy-one-get-one">{{ t('Buy One Get One') }}</option>
              </select>
            </div>

            <!-- Description -->
            <div>
              <label for="offer-description" class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('Description') }}
              </label>
              <textarea
                id="offer-description"
                v-model="formData.description"
                rows="3"
                :placeholder="t('Describe the offer details...')"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              ></textarea>
            </div>

            <!-- Terms & Conditions -->
            <div>
              <label for="offer-terms" class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('Terms & Conditions') }}
              </label>
              <textarea
                id="offer-terms"
                v-model="formData.terms"
                rows="2"
                :placeholder="t('Offer terms and conditions...')"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              ></textarea>
            </div>

            <!-- Status -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('Status') }}
              </label>
              <div class="flex items-center gap-4">
                <label class="inline-flex items-center min-h-[44px]">
                  <input
                    v-model="formData.active"
                    type="radio"
                    :value="true"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span class="ml-2 text-sm text-gray-700">{{ t('Active') }}</span>
                </label>
                <label class="inline-flex items-center min-h-[44px]">
                  <input
                    v-model="formData.active"
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

        <!-- Modal footer -->
        <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
          <button
            type="button"
            @click="save"
            :disabled="loading"
            class="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            <template v-if="loading">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ t('Saving...') }}
            </template>
            <template v-else>
              {{ editing ? t('Update Offer') : t('Add Offer') }}
            </template>
          </button>
          <button
            type="button"
            @click="close"
            :disabled="loading"
            class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            {{ t('Cancel') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted } from 'vue'
import { useLanguageStore } from '@/stores/language'
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '@/firebase/config'

const languageStore = useLanguageStore()
const { t } = languageStore

const props = defineProps<{
  offer?: any
}>()

const emit = defineEmits<{
  close: []
  save: [data: any]
}>()

// Form data
const formData = reactive({
  id: '',
  slug: '',
  title: '',
  imageUrl: '',
  imageFile: null as File | null,
  linkUrl: '',
  subtitle: '',
  oldPrice: 0,
  newPrice: 0,
  startDate: '',
  endDate: '',
  offerType: 'percentage',
  description: '',
  terms: '',
  active: true
})

// Form state
const errors = reactive({
  title: '',
  slug: '',
  imageUrl: '',
  oldPrice: '',
  newPrice: ''
})
const loading = ref(false)
const imagePreview = ref('')
const imageFile = ref<File | null>(null)
const offerImageInput = ref<HTMLInputElement | null>(null)
const editing = computed(() => !!props.offer?.id)

// Helper: Upload image to Firebase Storage
const uploadOfferImage = async (file: File, offerId: string): Promise<string> => {
  const path = `offers/${offerId}/main.jpg`
  const imageRef = storageRef(storage, path)
  await uploadBytes(imageRef, file)
  return await getDownloadURL(imageRef)
}

// Helper: Delete image from Storage
const deleteOfferImageFromStorage = async (imageUrl: string) => {
  if (!imageUrl || !imageUrl.includes('firebasestorage.googleapis.com')) return
  try {
    const decodedUrl = decodeURIComponent(imageUrl)
    const match = decodedUrl.match(/\/o\/(.+?)\?/)
    if (match && match[1]) {
      const path = decodeURIComponent(match[1])
      const imageRef = storageRef(storage, path)
      await deleteObject(imageRef)
    }
  } catch (err) {
    console.warn('Failed to delete offer image from Storage:', err)
  }
}

// Computed
const calculateDiscount = computed(() => {
  if (!formData.oldPrice || !formData.newPrice || formData.oldPrice <= 0) return 0
  const discount = ((formData.oldPrice - formData.newPrice) / formData.oldPrice) * 100
  return Math.round(discount)
})

// Initialize form with offer data if editing
onMounted(() => {
  if (props.offer) {
    Object.assign(formData, {
      id: props.offer.id || '',
      slug: props.offer.slug || '',
      title: props.offer.title || '',
      imageUrl: props.offer.imageUrl || '',
      linkUrl: props.offer.linkUrl || '',
      subtitle: props.offer.subtitle || '',
      oldPrice: props.offer.oldPrice || 0,
      newPrice: props.offer.newPrice || 0,
      startDate: props.offer.startDate || '',
      endDate: props.offer.endDate || '',
      offerType: props.offer.offerType || 'percentage',
      description: props.offer.description || '',
      terms: props.offer.terms || '',
      active: props.offer.active !== undefined ? props.offer.active : true
    })
    
    if (formData.imageUrl) {
      imagePreview.value = formData.imageUrl
    }
  }
})

// Watch image URL for preview
watch(() => formData.imageUrl, (newUrl) => {
  if (newUrl && isValidUrl(newUrl)) {
    imagePreview.value = newUrl
  } else if (!imageFile.value) {
    imagePreview.value = ''
  }
})

// Methods
const isValidUrl = (url: string) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const previewImage = (url: string) => {
  if (url && isValidUrl(url)) {
    imagePreview.value = url
  } else {
    alert(t('Please enter a valid image URL'))
  }
}

const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || !input.files[0]) return
  const file = input.files[0]
  imageFile.value = file
  // Clear URL field and preview from URL
  formData.imageUrl = ''
  // Show local preview
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
  // Clear any image URL errors
  if (errors.imageUrl) errors.imageUrl = ''
}

const removeImage = () => {
  imageFile.value = null
  formData.imageUrl = ''
  imagePreview.value = ''
  if (offerImageInput.value) {
    offerImageInput.value.value = ''
  }
}

const clearImagePreview = () => {
  removeImage()
}

const handleImageError = () => {
  alert(t('Failed to load image. Please check the URL or upload a new image.'))
  imagePreview.value = ''
  formData.imageUrl = ''
}

const validateForm = () => {
  let isValid = true
  
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })
  
  // Validate title
  if (!formData.title.trim()) {
    errors.title = t('Offer title is required')
    isValid = false
  }
  
  // Validate slug
  if (!formData.slug.trim()) {
    errors.slug = t('Slug is required')
    isValid = false
  } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
    errors.slug = t('Slug must contain only lowercase letters, numbers, and hyphens')
    isValid = false
  }
  
  // Validate image: either URL or file must be present
  if (!formData.imageUrl && !imageFile.value) {
    errors.imageUrl = t('Offer image is required (URL or upload)')
    isValid = false
  } else if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
    errors.imageUrl = t('Please enter a valid URL')
    isValid = false
  }
  
  // Validate old price
  if (formData.oldPrice <= 0) {
    errors.oldPrice = t('Old price must be greater than 0')
    isValid = false
  }
  
  // Validate new price
  if (formData.newPrice <= 0) {
    errors.newPrice = t('New price must be greater than 0')
    isValid = false
  }
  
  // Validate price logic
  if (formData.newPrice >= formData.oldPrice) {
    errors.newPrice = t('New price must be less than old price')
    isValid = false
  }
  
  // Validate date range if both dates are provided
  if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
    alert(t('End date must be after start date'))
    isValid = false
  }
  
  return isValid
}

const save = async () => {
  if (!validateForm()) return
  
  loading.value = true
  
  try {
    // If an image file was selected, upload it first
    let finalImageUrl = formData.imageUrl
    if (imageFile.value) {
      // Generate a temporary ID if it's a new offer (no ID yet)
      const tempId = formData.id || Date.now().toString()
      finalImageUrl = await uploadOfferImage(imageFile.value, tempId)
    } else if (editing.value && formData.imageUrl !== props.offer?.imageUrl) {
      // If the image URL changed and we are editing, and it's not a Storage URL, we may need to delete old?
      // For simplicity, we keep existing URL.
    }
    
    // Prepare data to emit
    const offerData = {
      ...formData,
      imageUrl: finalImageUrl,
      imageFile: undefined, // remove file object
      discount: calculateDiscount.value,
      savings: formData.oldPrice - formData.newPrice
    }
    
    // If editing and we uploaded a new image, delete the old one from Storage
    if (editing.value && imageFile.value && props.offer?.imageUrl) {
      await deleteOfferImageFromStorage(props.offer.imageUrl)
    }
    
    emit('save', offerData)
    emit('close')
  } catch (error) {
    console.error('Error saving offer:', error)
    alert(t('Failed to save offer. Please try again.'))
  } finally {
    loading.value = false
  }
}

const close = () => {
  if (loading.value) return
  emit('close')
}

// Keyboard event listener
onMounted(() => {
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      close()
    }
  }
  
  document.addEventListener('keydown', handleKeydown)
  
  // Remove event listener on unmount
  return () => {
    document.removeEventListener('keydown', handleKeydown)
  }
})
</script>

<style scoped>
/* Custom scrollbar for modal */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Focus styles */
:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Touch-friendly buttons */
button, input, select, textarea {
  min-height: 44px;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .bg-white {
    background-color: #1f2937;
  }
  
  .text-gray-900 {
    color: #f9fafb;
  }
  
  .text-gray-500 {
    color: #9ca3af;
  }
  
  .border-gray-300 {
    border-color: #4b5563;
  }
  
  .bg-gray-50 {
    background-color: #374151;
  }
  
  .bg-emerald-50 {
    background-color: #064e3b;
  }
  
  .border-emerald-200 {
    border-color: #065f46;
  }
  
  .text-emerald-800 {
    color: #a7f3d0;
  }
  
  .text-emerald-600 {
    color: #34d399;
  }
  
  .text-emerald-700 {
    color: #10b981;
  }
  
  .ring-gray-300 {
    ring-color: #4b5563;
  }
  
  .hover\:bg-gray-50:hover {
    background-color: #4b5563;
  }
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .px-4 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .sm\:px-6 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .space-y-4 > * + * {
    margin-top: 1rem;
  }
  
  .grid {
    gap: 0.75rem;
  }
}
</style>