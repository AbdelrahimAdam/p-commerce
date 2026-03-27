<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg">
      <!-- Header -->
      <div>
        <h2 class="mt-2 text-center text-3xl font-extrabold text-gray-900">
          Register your company
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Create a new tenant and become the administrator
        </p>
      </div>

      <!-- Form -->
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <!-- Company Name -->
          <div>
            <label for="company-name" class="block text-sm font-medium text-gray-700 mb-1">
              Company Name <span class="text-red-500">*</span>
            </label>
            <input
              id="company-name"
              v-model="form.companyName"
              type="text"
              required
              class="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Acme Inc."
              :disabled="isLoading"
              @input="generateSlug"
            />
          </div>

          <!-- Store Slug (URL) -->
          <div>
            <label for="store-slug" class="block text-sm font-medium text-gray-700 mb-1">
              Store URL <span class="text-red-500">*</span>
            </label>
            <div class="flex items-center">
              <span class="inline-flex items-center px-3 py-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-lg text-sm">
                /store/
              </span>
              <input
                id="store-slug"
                v-model="form.slug"
                type="text"
                required
                class="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="your-company"
                :disabled="isLoading"
              />
            </div>
            <p class="mt-1 text-xs text-gray-500">
              Your store will be accessible at: <span class="font-mono">{{ rootDomain }}/store/{{ form.slug || 'your-company' }}</span>
            </p>
          </div>

          <!-- Your Name -->
          <div>
            <label for="display-name" class="block text-sm font-medium text-gray-700 mb-1">
              Your Name <span class="text-red-500">*</span>
            </label>
            <input
              id="display-name"
              v-model="form.displayName"
              type="text"
              required
              class="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="John Doe"
              :disabled="isLoading"
            />
          </div>

          <!-- Email -->
          <div>
            <label for="email-address" class="block text-sm font-medium text-gray-700 mb-1">
              Email address <span class="text-red-500">*</span>
            </label>
            <input
              id="email-address"
              v-model="form.email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="you@example.com"
              :disabled="isLoading"
            />
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              Password <span class="text-red-500">*</span>
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              autocomplete="new-password"
              required
              minlength="6"
              class="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="••••••••"
              :disabled="isLoading"
            />
            <p class="mt-1 text-xs text-gray-500">At least 6 characters</p>
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="confirm-password" class="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password <span class="text-red-500">*</span>
            </label>
            <input
              id="confirm-password"
              v-model="form.confirmPassword"
              type="password"
              autocomplete="new-password"
              required
              class="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="••••••••"
              :disabled="isLoading"
            />
          </div>
        </div>

        <!-- Password mismatch hint -->
        <div v-if="passwordMismatch" class="text-red-500 text-sm text-center">
          Passwords do not match
        </div>

        <!-- Error message from store -->
        <div v-if="error" class="bg-red-50 text-red-700 p-3 rounded-lg text-sm text-center">
          {{ error }}
        </div>

        <!-- Submit button -->
        <div>
          <button
            type="submit"
            :disabled="isLoading || !isFormValid || passwordMismatch"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              v-if="isLoading"
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span v-if="isLoading">Registering...</span>
            <span v-else>Register Company</span>
          </button>
        </div>

        <!-- Link to login -->
        <div class="text-sm text-center">
          <router-link to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
            Already have an account? Sign in
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

// Get root domain from environment (or default for localhost)
const rootDomain = import.meta.env.VITE_ROOT_DOMAIN || 'localhost:5173';

const form = ref({
  companyName: '',
  displayName: '',
  email: '',
  slug: '',
  password: '',
  confirmPassword: ''
});

const isLoading = ref(false);
const error = ref<string | null>(null);

// Generate slug from company name
const generateSlug = () => {
  if (!form.value.companyName) return;
  
  const slug = form.value.companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  form.value.slug = slug;
};

const isFormValid = computed(() => {
  return (
    form.value.companyName.trim() !== '' &&
    form.value.displayName.trim() !== '' &&
    form.value.email.trim() !== '' &&
    form.value.slug.trim() !== '' &&
    form.value.password.length >= 6
  );
});

const passwordMismatch = computed(() => {
  return (
    form.value.password !== form.value.confirmPassword &&
    form.value.confirmPassword.length > 0
  );
});

const handleSubmit = async () => {
  if (!isFormValid.value || passwordMismatch.value) return;

  isLoading.value = true;
  error.value = null;

  try {
    // Store the email in localStorage for auto-fill on login page (fallback)
    localStorage.setItem('pending_registration_email', form.value.email);
    
    // Call the store method which should call the API and auto-login
    const result = await authStore.registerCompany({
      email: form.value.email,
      password: form.value.password,
      displayName: form.value.displayName,
      companyName: form.value.companyName,
      domain: form.value.slug
    });

    console.log('✅ Registration successful, logged in as:', result);
    
    // After successful registration and auto-login, redirect to the tenant admin dashboard
    if (result && result.slug) {
      const protocol = window.location.protocol;
      const newUrl = `${protocol}//${rootDomain}/store/${result.slug}/admin/dashboard`;
      window.location.href = newUrl;
    } else if (result && result.domain) {
      const protocol = window.location.protocol;
      const newUrl = `${protocol}//${rootDomain}/store/${form.value.slug}/admin/dashboard`;
      window.location.href = newUrl;
    } else {
      const protocol = window.location.protocol;
      const newUrl = `${protocol}//${rootDomain}/store/${form.value.slug}/admin/dashboard`;
      window.location.href = newUrl;
    }
  } catch (err: any) {
    console.error('Registration error:', err);
    error.value = err.message || 'Registration failed. Please try again.';
    // Clear the stored email if registration fails
    localStorage.removeItem('pending_registration_email');
  } finally {
    isLoading.value = false;
  }
};
</script>