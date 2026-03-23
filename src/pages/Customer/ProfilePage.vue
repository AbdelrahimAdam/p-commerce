<template>
  <div class="profile-page min-h-screen bg-gray-50">
    <!-- Header with Back Button -->
    <div class="bg-gradient-to-r from-primary-900 to-primary-700 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button
              @click="goBack"
              class="flex items-center text-white hover:text-gold-200 transition-colors"
              aria-label="Go back"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span class="text-sm">{{ t('back') }}</span>
            </button>
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold font-['Cormorant_Garamond']">{{ t('profileSettings') }}</h1>
              <p class="mt-2 text-primary-100">{{ t('managePersonalInfo') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <!-- Profile Header -->
        <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">{{ t('personalInformation') }}</h2>
        </div>

        <!-- Profile Form -->
        <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
          <!-- Avatar Section -->
          <div class="flex items-center space-x-6">
            <div class="relative">
              <div class="w-24 h-24 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {{ userInitials }}
              </div>
              <button
                type="button"
                @click="triggerFileUpload"
                class="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gold-600 
border border-gray-200"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 
4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </button>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleFileUpload"
              />
            </div>
            <div>
              <h3 class="text-lg font-medium text-gray-900">{{ form.firstName }} {{ form.lastName }}</h3>
              <p class="text-sm text-gray-500">{{ form.email }}</p>
            </div>
          </div>

          <!-- Name Fields -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('firstName') }} *
              </label>
              <input
                v-model="form.firstName"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('lastName') }} *
              </label>
              <input
                v-model="form.lastName"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('email') }} *
            </label>
            <input
              v-model="form.email"
              type="email"
              required
              disabled
              class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p class="mt-1 text-xs text-gray-500">{{ t('emailCannotBeChanged') }}</p>
          </div>

          <!-- Phone -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('phone') }}
            </label>
            <input
              v-model="form.phoneNumber"
              type="tel"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
              :placeholder="t('phonePlaceholder')"
            />
          </div>

          <!-- Newsletter Preferences -->
          <div class="border-t border-gray-200 pt-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">{{ t('preferences') }}</h3>
            <div class="space-y-3">
              <label class="flex items-center">
                <input
                  v-model="form.newsletter"
                  type="checkbox"
                  class="w-4 h-4 text-gold-500 border-gray-300 rounded focus:ring-gold-500"
                />
                <span class="ml-2 text-sm text-gray-700">{{ t('subscribeNewsletter') }}</span>
              </label>
            </div>
          </div>

          <!-- Change Password Section -->
          <div class="border-t border-gray-200 pt-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">{{ t('changePassword') }}</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('currentPassword') }}
                </label>
                <input
                  v-model="passwordForm.current"
                  type="password"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('newPassword') }}
                </label>
                <input
                  v-model="passwordForm.new"
                  type="password"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('confirmNewPassword') }}
                </label>
                <input
                  v-model="passwordForm.confirm"
                  type="password"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
              <button
                type="button"
                @click="changePassword"
                class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {{ t('updatePassword') }}
              </button>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="border-t border-gray-200 pt-6 flex justify-end space-x-3">
            <button
              type="button"
              @click="goBack"
              class="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {{ t('cancel') }}
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-6 py-3 bg-gold-500 text-white rounded-lg text-sm font-medium hover:bg-gold-600 disabled:opacity-50"
            >
              {{ saving ? t('saving') + '...' : t('saveChanges') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'
import { showSuccess, showError, showInfo } from '@/utils/notifications'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useLanguageStore()

// State
const saving = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

// Form state
const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  newsletter: false
})

// Password form
const passwordForm = reactive({
  current: '',
  new: '',
  confirm: ''
})

// Computed
const userInitials = computed(() => {
  if (!authStore.customer?.displayName) return 'U'
  return authStore.customer.displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

// Methods
const goBack = () => {
  router.back()
}

const triggerFileUpload = () => {
  fileInput.value?.click()
}

const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    // File is intentionally unused for now, just show notification
    showInfo(t('uploadingImage'), '')
  }
}

const handleSubmit = async () => {
  saving.value = true
  try {
    await authStore.updateCustomerProfile({
      displayName: `${form.firstName} ${form.lastName}`,
      phoneNumber: form.phoneNumber,
      newsletter: form.newsletter
    })
    
    showSuccess(t('profileUpdated'), '')
    // Optionally go back after successful save
    goBack()
  } catch (error) {
    showError(t('updateFailed'), '')
  } finally {
    saving.value = false
  }
}

const changePassword = async () => {
  if (passwordForm.new !== passwordForm.confirm) {
    showError(t('passwordsDoNotMatch'), '')
    return
  }
  
  try {
    await authStore.changeCustomerPassword(passwordForm.current, passwordForm.new)
    showSuccess(t('passwordUpdated'), '')
    
    // Clear password form
    passwordForm.current = ''
    passwordForm.new = ''
    passwordForm.confirm = ''
  } catch (error) {
    showError(t('passwordUpdateFailed'), '')
  }
}

const loadUserData = () => {
  const customer = authStore.customer
  if (!customer) return
  
  const nameParts = customer.displayName?.split(' ') || ['', '']
  form.firstName = nameParts[0] || ''
  form.lastName = nameParts.slice(1).join(' ') || ''
  form.email = customer.email || ''
  form.phoneNumber = customer.phoneNumber || ''
  form.newsletter = customer.newsletter || false
}

onMounted(() => {
  // Redirect if not authenticated as customer
  if (!authStore.isCustomer) {
    router.push('/login')
    return
  }
  loadUserData()
})
</script>
