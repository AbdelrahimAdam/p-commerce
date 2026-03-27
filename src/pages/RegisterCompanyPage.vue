<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg">
      <div class="text-center">
        <h2 class="mt-2 text-center text-3xl font-extrabold text-gray-900">
          Register your company
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Create a new tenant and become the administrator
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <!-- Company Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Company Name *
            </label>
            <input
              v-model="form.companyName"
              type="text"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Acme Inc."
              :disabled="isLoading"
              @input="generateSlug"
            />
          </div>

          <!-- Store URL Preview -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Store URL
            </label>
            <div class="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
              {{ rootDomain }}/store/{{ form.slug || 'your-company' }}
            </div>
          </div>

          <!-- Your Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Your Name *
            </label>
            <input
              v-model="form.displayName"
              type="text"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="John Doe"
              :disabled="isLoading"
            />
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Email address *
            </label>
            <input
              v-model="form.email"
              type="email"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="you@example.com"
              :disabled="isLoading"
            />
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <input
              v-model="form.password"
              type="password"
              required
              minlength="6"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
              :disabled="isLoading"
            />
            <p class="mt-1 text-xs text-gray-500">At least 6 characters</p>
          </div>

          <!-- Confirm Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password *
            </label>
            <input
              v-model="form.confirmPassword"
              type="password"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
              :disabled="isLoading"
            />
          </div>
        </div>

        <div v-if="passwordMismatch" class="text-red-500 text-sm text-center">
          Passwords do not match
        </div>

        <div v-if="error" class="bg-red-50 text-red-700 p-3 rounded-lg text-sm text-center">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="isLoading || !isFormValid || passwordMismatch"
          class="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          <span v-if="!isLoading">Register Company</span>
          <span v-else>Registering...</span>
        </button>
      </form>

      <div class="text-sm text-center">
        <router-link to="/login" class="text-indigo-600 hover:text-indigo-500">
          Already have an account? Sign in
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { supabaseSafe } from '@/supabase/client'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const rootDomain = import.meta.env.VITE_ROOT_DOMAIN || 'localhost:5173'

const form = ref({
  companyName: '',
  displayName: '',
  email: '',
  slug: '',
  password: '',
  confirmPassword: ''
})

const isLoading = ref(false)
const error = ref<string | null>(null)

const generateSlug = () => {
  if (!form.value.companyName) return
  form.value.slug = form.value.companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const isFormValid = computed(() => {
  return form.value.companyName.trim() !== '' &&
         form.value.displayName.trim() !== '' &&
         form.value.email.trim() !== '' &&
         form.value.slug.trim() !== '' &&
         form.value.password.length >= 6
})

const passwordMismatch = computed(() => {
  return form.value.password !== form.value.confirmPassword &&
         form.value.confirmPassword.length > 0
})

const handleSubmit = async () => {
  if (!isFormValid.value || passwordMismatch.value) return

  isLoading.value = true
  error.value = null

  try {
    console.log('🚀 Starting registration with trigger...')
    
    // Sign up with Supabase - the database trigger will handle tenant and admin creation
    const supabase = supabaseSafe.client
    const { error: signUpError } = await supabase.auth.signUp({
      email: form.value.email,
      password: form.value.password,
      options: {
        data: {
          displayName: form.value.displayName,
          companyName: form.value.companyName,
          slug: form.value.slug,
          role: 'admin'
        }
      }
    })

    if (signUpError) {
      console.error('Sign up error:', signUpError)
      throw signUpError
    }
    
    console.log('✅ User created, waiting for database trigger...')
    
    // Wait 3 seconds for the trigger to run
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Now sign in
    console.log('🔐 Signing in...')
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: form.value.email,
      password: form.value.password
    })
    
    if (signInError) {
      console.error('Sign in error:', signInError)
      throw signInError
    }
    
    console.log('✅ Logged in, user ID:', signInData.user?.id)
    
    // Wait a bit more for the trigger to complete
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Fetch the admin that was created by the trigger
    const admin = await authStore.getAdminFromSupabase(signInData.user.id)
    
    if (admin) {
      console.log('✅ Admin found, setting user...')
      authStore.setAdminUser(admin)
      console.log('✅ Redirecting to dashboard...')
      
      // Redirect to admin dashboard
      const newUrl = `${window.location.protocol}//${rootDomain}/store/${form.value.slug}/admin/dashboard`
      window.location.href = newUrl
    } else {
      console.warn('⚠️ Admin not found after trigger, redirecting to login')
      // If admin not found, redirect to login with tenant slug
      const newUrl = `${window.location.protocol}//${rootDomain}/login?tenant=${form.value.slug}&redirect=/store/${form.value.slug}/admin/dashboard`
      window.location.href = newUrl
    }
    
  } catch (err: any) {
    console.error('❌ Registration error:', err)
    error.value = err.message || 'Registration failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>