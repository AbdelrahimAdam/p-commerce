<!-- src/components/Admin/OffersEditor.vue -->
<template>
  <div class="offers-editor space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-semibold text-gray-800">{{ t('Special Offers') }}</h2>
        <p class="text-gray-600">{{ t('Manage today\'s exclusive offers') }}</p>
      </div>

      <div class="flex items-center gap-3">
        <span class="text-sm text-gray-500">
          {{ t('Offers:') }} {{ offersData.length }}
        </span>
        <button
          @click="addOffer"
          class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          {{ t('Add Offer') }}
        </button>
      </div>
    </div>

    <!-- Offers List -->
    <div class="space-y-6">
      <div
        v-for="(offer, index) in offersData"
        :key="offer.id"
        class="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
      >
        <!-- Offer Header -->
        <div class="bg-red-50 px-4 py-3 border-b border-red-100 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-medium">
              {{ t('Offer') }} #{{ index + 1 }}
            </span>
            <span v-if="offer.isActive" class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
              {{ t('Active') }}
            </span>
            <span v-else class="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
              {{ t('Inactive') }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <!-- Toggle Active Status -->
            <button
              @click="toggleActive(index)"
              :class="[
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                offer.isActive ? 'bg-green-500' : 'bg-gray-300'
              ]"
              :title="offer.isActive ? t('Deactivate') : t('Activate')"
            >
              <span
                :class="[
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  offer.isActive ? 'translate-x-6' : 'translate-x-1'
                ]"
              />
            </button>

            <!-- Remove Button -->
            <button
              @click="removeOffer(index)"
              class="p-1 text-gray-400 hover:text-red-600"
              :title="t('Remove')"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Offer Content -->
        <div class="p-6">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Left Column - Image -->
            <div class="space-y-4">
              <div class="bg-gray-50 rounded-lg p-4">
                <h3 class="font-medium text-gray-800 mb-3">{{ t('Product Image') }}</h3>

                <!-- Current Image -->
                <div class="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-red-50 to-pink-50 mb-4">
                  <img
                    :src="offer.imageUrl || '/images/default-offer.jpg'"
                    :alt="offer.title"
                    class="w-full h-full object-contain p-4"
                    @error="() => handleImageError(offer)"
                  />
                  <!-- Show base64 badge if image is base64 -->
                  <div v-if="offer.imageUrl?.startsWith('data:image/')" class="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    Base64
                  </div>
                </div>

                <!-- Image Upload -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ offer.imageUrl ? t('Change Image') : t('Upload Image') }}
                  </label>
                  <input
                    type="file"
                    :ref="(el) => setFileInputRef(el, index)"
                    @change="(event) => handleImageUpload(event, index)"
                    accept="image/jpeg,image/png,image/webp"
                    class="hidden"
                  />
                  <button
                    @click="uploadOfferImage(index)"
                    class="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    {{ t('Choose Image') }}
                  </button>
                  <p class="text-xs text-gray-500 mt-2">Max 500KB. JPG, PNG, WebP. Images are stored as base64.</p>
                </div>
              </div>
            </div>

            <!-- Middle Column - Details -->
            <div class="space-y-4">
              <div class="bg-gray-50 rounded-lg p-4">
                <h3 class="font-medium text-gray-800 mb-3">{{ t('Offer Details') }}</h3>

                <div class="space-y-4">
                  <!-- Title -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      {{ t('Title') }}
                    </label>
                    <input
                      v-model="offer.title"
                      type="text"
                      maxlength="60"
                      placeholder="e.g., Coco Chanel 50% Off"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      @input="() => updateOffer(index)"
                    />
                    <div class="flex justify-between mt-1">
                      <p class="text-xs text-gray-500">{{ t('Catchy offer title') }}</p>
                      <span class="text-xs text-gray-500">{{ offer.title.length }}/60</span>
                    </div>
                  </div>

                  <!-- Subtitle -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      {{ t('Subtitle') }}
                    </label>
                    <input
                      v-model="offer.subtitle"
                      type="text"
                      maxlength="100"
                      placeholder="e.g., Iconic Eau De Parfum Limited Offer"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      @input="() => updateOffer(index)"
                    />
                    <div class="flex justify-between mt-1">
                      <p class="text-xs text-gray-500">{{ t('Brief description') }}</p>
                      <span class="text-xs text-gray-500">{{ offer.subtitle.length }}/100</span>
                    </div>
                  </div>

                  <!-- Slug -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      {{ t('URL Slug') }}
                    </label>
                    <input
                      v-model="offer.slug"
                      type="text"
                      placeholder="coco-chanel-offer"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      @input="() => updateOffer(index)"
                    />
                    <p class="text-xs text-gray-500 mt-1">
                      {{ t('Used in URLs:') }} /offer/{{ offer.slug || 'offer-name' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column - Pricing & Preview -->
            <div class="space-y-4">
              <!-- Pricing -->
              <div class="bg-gray-50 rounded-lg p-4">
                <h3 class="font-medium text-gray-800 mb-3">{{ t('Pricing') }}</h3>

                <div class="space-y-4">
                  <!-- Original Price -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      {{ t('Original Price') }}
                    </label>
                    <div class="relative">
                      <input
                        v-model.number="offer.oldPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="1500"
                        class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        @input="() => updateOffer(index)"
                      />
                      <span class="absolute left-3 top-2.5 text-gray-500">EGP</span>
                    </div>
                  </div>

                  <!-- Offer Price -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      {{ t('Offer Price') }}
                    </label>
                    <div class="relative">
                      <input
                        v-model.number="offer.newPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="150"
                        class="w-full pl-8 pr-3 py-2 border border-red-300 bg-red-50 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        @input="() => updateOffer(index)"
                      />
                      <span class="absolute left-3 top-2.5 text-red-500">EGP</span>
                    </div>
                  </div>

                  <!-- Discount Calculation -->
                  <div v-if="offer.oldPrice > 0 && offer.newPrice > 0" class="pt-3 border-t">
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600">{{ t('Discount') }}</span>
                      <span class="font-semibold text-green-600">
                        {{ calculateDiscount(offer.oldPrice, offer.newPrice) }}%
                      </span>
                    </div>
                    <div class="flex justify-between text-sm mt-1">
                      <span class="text-gray-600">{{ t('You Save') }}</span>
                      <span class="font-semibold text-red-600">
                        {{ formatCurrency(offer.oldPrice - offer.newPrice) }} EGP
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Preview -->
              <div class="bg-red-50 rounded-lg p-4 border border-red-100">
                <h3 class="font-medium text-gray-800 mb-3">{{ t('Preview') }}</h3>

                <div class="space-y-3">
                  <!-- Badge -->
                  <div class="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full text-sm font-medium w-fit">
                    {{ t('Today\'s Exclusive Offer') }}
                  </div>

                  <!-- Title & Subtitle -->
                  <div>
                    <h4 class="font-semibold text-gray-800">{{ offer.title || t('Offer Title') }}</h4>
                    <p class="text-sm text-gray-600 mt-1">{{ offer.subtitle || t('Offer subtitle') }}</p>
                  </div>

                  <!-- Pricing -->
                  <div class="flex items-baseline gap-3">
                    <span class="text-2xl font-bold text-red-600">
                      {{ offer.newPrice ? formatCurrency(offer.newPrice) : '150' }} EGP
                    </span>
                    <span v-if="offer.oldPrice > offer.newPrice" class="text-gray-400 line-through">
                      {{ formatCurrency(offer.oldPrice) }} EGP
                    </span>
                  </div>

                  <!-- Buy Now Button -->
                  <button class="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium">
                    {{ t('Buy Now') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="offersData.length === 0" class="text-center py-12 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-dashed border-red-200">
      <svg class="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
      </svg>
      <h3 class="mt-4 text-lg font-medium text-gray-900">{{ t('No offers added') }}</h3>
      <p class="mt-1 text-gray-500">{{ t('Create special offers to boost sales') }}</p>
      <button
        @click="addOffer"
        class="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
      >
        {{ t('Create First Offer') }}
      </button>
    </div>

    <!-- Guidelines -->
    <div class="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
      <div class="flex items-start gap-4">
        <svg class="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div>
          <h3 class="font-semibold text-blue-800">{{ t('Offer Management Tips') }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <ul class="text-sm text-blue-700 space-y-2">
              <li class="flex items-start gap-2">
                <svg class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span>{{ t('Use limited-time offers to create urgency') }}</span>
              </li>
              <li class="flex items-start gap-2">
                <svg class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span>{{ t('Highlight significant discounts') }}</span>
              </li>
            </ul>
            <ul class="text-sm text-blue-700 space-y-2">
              <li class="flex items-start gap-2">
                <svg class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span>{{ t('Keep offers simple and clear') }}</span>
              </li>
              <li class="flex items-start gap-2">
                <svg class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span>{{ t('Test different offers regularly') }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useLanguageStore } from '@/stores/language'

// Define offer type
interface Offer {
  id: string
  title: string
  imageUrl: string
  subtitle: string
  oldPrice: number
  newPrice: number
  slug: string
  isActive?: boolean
}

const props = defineProps<{
  offers: Offer[]
}>()

const emit = defineEmits<{
  update: [offers: Offer[]]
  'change-detected': []
}>()

const languageStore = useLanguageStore()
const { t } = languageStore

// Local data
const offersData = ref<Offer[]>(props.offers.map(offer => ({
  ...offer,
  isActive: offer.isActive !== false // Default to active
})))

const fileInputs = ref<(HTMLInputElement | null)[]>([])

// Helper to set file input refs (accepts Vue component instance or element)
const setFileInputRef = (el: any, index: number) => {
  if (el instanceof HTMLInputElement) {
    fileInputs.value[index] = el
  } else {
    fileInputs.value[index] = null
  }
}

// Methods
const updateOffer = (_index: number) => {
  emit('update', offersData.value)
  emit('change-detected')
}

const addOffer = () => {
  const newOffer: Offer = {
    id: `offer-${Date.now()}`,
    title: '',
    imageUrl: '',
    subtitle: '',
    oldPrice: 0,
    newPrice: 0,
    slug: '',
    isActive: true
  }

  offersData.value.push(newOffer)
  fileInputs.value.push(null)
  updateOffer(offersData.value.length - 1)
}

const removeOffer = (index: number) => {
  if (offersData.value.length === 1) {
    alert(t('At least one offer must remain'))
    return
  }

  if (confirm(t('Are you sure you want to remove this offer?'))) {
    offersData.value.splice(index, 1)
    fileInputs.value.splice(index, 1)
    updateOffer(index)
  }
}

const toggleActive = (index: number) => {
  offersData.value[index].isActive = !offersData.value[index].isActive
  updateOffer(index)
}

const uploadOfferImage = (index: number) => {
  fileInputs.value[index]?.click()
}

// Convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const handleImageUpload = async (event: Event, index: number) => {
  const input = event.target as HTMLInputElement
  if (!input.files || !input.files[0]) return

  const file = input.files[0]
  
  // Validate file size (500KB max for Spark plan)
  if (file.size > 500 * 1024) {
    alert(t('Image too large! Maximum size is 500KB.'))
    return
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
    alert(t('Invalid file type. Please upload JPG, PNG, or WebP image.'))
    return
  }

  try {
    // Convert to base64
    const base64 = await fileToBase64(file)
    
    // Update offer image
    offersData.value[index].imageUrl = base64
    updateOffer(index)
    
    // Show success message (optional)
    console.log('✅ Image converted to base64')
  } catch (error) {
    console.error('❌ Error converting image:', error)
    alert(t('Failed to process image. Please try again.'))
  }
}

const handleImageError = (offer: Offer) => {
  console.warn('Image failed to load for offer:', offer.id)
  offer.imageUrl = '/images/default-offer.jpg'
  const idx = offersData.value.findIndex(o => o.id === offer.id)
  if (idx !== -1) {
    updateOffer(idx)
  }
}

const calculateDiscount = (oldPrice: number, newPrice: number): number => {
  if (oldPrice <= 0 || newPrice >= oldPrice) return 0
  return Math.round(((oldPrice - newPrice) / oldPrice) * 100)
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-EG').format(amount)
}
</script>

<style scoped>
/* Base styles */
.offers-editor {
  min-height: 500px;
}

/* Responsive grid adjustments */
@media (max-width: 1024px) {
  .offers-editor .grid {
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .offers-editor .p-6 {
    padding: 1rem;
  }
  
  /* Stack columns on mobile */
  .offers-editor .grid-cols-1.lg\:grid-cols-3 > * {
    width: 100%;
  }
  
  /* Better touch targets */
  .offers-editor button,
  .offers-editor input {
    min-height: 44px;
  }
  
  /* Adjust preview section */
  .offers-editor .bg-red-50 .text-2xl {
    font-size: 1.5rem;
  }
}

/* Custom scrollbar for better UX */
.offers-editor *::-webkit-scrollbar {
  width: 6px;
}

.offers-editor *::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.offers-editor *::-webkit-scrollbar-thumb {
  background: #d4af37;
  border-radius: 3px;
}

.offers-editor *::-webkit-scrollbar-thumb:hover {
  background: #b8941f;
}

/* Smooth transitions */
.offers-editor * {
  transition: all 0.2s ease;
}

/* Focus styles */
.offers-editor input:focus,
.offers-editor button:focus {
  outline: none;
  ring: 2px;
  ring-color: #d4af37;
}

/* Image hover effect */
.offers-editor img {
  transition: transform 0.3s ease;
}

.offers-editor img:hover {
  transform: scale(1.02);
}

/* Ensure preview button doesn't overflow */
.offers-editor .w-fit {
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Mobile-specific adjustments */
@media (max-width: 480px) {
  .offers-editor .bg-red-50 .flex {
    flex-wrap: wrap;
  }
  
  .offers-editor .bg-red-50 .gap-3 {
    gap: 0.5rem;
  }
  
  .offers-editor .text-2xl {
    font-size: 1.25rem;
  }
}
</style>