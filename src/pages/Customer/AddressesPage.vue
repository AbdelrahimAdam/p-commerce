<!-- src/pages/Customer/AddressesPage.vue -->
<template>
  <div class="addresses-page min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="loading && !addresses.length" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
        <p class="mt-4 text-gray-600">{{ t('loading') }}...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen p-4">
      <div class="text-center max-w-md">
        <svg class="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">{{ t('errorLoadingAddresses') }}</h3>
        <p class="mt-2 text-gray-500">{{ error }}</p>
        <button 
          @click="loadAddresses" 
          class="mt-6 px-6 py-3 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-colors"
        >
          {{ t('tryAgain') }}
        </button>
      </div>
    </div>

    <!-- Not Logged In State -->
    <div v-else-if="!isAuthenticated" class="flex items-center justify-center min-h-screen p-4">
      <div class="text-center max-w-md">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">{{ t('notLoggedIn') }}</h3>
        <p class="mt-2 text-gray-500">{{ t('pleaseLoginToViewAddresses') }}</p>
        <div class="mt-6">
          <router-link 
            to="/login" 
            class="inline-block px-6 py-3 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-colors"
          >
            {{ t('login') }}
          </router-link>
        </div>
      </div>
    </div>

    <!-- Main Content - Only show when authenticated -->
    <template v-else>
      <!-- Header -->
      <div class="bg-gradient-to-r from-primary-900 to-primary-700 text-white py-8 px-4 sm:py-10 sm:px-6 lg:px-8">
        <div class="max-w-7xl mx-auto">
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold font-['Cormorant_Garamond']">{{ t('savedAddresses') }}</h1>
          <p class="mt-2 text-primary-100 text-sm sm:text-base">{{ t('manageYourAddresses') }}</p>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          <!-- Sidebar (unchanged) -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden sticky top-24">
              <!-- User Info -->
              <div class="p-4 sm:p-6 bg-gradient-to-r from-gold-500 to-gold-600 text-white">
                <div class="flex items-center space-x-3 sm:space-x-4">
                  <div class="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span class="text-xl sm:text-2xl font-bold">{{ userInitials }}</span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <h3 class="font-bold text-sm sm:text-base truncate">{{ customer?.displayName || t('customer') }}</h3>
                    <p class="text-xs sm:text-sm text-white/80 truncate">{{ customer?.email }}</p>
                  </div>
                </div>
              </div>

              <!-- Navigation - Mobile Horizontal Scroll -->
              <nav class="p-3 sm:p-4 overflow-x-auto lg:overflow-visible">
                <ul class="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 min-w-max lg:min-w-0">
                  <li>
                    <router-link to="/account" class="flex items-center px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-gray-700 hover:bg-gray-50 whitespace-nowrap lg:whitespace-normal transition-colors">
                      <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                      </svg>
                      <span class="text-xs sm:text-sm">{{ t('dashboard') }}</span>
                    </router-link>
                  </li>
                  <li>
                    <router-link to="/account/profile" class="flex items-center px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-gray-700 hover:bg-gray-50 whitespace-nowrap lg:whitespace-normal transition-colors">
                      <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                      <span class="text-xs sm:text-sm">{{ t('profile') }}</span>
                    </router-link>
                  </li>
                  <li>
                    <router-link to="/account/addresses" class="flex items-center px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-gold-50 text-gold-600 whitespace-nowrap lg:whitespace-normal">
                      <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      <span class="text-xs sm:text-sm">{{ t('addresses') }}</span>
                    </router-link>
                  </li>
                  <li>
                    <router-link to="/orders" class="flex items-center px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-gray-700 hover:bg-gray-50 whitespace-nowrap lg:whitespace-normal transition-colors">
                      <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                      </svg>
                      <span class="text-xs sm:text-sm">{{ t('orders') }}</span>
                    </router-link>
                  </li>
                  <li>
                    <router-link to="/wishlist" class="flex items-center px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-gray-700 hover:bg-gray-50 whitespace-nowrap lg:whitespace-normal transition-colors">
                      <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                      </svg>
                      <span class="text-xs sm:text-sm">{{ t('wishlist') }}</span>
                    </router-link>
                  </li>
                  <li class="lg:pt-4 lg:mt-4 lg:border-t lg:border-gray-200">
                    <button @click="handleLogout" class="flex items-center w-full px-3 sm:px-4 py-2.5 sm:py-3 text-red-600 hover:bg-red-50 rounded-lg whitespace-nowrap lg:whitespace-normal transition-colors">
                      <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                      </svg>
                      <span class="text-xs sm:text-sm">{{ t('logout') }}</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          <!-- Addresses Content -->
          <div class="lg:col-span-3">
            <div class="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
              <!-- Header -->
              <div class="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h2 class="text-base sm:text-lg font-medium text-gray-900">{{ t('yourAddresses') }}</h2>
                <button
                  @click="showAddressForm = true"
                  class="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 text-xs sm:text-sm font-medium transition-colors w-full sm:w-auto"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                  </svg>
                  {{ t('addNewAddress') }}
                </button>
              </div>

              <!-- Loading State -->
              <div v-if="loading" class="p-8 sm:p-12 text-center">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
                <p class="mt-3 text-sm text-gray-500">{{ t('loadingAddresses') }}</p>
              </div>

              <!-- Empty State -->
              <div v-else-if="addresses.length === 0" class="p-8 sm:p-12 text-center">
                <svg class="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <h3 class="mt-4 text-base sm:text-lg font-medium text-gray-900">{{ t('noAddressesYet') }}</h3>
                <p class="mt-1 text-xs sm:text-sm text-gray-500">{{ t('addAddressDescription') }}</p>
                <div class="mt-6">
                  <button
                    @click="showAddressForm = true"
                    class="inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gold-500 text-white rounded-lg hover:bg-gold-600 text-xs sm:text-sm font-medium transition-colors"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    {{ t('addYourFirstAddress') }}
                  </button>
                </div>
              </div>

              <!-- Addresses Grid -->
              <div v-else class="p-4 sm:p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div
                    v-for="address in addresses"
                    :key="address.id"
                    class="border border-gray-200 rounded-xl p-4 sm:p-6 relative hover:shadow-lg transition-all duration-300 bg-white"
                  >
                    <!-- Default Badge -->
                    <div v-if="address.isDefault" class="absolute top-3 right-3 sm:top-4 sm:right-4">
                      <span class="px-2 py-1 bg-gold-100 text-gold-700 text-xs font-medium rounded-full">
                        {{ t('default') }}
                      </span>
                    </div>

                    <!-- Address Content -->
                    <div class="pr-12 sm:pr-16">
                      <h3 class="font-semibold text-sm sm:text-base text-gray-900">{{ address.fullName }}</h3>
                      <p class="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">{{ address.addressLine1 }}</p>
                      <p class="text-xs sm:text-sm text-gray-600">{{ address.city }}, {{ address.state }} {{ address.postalCode }}</p>
                      <p class="text-xs sm:text-sm text-gray-600">{{ address.country }}</p>
                      <p class="text-xs sm:text-sm text-gray-600 mt-3 font-medium">{{ t('phone') }}: {{ address.phone }}</p>
                    </div>

                    <!-- Actions -->
                    <div class="mt-4 pt-4 border-t border-gray-100 flex flex-wrap justify-end gap-2">
                      <button
                        v-if="!address.isDefault"
                        @click="setDefaultAddress(address.id)"
                        class="px-2 py-1 text-xs text-gray-500 hover:text-gold-600 transition-colors"
                      >
                        {{ t('setDefault') }}
                      </button>
                      <button
                        @click="editAddress(address)"
                        class="px-2 py-1 text-xs text-gray-500 hover:text-gold-600 transition-colors"
                      >
                        {{ t('edit') }}
                      </button>
                      <button
                        @click="deleteAddress(address.id)"
                        class="px-2 py-1 text-xs text-red-500 hover:text-red-600 transition-colors"
                      >
                        {{ t('delete') }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Add/Edit Address Modal -->
    <div v-if="showAddressForm" class="fixed inset-0 overflow-y-auto z-50 px-4">
      <div class="flex items-center justify-center min-h-screen">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" @click="showAddressForm = false"></div>

        <div class="relative bg-white rounded-xl sm:rounded-2xl w-full max-w-lg mx-auto shadow-2xl transform transition-all">
          <div class="p-5 sm:p-6">
            <!-- Modal Header -->
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg sm:text-xl font-semibold text-gray-900">
                {{ editingAddress ? t('editAddress') : t('addNewAddress') }}
              </h3>
              <button
                @click="showAddressForm = false"
                class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <form @submit.prevent="saveAddress" class="space-y-4">
              <!-- Full Name -->
              <div>
                <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  {{ t('fullName') }} *
                </label>
                <input
                  v-model="addressForm.fullName"
                  type="text"
                  required
                  class="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                />
              </div>

              <!-- Address Line -->
              <div>
                <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  {{ t('addressLine') }} *
                </label>
                <input
                  v-model="addressForm.addressLine1"
                  type="text"
                  required
                  class="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                />
              </div>

              <!-- Address Line 2 (optional) -->
              <div>
                <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  {{ t('addressLine2') }} ({{ t('optional') }})
                </label>
                <input
                  v-model="addressForm.addressLine2"
                  type="text"
                  class="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                />
              </div>

              <!-- City and State -->
              <div class="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    {{ t('city') }} *
                  </label>
                  <input
                    v-model="addressForm.city"
                    type="text"
                    required
                    class="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    {{ t('state') }}
                  </label>
                  <input
                    v-model="addressForm.state"
                    type="text"
                    class="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <!-- Postal Code and Country -->
              <div class="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    {{ t('postalCode') }} *
                  </label>
                  <input
                    v-model="addressForm.postalCode"
                    type="text"
                    required
                    class="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    {{ t('country') }} *
                  </label>
                  <select
                    v-model="addressForm.country"
                    required
                    class="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                  >
                    <option value="Egypt">{{ t('egypt') }}</option>
                    <option value="UAE">{{ t('uae') }}</option>
                    <option value="Saudi Arabia">{{ t('saudiArabia') }}</option>
                    <option value="Kuwait">{{ t('kuwait') }}</option>
                  </select>
                </div>
              </div>

              <!-- Phone -->
              <div>
                <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  {{ t('phoneNumber') }} *
                </label>
                <input
                  v-model="addressForm.phone"
                  type="tel"
                  required
                  class="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                />
              </div>

              <!-- Default Address Checkbox -->
              <label class="flex items-center space-x-3 cursor-pointer">
                <input
                  v-model="addressForm.isDefault"
                  type="checkbox"
                  class="w-4 h-4 text-gold-500 border-gray-300 rounded focus:ring-gold-500"
                />
                <span class="text-sm text-gray-700">{{ t('setAsDefaultAddress') }}</span>
              </label>

              <!-- Form Actions -->
              <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-4">
                <button
                  type="button"
                  @click="showAddressForm = false"
                  class="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {{ t('cancel') }}
                </button>
                <button
                  type="submit"
                  :disabled="saving"
                  class="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gold-500 text-white rounded-lg text-sm font-medium hover:bg-gold-600 disabled:opacity-50 transition-colors"
                >
                  <span v-if="!saving">{{ t('save') }}</span>
                  <span v-else class="flex items-center justify-center">
                    <svg class="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    {{ t('saving') }}...
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'
import { authNotification } from '@/utils/notifications'
import { showConfirmation } from '@/utils/confirmation'
import type { Address } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useLanguageStore()

// State
const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)
const showAddressForm = ref(false)
const editingAddress = ref<Address | null>(null)
const addresses = ref<Address[]>([])

// Address form – now matches the Address type
const addressForm = reactive<Partial<Address>>({
  fullName: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'Egypt',
  phone: '',
  isDefault: false
})

// Computed - Safe access with null checks
const customer = computed(() => authStore.customer)
const isAuthenticated = computed(() => authStore.isAuthenticated)

const userInitials = computed(() => {
  const displayName = customer.value?.displayName
  if (!displayName) return 'U'
  return displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

// Methods
const loadAddresses = async () => {
  if (!isAuthenticated.value || !customer.value) {
    loading.value = false
    return
  }

  loading.value = true
  error.value = null
  
  try {
    // Load addresses from customer data
    addresses.value = customer.value.addresses || []
  } catch (err) {
    console.error('Error loading addresses:', err)
    error.value = t('failedToLoadAddresses')
  } finally {
    loading.value = false
  }
}

const saveAddress = async () => {
  if (!customer.value) return
  
  saving.value = true
  try {
    // Create a complete address object
    const addressData: Omit<Address, 'id'> = {
      fullName: addressForm.fullName || '',
      addressLine1: addressForm.addressLine1 || '',
      addressLine2: addressForm.addressLine2 || '',
      city: addressForm.city || '',
      state: addressForm.state || '',
      postalCode: addressForm.postalCode || '',
      country: addressForm.country || 'Egypt',
      phone: addressForm.phone || '',
      isDefault: addressForm.isDefault || false
    }

    if (editingAddress.value) {
      // Update existing address (preserve the original id)
      await authStore.updateCustomerAddress(editingAddress.value.id, addressData)
      authNotification.loggedIn(t('addressUpdated'))
    } else {
      // Add new address
      await authStore.addCustomerAddress(addressData as Address)
      authNotification.loggedIn(t('addressAdded'))
    }
    
    showAddressForm.value = false
    resetForm()
    await loadAddresses()
  } catch (error) {
    console.error('Error saving address:', error)
    authNotification.error(t('saveFailed'))
  } finally {
    saving.value = false
  }
}

const editAddress = (address: Address) => {
  editingAddress.value = address
  // Fill the form with the address data
  addressForm.fullName = address.fullName
  addressForm.addressLine1 = address.addressLine1
  addressForm.addressLine2 = address.addressLine2 || ''
  addressForm.city = address.city
  addressForm.state = address.state || ''
  addressForm.postalCode = address.postalCode || ''
  addressForm.country = address.country
  addressForm.phone = address.phone
  addressForm.isDefault = address.isDefault || false
  showAddressForm.value = true
}

const deleteAddress = async (addressId: string) => {
  const confirmed = await showConfirmation({
    title: t('deleteAddress'),
    message: t('confirmDeleteAddress'),
    confirmText: t('delete'),
    cancelText: t('cancel'),
    type: 'warning'
  })
  
  if (confirmed) {
    try {
      await authStore.removeCustomerAddress(addressId)
      await loadAddresses()
      authNotification.loggedIn(t('addressDeleted'))
    } catch (error) {
      console.error('Error deleting address:', error)
      authNotification.error(t('deleteFailed'))
    }
  }
}

const setDefaultAddress = async (addressId: string) => {
  try {
    await authStore.setDefaultAddress(addressId)
    await loadAddresses()
    authNotification.loggedIn(t('defaultAddressUpdated'))
  } catch (error) {
    console.error('Error setting default address:', error)
    authNotification.error(t('updateFailed'))
  }
}

const resetForm = () => {
  editingAddress.value = null
  addressForm.fullName = ''
  addressForm.addressLine1 = ''
  addressForm.addressLine2 = ''
  addressForm.city = ''
  addressForm.state = ''
  addressForm.postalCode = ''
  addressForm.country = 'Egypt'
  addressForm.phone = ''
  addressForm.isDefault = false
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/')
    authNotification.loggedOut()
  } catch (error) {
    console.error('Logout error:', error)
    authNotification.error(t('logoutFailed'))
  }
}

onMounted(() => {
  loadAddresses()
})
</script>

<style scoped>
/* Smooth transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Better touch targets for mobile */
@media (max-width: 640px) {
  button, 
  input,
  select,
  .rounded-lg {
    min-height: 44px;
  }
  
  /* Improve spacing */
  .space-y-4 > :not([hidden]) ~ :not([hidden]) {
    margin-top: 1rem;
  }
}

/* Loading spinner animation */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Focus styles for better accessibility */
input:focus-visible,
button:focus-visible,
select:focus-visible {
  outline: 2px solid #d4af37;
  outline-offset: 2px;
}

/* Disabled state */
button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Custom scrollbar for sidebar navigation */
.overflow-x-auto::-webkit-scrollbar {
  height: 3px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #d4af37;
  border-radius: 3px;
}

/* Card hover effect */
.hover\:shadow-lg:hover {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.02);
}
</style>