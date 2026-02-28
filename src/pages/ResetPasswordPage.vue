<!-- src/pages/ResetPasswordPage.vue -->
<template>
  <div class="reset-password-page min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md mx-auto">
      <!-- Logo & Branding -->
      <div class="text-center mb-8">
        <router-link to="/" class="inline-block">
          <div class="flex items-center justify-center gap-3 mb-4">
            <div class="w-16 h-16 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full flex items-center justify-center shadow-gold-lg">
              <span class="text-white font-bold text-2xl">P</span>
            </div>
            <div class="text-left">
              <h1 class="text-2xl font-bold text-gray-900">P.NOTES</h1>
              <p class="text-sm text-gray-500">PERFUME STORE</p>
            </div>
          </div>
        </router-link>
        <h2 class="text-3xl font-bold text-gray-900 mb-2">{{ t('setNewPassword') }}</h2>
        <p class="text-gray-600">{{ t('enterNewPassword') }}</p>
      </div>

      <!-- Success Message -->
      <div v-if="success" class="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6 text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">{{ t('passwordResetSuccess') }}</h3>
        <p class="text-sm text-gray-600 mb-4">{{ t('passwordResetMessage') }}</p>
        <router-link 
          to="/login" 
          class="inline-flex items-center px-6 py-3 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-colors font-medium"
        >
          {{ t('goToLogin') }}
        </router-link>
      </div>

      <!-- Reset Password Form -->
      <div v-else class="bg-white rounded-2xl shadow-xl p-8">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- New Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('newPassword') }} *
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </div>
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                :class="{ 'border-red-500': errors.password }"
                :placeholder="t('newPasswordPlaceholder')"
                @input="validatePassword"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gold-500"
              >
                <svg v-if="!showPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                </svg>
              </button>
            </div>
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
          </div>

          <!-- Confirm Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('confirmPassword') }} *
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </div>
              <input
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                class="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                :class="{ 'border-red-500': errors.confirmPassword }"
                :placeholder="t('confirmPasswordPlaceholder')"
                @input="validateConfirmPassword"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gold-500"
              >
                <svg v-if="!showConfirmPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                </svg>
              </button>
            </div>
            <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">{{ errors.confirmPassword }}</p>
          </div>

          <!-- Password Requirements -->
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-xs font-medium text-gray-700 mb-2">{{ t('passwordRequirements') }}:</p>
            <ul class="space-y-1 text-xs">
              <li class="flex items-center" :class="requirements.minLength ? 'text-green-600' : 'text-gray-500'">
                <svg class="w-3 h-3 mr-2" :class="requirements.minLength ? 'text-green-600' : 'text-gray-400'" fill="currentColor" viewBox="0 0 20 20">
                  <path v-if="requirements.minLength" fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  <circle v-else cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                {{ t('minLength') }}
              </li>
              <li class="flex items-center" :class="requirements.hasUpperCase ? 'text-green-600' : 'text-gray-500'">
                <svg class="w-3 h-3 mr-2" :class="requirements.hasUpperCase ? 'text-green-600' : 'text-gray-400'" fill="currentColor" viewBox="0 0 20 20">
                  <path v-if="requirements.hasUpperCase" fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  <circle v-else cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                {{ t('uppercaseLetter') }}
              </li>
              <li class="flex items-center" :class="requirements.hasLowerCase ? 'text-green-600' : 'text-gray-500'">
                <svg class="w-3 h-3 mr-2" :class="requirements.hasLowerCase ? 'text-green-600' : 'text-gray-400'" fill="currentColor" viewBox="0 0 20 20">
                  <path v-if="requirements.hasLowerCase" fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  <circle v-else cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                {{ t('lowercaseLetter') }}
              </li>
              <li class="flex items-center" :class="requirements.hasNumber ? 'text-green-600' : 'text-gray-500'">
                <svg class="w-3 h-3 mr-2" :class="requirements.hasNumber ? 'text-green-600' : 'text-gray-400'" fill="currentColor" viewBox="0 0 20 20">
                  <path v-if="requirements.hasNumber" fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  <circle v-else cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                {{ t('number') }}
              </li>
            </ul>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="w-full py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-xl font-bold shadow-gold-lg hover:shadow-gold-xl transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!loading">{{ t('resetPassword') }}</span>
            <div v-else class="flex items-center justify-center">
              <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span class="ml-2">{{ t('resetting') }}...</span>
            </div>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'
import { showSuccess, showError } from '@/utils/notifications' // ✅ corrected imports

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { t } = useLanguageStore()

// State
const loading = ref(false)
const error = ref('')
const success = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const token = ref('')

// Form state
const form = reactive({
  password: '',
  confirmPassword: ''
})

// Errors
const errors = reactive({
  password: '',
  confirmPassword: ''
})

// Password requirements
const requirements = reactive({
  minLength: false,
  hasUpperCase: false,
  hasLowerCase: false,
  hasNumber: false
})

// Computed
const isFormValid = computed(() => {
  return form.password && 
         form.confirmPassword && 
         form.password === form.confirmPassword &&
         requirements.minLength &&
         requirements.hasUpperCase &&
         requirements.hasLowerCase &&
         requirements.hasNumber
})

// Methods
const validatePassword = () => {
  const password = form.password
  
  // Check requirements
  requirements.minLength = password.length >= 8
  requirements.hasUpperCase = /[A-Z]/.test(password)
  requirements.hasLowerCase = /[a-z]/.test(password)
  requirements.hasNumber = /\d/.test(password)
  
  // Clear error if valid
  if (requirements.minLength && requirements.hasUpperCase && requirements.hasLowerCase && requirements.hasNumber) {
    errors.password = ''
  } else {
    errors.password = t('passwordTooWeak')
  }
  
  // Also validate confirm password if it exists
  if (form.confirmPassword) {
    validateConfirmPassword()
  }
}

const validateConfirmPassword = () => {
  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = t('passwordsDoNotMatch')
  } else {
    errors.confirmPassword = ''
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  loading.value = true
  error.value = ''

  try {
    // Call the confirm password reset function
    await authStore.confirmPasswordReset(token.value, form.password)
    
    success.value = t('passwordResetSuccess')
    showSuccess(t('passwordResetSuccess')) // ✅ fixed
    
    // Redirect to login after 3 seconds
    setTimeout(() => {
      router.push('/login')
    }, 3000)
    
  } catch (err: any) {
    console.error('Password reset error:', err)
    
    // Handle specific errors
    if (err.code === 'auth/expired-action-code') {
      error.value = t('resetLinkExpired')
    } else if (err.code === 'auth/invalid-action-code') {
      error.value = t('invalidResetLink')
    } else if (err.code === 'auth/weak-password') {
      error.value = t('weakPassword')
    } else {
      error.value = t('resetFailed')
    }
  } finally {
    loading.value = false
  }
}

// Get token from URL
onMounted(() => {
  token.value = route.params.token as string || route.query.oobCode as string
  
  if (!token.value) {
    error.value = t('invalidResetLink')
  }
})
</script>

<style scoped>
/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.reset-password-page {
  animation: slideIn 0.5s ease-out;
}

/* Gradient shadows */
.shadow-gold-lg {
  box-shadow: 0 10px 25px -5px rgba(212, 175, 55, 0.3);
}

.shadow-gold-xl {
  box-shadow: 0 20px 40px -10px rgba(212, 175, 55, 0.4);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .reset-password-page {
    padding-top: 2rem;
    padding-bottom: 2rem;
  }
  
  .bg-white {
    padding: 1.5rem;
  }
}

/* Loading spinner animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Input focus styles */
input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

/* Success animation */
.bg-green-50 {
  animation: slideIn 0.5s ease-out;
}
</style>