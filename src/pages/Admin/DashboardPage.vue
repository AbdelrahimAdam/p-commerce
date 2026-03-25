<!-- src/pages/Admin/DashboardPage.vue -->
<template>
  <div class="admin-dashboard">
    <!-- Loading State -->
    <div v-if="homepageStore.isLoading" class="flex items-center justify-center p-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      <span class="ml-3 text-gray-600">{{ t('Loading dashboard...') }}</span>
    </div>

    <!-- Error State -->
    <div v-else-if="homepageStore.error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <p class="text-red-600">{{ homepageStore.error }}</p>
    </div>

    <!-- Main Dashboard Content -->
    <div v-else class="space-y-6">
      <!-- Stats Cards Grid (homepage only) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Hero Banner Card -->
        <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">{{ t('Hero Banner') }}</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">
                {{ heroBanner.imageUrl ? '1' : '0' }}
              </p>
              <p class="text-xs text-gray-500 mt-1">
                {{ heroBanner.imageUrl ? t('Active') : t('No Banner') }}
              </p>
            </div>
            <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Special Offers Card -->
        <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">{{ t('Special Offers') }}</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">
                {{ activeOffers.length }}
              </p>
              <p class="text-xs text-gray-500 mt-1">
                {{ t('Current promotions') }}
              </p>
            </div>
            <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Dark Mode Status (example) -->
        <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">{{ t('Dark Mode') }}</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">
                {{ settings.isDarkMode ? t('On') : t('Off') }}
              </p>
              <p class="text-xs text-gray-500 mt-1">
                {{ settings.isDarkMode ? t('Enabled') : t('Disabled') }}
              </p>
            </div>
            <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Management Sections Grid (homepage only) -->
      <div class="grid lg:grid-cols-2 gap-4">
        <!-- Hero Banner Management -->
        <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div class="p-4 border-b border-gray-200">
            <h2 class="text-lg font-bold text-gray-900">{{ t('Hero Banner Management') }}</h2>
          </div>
          <div class="p-4">
            <div class="space-y-4">
              <div class="relative h-40 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  v-if="heroBanner.imageUrl"
                  :src="heroBanner.imageUrl"
                  :alt="t('Hero Banner')"
                  class="w-full h-full object-cover"
                  loading="lazy"
                  @error="handleImageError"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                  <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
              </div>
              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('Banner Image') }}</label>
                  <div class="flex items-center space-x-2">
                    <input
                      v-model="heroBanner.imageUrl"
                      type="text"
                      class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      :placeholder="t('Image URL or upload new')"
                    />
                    <input
                      type="file"
                      ref="bannerFileInput"
                      accept="image/*"
                      class="hidden"
                      @change="handleBannerImageUpload"
                    />
                    <button
                      @click="bannerFileInput?.click()"
                      class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {{ t('Upload') }}
                    </button>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('Link Text') }}</label>
                  <input
                    v-model="heroBanner.linkText"
                    type="text"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    :placeholder="t('e.g., SHOP NOW')"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('Link URL') }}</label>
                  <input
                    v-model="heroBanner.linkUrl"
                    type="text"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    :placeholder="t('e.g., /shop')"
                  />
                </div>
                <button
                  @click="updateHeroBanner"
                  :disabled="homepageStore.isLoading"
                  class="w-full bg-primary-600 text-white py-2.5 text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ homepageStore.isLoading ? t('Saving...') : t('Update Banner') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Special Offers Management -->
        <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div class="p-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-bold text-gray-900">{{ t('Special Offers Management') }}</h2>
              <button
                @click="openAddOfferModal"
                class="bg-primary-600 text-white px-3 py-1.5 text-xs font-medium rounded-lg hover:bg-primary-700 transition-colors min-h-[32px]"
              >
                {{ t('Add Offer') }}
              </button>
            </div>
          </div>
          <div class="max-h-80 overflow-y-auto">
            <div
              v-for="offer in activeOffers"
              :key="offer.id"
              class="p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
            >
              <div class="flex items-center gap-3">
                <img
                  :src="offer.imageUrl"
                  :alt="offer.title"
                  class="w-12 h-12 flex-shrink-0 object-cover rounded-lg"
                  loading="lazy"
                  @error="handleOfferImageError(offer)"
                />
                <div class="flex-1 min-w-0">
                  <h3 class="font-medium text-gray-900 truncate">{{ offer.title }}</h3>
                  <p class="text-xs text-gray-600 mt-0.5 truncate">{{ offer.subtitle }}</p>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="text-xs line-through text-gray-500">{{ offer.oldPrice }} {{ t('currencyLE') }}</span>
                    <span class="text-sm font-bold text-emerald-600">{{ offer.newPrice }} {{ t('currencyLE') }}</span>
                  </div>
                </div>
                <div class="flex items-center gap-1 flex-shrink-0">
                  <button
                    @click="editOffer(offer)"
                    class="p-1.5 text-blue-600 hover:text-blue-700 transition-colors min-h-[32px] min-w-[32px]"
                    :title="t('Edit')"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  <button
                    @click="removeOffer(offer.id!)"
                    class="p-1.5 text-red-600 hover:text-red-700 transition-colors min-h-[32px] min-w-[32px]"
                    :title="t('Remove')"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div v-if="activeOffers.length === 0" class="p-8 text-center text-gray-500">
              <svg class="w-10 h-10 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" 
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
              <p class="text-sm">{{ t('No special offers yet') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-xl shadow-sm p-4">
        <h3 class="text-lg font-bold text-gray-900 mb-4">{{ t('Quick Actions') }}</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <button
            @click="toggleDarkMode"
            :disabled="homepageStore.isLoading"
            class="bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium min-h-[44px]"
          >
            {{ settings.isDarkMode ? t('Disable Dark Mode') : t('Enable Dark Mode') }}
          </button>
          <button
            @click="resetToDefaults"
            :disabled="homepageStore.isLoading"
            class="bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium min-h-[44px]"
          >
            {{ t('Reset to Defaults') }}
          </button>
          <button
            @click="reloadData"
            :disabled="homepageStore.isLoading"
            class="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium min-h-[44px]"
          >
            {{ t('Reload Data') }}
          </button>
        </div>
        <div class="mt-4 text-xs text-gray-500">
          <p>{{ t('Last updated') }}: {{ homepageData.lastUpdated ? formatDate(homepageData.lastUpdated) : t('Never') }}</p>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <AddOfferModal
      v-if="showAddOfferModal"
      :initialOffer="editingOfferData"
      @close="closeAddOfferModal"
      @save="handleOfferSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLanguageStore } from '@/stores/language'
import { useHomepageStore } from '@/stores/homepage'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import AddOfferModal from '@/components/Admin/AddOfferModal.vue'

const router = useRouter()
const languageStore = useLanguageStore()
const homepageStore = useHomepageStore()
const authStore = useAuthStore()

// Admin guard
if (!authStore.isAdmin) {
  router.push('/admin')
}

const { t, formatDate } = languageStore

// =================== COMPUTED ===================
const homepageData = computed(() => homepageStore.homepageData)
const heroBanner = computed({
  get: () => homepageData.value?.heroBanner || { imageUrl: '', linkText: '', linkUrl: '' },
  set: (_val) => { /* empty setter for v-model compatibility */ }
})
const activeOffers = computed(() => homepageData.value?.activeOffers || [])
const settings = computed(() => homepageData.value?.settings || { isDarkMode: false, defaultLanguage: 'ar' })

// =================== STATE ===================
const showAddOfferModal = ref(false)
const editingOfferData = ref<any>(null)
const bannerFileInput = ref<HTMLInputElement | null>(null)

// =================== METHODS ===================

// --- Initial Load ---
onMounted(async () => {
  await homepageStore.loadHomepageData()
})

// --- Hero Banner ---
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '' // fallback placeholder
}

const handleBannerImageUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.[0]) return
  const file = input.files[0]
  try {
    const base64 = await fileToBase64(file)
    heroBanner.value.imageUrl = base64
  } catch (error) {
    alert('Failed to read image file')
  }
  input.value = ''
}

const updateHeroBanner = async () => {
  try {
    await homepageStore.updateHomepageData({ heroBanner: heroBanner.value })
    alert(t('Hero banner updated successfully!'))
  } catch (error: any) {
    alert(t('Failed to update hero banner: ') + error.message)
  }
}

// --- Offers ---
const openAddOfferModal = () => {
  editingOfferData.value = null
  showAddOfferModal.value = true
}

const editOffer = (offer: any) => {
  editingOfferData.value = { ...offer }
  showAddOfferModal.value = true
}

const closeAddOfferModal = () => {
  showAddOfferModal.value = false
  editingOfferData.value = null
}

const handleOfferSave = async (offerData: any) => {
  try {
    let updatedOffers
    if (editingOfferData.value) {
      // edit
      updatedOffers = activeOffers.value.map(o => o.id === offerData.id ? offerData : o)
    } else {
      // new
      const newId = Date.now().toString()
      updatedOffers = [...activeOffers.value, { ...offerData, id: newId }]
    }
    await homepageStore.updateHomepageData({ activeOffers: updatedOffers })
    closeAddOfferModal()
    alert(t('Offer saved successfully!'))
  } catch (error: any) {
    alert(t('Failed to save offer: ') + error.message)
  }
}

const removeOffer = async (id: string) => {
  if (!confirm(t('Are you sure?'))) return
  try {
    const updatedOffers = activeOffers.value.filter(o => o.id !== id)
    await homepageStore.updateHomepageData({ activeOffers: updatedOffers })
  } catch (error: any) {
    alert(t('Failed to remove offer: ') + error.message)
  }
}

const handleOfferImageError = (offer: any) => {
  offer.imageUrl = ''
}

// --- Quick Actions ---
const toggleDarkMode = async () => {
  try {
    await homepageStore.toggleDarkMode()
  } catch (error: any) {
    alert(t('Failed to toggle dark mode: ') + error.message)
  }
}

const resetToDefaults = async () => {
  if (!confirm(t('Are you sure you want to reset all homepage data to defaults?'))) return
  try {
    await homepageStore.resetToDefaults()
    alert(t('Data reset to defaults successfully!'))
  } catch (error: any) {
    alert(t('Failed to reset data: ') + error.message)
  }
}

const reloadData = async () => {
  await homepageStore.loadHomepageData(true)
  alert(t('Data reloaded successfully!'))
}

// --- Utilities ---
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
</script>

<style scoped>
.admin-dashboard {
  -webkit-tap-highlight-color: transparent;
}

/* Custom scrollbar for overflow areas */
.max-h-80::-webkit-scrollbar {
  width: 6px;
}
.max-h-80::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}
.max-h-80::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}
.max-h-80::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Ensure buttons have adequate touch targets */
button {
  min-height: 44px;
  min-width: 44px;
}

/* Make buttons smaller on desktop? No, keep consistency */
@media (min-width: 768px) {
  button {
    min-height: 40px;
    min-width: 40px;
  }
}

/* Smooth transitions */
.transition-all {
  transition: all 0.3s ease-in-out;
}

/* Better button hover effects */
button:hover {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}
button:active {
  transform: translateY(0);
}

/* Improve image loading */
img {
  transition: opacity 0.3s ease;
  background-color: #f3f4f6;
}
img[src=""], img:not([src]) {
  opacity: 0;
}

/* Image hover effects */
img:hover {
  transform: scale(1.02);
  transition: transform 0.3s ease;
}

/* Focus styles for inputs */
input:focus,
button:focus {
  outline: none;
  ring: 2px solid #4f46e5;
}

/* Upload button styles */
input[type="file"] {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Status message animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.bg-green-50, .bg-red-50, .bg-yellow-50 {
  animation: fadeIn 0.3s ease-out;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .grid-cols-1 {
    gap: 1rem;
  }
  .p-4 {
    padding: 1rem;
  }
  .text-sm {
    font-size: 0.875rem;
  }
  .text-xs {
    font-size: 0.75rem;
  }
}
</style>