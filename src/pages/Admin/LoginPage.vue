<!-- src/pages/Admin/LoginPage.vue -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
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
                :disabled="loading"
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
                :disabled="loading"
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

          <!-- Info Message (from registration) -->
          <div v-if="infoMessage" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-sm text-blue-700">{{ infoMessage }}</p>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-sm text-red-700">{{ error }}</p>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-xl font-bold shadow-gold-lg hover:shadow-gold-xl transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!loading">{{ t('signIn') }}</span>
            <span v-else class="flex items-center justify-center gap-2">
              <svg class="animate-spin w-5 h-5" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              {{ t('signingIn') }}...
            </span>
          </button>

          <!-- Divider -->
          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">{{ t('newToStore') }}</span>
            </div>
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

          <!-- Admin Note (small text at bottom) -->
          <div class="text-center pt-4 border-t border-gray-100">
            <p class="text-xs text-gray-400">
              {{ t('adminAccess') }} 
              <router-link to="/admin/login" class="text-gold-500 hover:text-gold-600">
                {{ t('clickHere') }}
              </router-link>
            </p>
          </div>
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useLanguageStore } from '@/stores/language'
import { useAuthStore } from '@/stores/auth'
import { supabaseSafe } from '@/supabase/client'

const router = useRouter()
const route = useRoute()
const languageStore = useLanguageStore()
const authStore = useAuthStore()

const { t } = languageStore

const loading = ref(false)
const showPassword = ref(false)
const error = ref('')
const infoMessage = ref('')
const tenantSlug = ref<string | null>(null)
const redirectPath = ref<string | null>(null)
const pendingEmail = ref<string | null>(null)

const form = reactive({
  email: '',
  password: '',
  remember: true // Default to true for better UX
})

// Helper to wait with exponential backoff
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Helper to fetch admin with retry
const fetchAdminWithRetry = async (userId: string, maxRetries: number = 15, initialDelay: number = 500): Promise<any> => {
  let delay = initialDelay
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`  Attempt ${attempt}/${maxRetries}: Fetching admin...`)
      
      // Use the auth store's getAdminFromSupabase method (which is internal)
      // We need to call it through the store
      const admin = await (authStore as any).getAdminFromSupabase(userId)
      
      if (admin) {
        console.log(`  ✅ Admin found on attempt ${attempt}!`)
        return admin
      }
      
      console.log(`  Admin not found on attempt ${attempt}`)
      
      if (attempt < maxRetries) {
        console.log(`  Waiting ${delay}ms before next attempt...`)
        await wait(delay)
        delay = Math.min(delay * 1.5, 10000) // Exponential backoff, max 10 seconds
      }
    } catch (err) {
      console.error(`Unexpected error on attempt ${attempt}:`, err)
      if (attempt < maxRetries) {
        await wait(delay)
        delay = Math.min(delay * 1.5, 10000)
      }
    }
  }
  
  console.error('Admin not found after', maxRetries, 'attempts')
  return null
}

// Capture tenant and redirect from URL on mount
onMounted(() => {
  // Get tenant slug from query parameters
  tenantSlug.value = route.query.tenant as string || null
  redirectPath.value = route.query.redirect as string || null
  
  // Get email from registration if stored
  pendingEmail.value = localStorage.getItem('pending_registration_email')
  
  // If there's a pending email from registration, auto-fill it
  if (pendingEmail.value) {
    form.email = pendingEmail.value
    infoMessage.value = t('pleaseLoginToCompleteRegistration')
    
    // Auto-focus password field
    setTimeout(() => {
      const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement
      if (passwordInput) passwordInput.focus()
    }, 100)
  }
  
  // Store tenant slug for later use after login
  if (tenantSlug.value) {
    localStorage.setItem('pending_tenant_slug', tenantSlug.value)
    console.log('📁 Tenant slug stored:', tenantSlug.value)
  }
  
  // Store redirect path
  if (redirectPath.value) {
    localStorage.setItem('pending_redirect', redirectPath.value)
    console.log('🔀 Redirect path stored:', redirectPath.value)
  }
  
  // Check if there's a stored email (for remember me)
  const savedEmail = localStorage.getItem('saved_email')
  if (savedEmail && !form.email) {
    form.email = savedEmail
  }
})

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  infoMessage.value = ''

  try {
    console.log('🔐 Attempting login for:', form.email)
    
    // First, authenticate with Supabase
    const supabase = supabaseSafe.client
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password
    })
    
    if (signInError || !signInData.user) {
      throw new Error(signInError?.message || 'Invalid credentials')
    }
    
    const userId = signInData.user.id
    console.log('✅ Authenticated, user ID:', userId)
    
    // Wait a moment for the session to be available
    await wait(2000)
    
    // Now fetch the admin with retry
    console.log('🔍 Fetching admin profile with retry...')
    const admin = await fetchAdminWithRetry(userId, 15, 500)
    
    if (!admin) {
      throw new Error('User profile not found. Please wait a moment and try again.')
    }
    
    console.log('✅ Admin found:', admin.email)
    
    // Set the admin user in the store using the public setAdminUser method
    authStore.setAdminUser(admin)
    
    // Save email if remember me is checked
    if (form.remember) {
      localStorage.setItem('saved_email', form.email)
    } else {
      localStorage.removeItem('saved_email')
    }
    
    // Clear pending registration email
    localStorage.removeItem('pending_registration_email')
    
    // Check if there's a pending tenant redirect from registration
    const pendingRedirect = localStorage.getItem('pending_redirect')
    const pendingTenant = localStorage.getItem('pending_tenant_slug')
    
    if (pendingRedirect && pendingTenant) {
      console.log('🔄 Found pending redirect to:', pendingRedirect)
      // Clear stored values
      localStorage.removeItem('pending_redirect')
      localStorage.removeItem('pending_tenant_slug')
      
      // Wait a moment to ensure auth state is fully synced
      await wait(1000)
      
      // Redirect to the tenant dashboard
      window.location.href = pendingRedirect
      return
    }
    
    // Redirect based on role (if no pending redirect)
    if (admin.role === 'admin' || admin.role === 'super-admin') {
      router.push('/admin')
    } else {
      const redirect = route.query.redirect as string || '/account'
      router.push(redirect)
    }
  } catch (err: any) {
    console.error('Login error:', err)
    error.value = err.message || t('loginFailed')
  } finally {
    loading.value = false
  }
}
</script>