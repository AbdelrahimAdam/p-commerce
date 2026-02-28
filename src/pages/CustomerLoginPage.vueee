<!-- src/pages/CustomerLoginPage.vue -->
<template>
  <div class="customer-login-page min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
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
        <h2 class="text-3xl font-bold text-gray-900 mb-2">{{ t('welcomeBack') }}</h2>
        <p class="text-gray-600">{{ t('signInToAccount') }}</p>
      </div>

      <!-- Login Form -->
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Email Field -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('emailAddress') }} *
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12H8m0 0l4-4m-4 4l4 4m8-8v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2z"/>
                </svg>
              </div>
              <input
                v-model="form.email"
                type="email"
                required
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                :placeholder="t('emailPlaceholder')"
              />
            </div>
          </div>

          <!-- Password Field -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('password') }} *
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
                :placeholder="t('passwordPlaceholder')"
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
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between">
            <label class="flex items-center">
              <input
                v-model="form.remember"
                type="checkbox"
                class="w-4 h-4 text-gold-500 border-gray-300 rounded focus:ring-gold-500"
              />
              <span class="ml-2 text-sm text-gray-600">{{ t('rememberMe') }}</span>
            </label>
            <router-link 
              to="/forgot-password" 
              class="text-sm text-gold-600 hover:text-gold-700 font-medium"
            >
              {{ t('forgotPassword') }}?
            </router-link>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-xl font-bold shadow-gold-lg hover:shadow-gold-xl transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!loading">{{ t('signIn') }}</span>
            <div v-else class="flex items-center justify-center">
              <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span class="ml-2">{{ t('signingIn') }}...</span>
            </div>
          </button>

          <!-- Divider -->
          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">{{ t('orContinueWith') }}</span>
            </div>
          </div>

          <!-- Social Login (Optional) -->
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              @click="handleGoogleLogin"
              class="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button
              type="button"
              @click="handleFacebookLogin"
              class="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg class="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>

          <!-- Register Link -->
          <p class="text-center text-sm text-gray-600">
            {{ t('dontHaveAccount') }}
            <router-link 
              to="/register" 
              class="text-gold-600 hover:text-gold-700 font-medium"
            >
              {{ t('createAccount') }}
            </router-link>
          </p>

          <!-- Guest Checkout Link -->
          <p class="text-center text-sm text-gray-500">
            {{ t('wantToGuest') }}
            <router-link 
              to="/checkout" 
              class="text-gold-600 hover:text-gold-700 font-medium"
            >
              {{ t('continueAsGuest') }}
            </router-link>
          </p>
        </form>
      </div>

      <!-- Trust Badges -->
      <div class="mt-8 text-center">
        <div class="flex items-center justify-center space-x-4 text-xs text-gray-500">
          <span>🔒 {{ t('secureLogin') }}</span>
          <span>•</span>
          <span>🛡️ {{ t('privacyProtected') }}</span>
          <span>•</span>
          <span>⚡ {{ t('fastCheckout') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'
import { showNotification } from '@/utils/notifications'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useLanguageStore()

const loading = ref(false)
const showPassword = ref(false)
const error = ref('')

const form = reactive({
  email: '',
  password: '',
  remember: false
})

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    await authStore.login({
      email: form.email,
      password: form.password,
      remember: form.remember
    })

    showNotification.success(t('loginSuccess'))
    
    // Redirect to account page or previous page
    const redirectPath = router.currentRoute.value.query.redirect as string || '/account'
    router.push(redirectPath)
  } catch (err: any) {
    console.error('Login error:', err)
    
    if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
      error.value = t('invalidCredentials')
    } else if (err.code === 'auth/too-many-requests') {
      error.value = t('tooManyAttempts')
    } else if (err.code === 'auth/user-disabled') {
      error.value = t('accountDisabled')
    } else {
      error.value = t('loginFailed')
    }
  } finally {
    loading.value = false
  }
}

const handleGoogleLogin = async () => {
  try {
    await authStore.loginWithGoogle()
    showNotification.success(t('loginSuccess'))
    router.push('/account')
  } catch (err) {
    showNotification.error(t('socialLoginFailed'))
  }
}

const handleFacebookLogin = async () => {
  try {
    await authStore.loginWithFacebook()
    showNotification.success(t('loginSuccess'))
    router.push('/account')
  } catch (err) {
    showNotification.error(t('socialLoginFailed'))
  }
}
</script>