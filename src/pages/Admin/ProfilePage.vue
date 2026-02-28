<!-- src/pages/Admin/ProfilePage.vue -->
<template>
  <div class="admin-profile-page">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-2xl lg:text-3xl font-display-en font-bold text-gray-900 mb-2">
        {{ safeTranslate('Profile Settings') }}
      </h1>
      <p class="text-gray-600">
        {{ safeTranslate('Manage your account settings and profile information') }}
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column: Profile Info -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Personal Information Card -->
        <div class="bg-white rounded-xl shadow-luxury-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-display-en font-bold text-gray-900">
              {{ safeTranslate('Personal Information') }}
            </h2>
            <button 
              @click="editingPersonalInfo = !editingPersonalInfo"
              class="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              {{ editingPersonalInfo ? safeTranslate('Cancel') : safeTranslate('Edit') }}
            </button>
          </div>

          <div v-if="!editingPersonalInfo" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ safeTranslate('Full Name') }}
                </label>
                <p class="text-gray-900">{{ currentUser?.displayName || 'N/A' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ safeTranslate('Email Address') }}
                </label>
                <p class="text-gray-900">{{ currentUser?.email || 'N/A' }}</p>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ safeTranslate('Role') }}
                </label>
                <p class="text-gray-900">
                  {{ currentUser?.role === 'super-admin' ? safeTranslate('Super Admin') : safeTranslate('Admin') }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ safeTranslate('Account Created') }}
                </label>
                <p class="text-gray-900">
                  {{ currentUser?.createdAt ? formatDate(currentUser.createdAt) : 'N/A' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Edit Form -->
          <form v-else @submit.prevent="savePersonalInfo" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="displayName" class="block text-sm font-medium text-gray-700 mb-1">
                  {{ safeTranslate('Full Name') }} *
                </label>
                <input
                  id="displayName"
                  v-model="formData.displayName"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                  {{ safeTranslate('Email Address') }} *
                </label>
                <input
                  id="email"
                  v-model="formData.email"
                  type="email"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
            </div>
            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                @click="editingPersonalInfo = false"
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                {{ safeTranslate('Cancel') }}
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="saving" class="flex items-center gap-2">
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ safeTranslate('Saving...') }}
                </span>
                <span v-else>
                  {{ safeTranslate('Save Changes') }}
                </span>
              </button>
            </div>
          </form>
        </div>

        <!-- Security Card -->
        <div class="bg-white rounded-xl shadow-luxury-sm border border-gray-200 p-6">
          <h2 class="text-lg font-display-en font-bold text-gray-900 mb-6">
            {{ safeTranslate('Security') }}
          </h2>

          <div class="space-y-4">
            <!-- Change Password -->
            <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 class="font-medium text-gray-900">{{ safeTranslate('Password') }}</h3>
                <p class="text-sm text-gray-600">
                  {{ safeTranslate('Change your account password') }}
                </p>
              </div>
              <button
                @click="showChangePassword = true"
                class="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
              >
                {{ safeTranslate('Change') }}
              </button>
            </div>

            <!-- Two-Factor Authentication -->
            <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 class="font-medium text-gray-900">
                  {{ safeTranslate('Two-Factor Authentication') }}
                </h3>
                <p class="text-sm text-gray-600">
                  {{ safeTranslate('Add an extra layer of security to your account') }}
                </p>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-sm text-yellow-600 font-medium">
                  {{ safeTranslate('Not set up') }}
                </span>
                <button
                  @click="showTwoFactorSetup = true"
                  class="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                >
                  {{ safeTranslate('Set up') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Profile Photo & Preferences -->
      <div class="space-y-6">
        <!-- Profile Photo Card -->
        <div class="bg-white rounded-xl shadow-luxury-sm border border-gray-200 p-6">
          <h2 class="text-lg font-display-en font-bold text-gray-900 mb-4">
            {{ safeTranslate('Profile Photo') }}
          </h2>
          
          <div class="flex flex-col items-center">
            <div class="relative mb-4">
              <div class="w-32 h-32 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-3xl font-bold">
                {{ userInitials }}
              </div>
              <button
                @click="triggerFileInput"
                class="absolute bottom-0 right-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 border-4 border-white"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </button>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleProfileImage"
              />
            </div>
            
            <p class="text-sm text-gray-600 text-center mb-4">
              {{ safeTranslate('Upload a new profile photo. JPG, PNG or GIF, max 5MB.') }}
            </p>
            
            <div v-if="uploadingImage" class="w-full">
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${uploadProgress}%` }"
                ></div>
              </div>
              <p class="text-xs text-gray-600 text-center mt-2">
                {{ safeTranslate('Uploading...') }} {{ uploadProgress }}%
              </p>
            </div>
          </div>
        </div>

        <!-- Preferences Card -->
        <div class="bg-white rounded-xl shadow-luxury-sm border border-gray-200 p-6">
          <h2 class="text-lg font-display-en font-bold text-gray-900 mb-4">
            {{ safeTranslate('Preferences') }}
          </h2>
          
          <div class="space-y-4">
            <!-- Language Preference -->
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-medium text-gray-900">{{ safeTranslate('Language') }}</h3>
                <p class="text-sm text-gray-600">
                  {{ safeTranslate('Choose your preferred language') }}
                </p>
              </div>
              <select
                v-model="preferences.language"
                @change="updateLanguage"
                class="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>

            <!-- Dark Mode -->
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-medium text-gray-900">{{ safeTranslate('Dark Mode') }}</h3>
                <p class="text-sm text-gray-600">
                  {{ safeTranslate('Switch between light and dark themes') }}
                </p>
              </div>
              <button
                @click="toggleDarkMode"
                class="relative inline-flex h-6 w-11 items-center rounded-full"
                :class="preferences.darkMode ? 'bg-primary-600' : 'bg-gray-300'"
              >
                <span class="inline-block h-4 w-4 transform rounded-full bg-white transition"
                  :class="preferences.darkMode ? 'translate-x-6' : 'translate-x-1'"
                />
              </button>
            </div>

            <!-- Email Notifications -->
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-medium text-gray-900">{{ safeTranslate('Email Notifications') }}</h3>
                <p class="text-sm text-gray-600">
                  {{ safeTranslate('Receive email updates') }}
                </p>
              </div>
              <button
                @click="preferences.emailNotifications = !preferences.emailNotifications"
                class="relative inline-flex h-6 w-11 items-center rounded-full"
                :class="preferences.emailNotifications ? 'bg-primary-600' : 'bg-gray-300'"
              >
                <span class="inline-block h-4 w-4 transform rounded-full bg-white transition"
                  :class="preferences.emailNotifications ? 'translate-x-6' : 'translate-x-1'"
                />
              </button>
            </div>
          </div>

          <div class="mt-6 pt-6 border-t border-gray-200">
            <button
              @click="savePreferences"
              :disabled="savingPreferences"
              class="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="savingPreferences" class="flex items-center justify-center gap-2">
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ safeTranslate('Saving...') }}
              </span>
              <span v-else>
                {{ safeTranslate('Save Preferences') }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <div v-if="showChangePassword" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-luxury-xl max-w-md w-full p-6">
        <h2 class="text-xl font-display-en font-bold text-gray-900 mb-4">
          {{ safeTranslate('Change Password') }}
        </h2>
        
        <form @submit.prevent="changePassword" class="space-y-4">
          <div>
            <label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-1">
              {{ safeTranslate('Current Password') }} *
            </label>
            <input
              id="currentPassword"
              v-model="passwordData.currentPassword"
              type="password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          
          <div>
            <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">
              {{ safeTranslate('New Password') }} *
            </label>
            <input
              id="newPassword"
              v-model="passwordData.newPassword"
              type="password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
            <p class="text-xs text-gray-500 mt-1">
              {{ safeTranslate('Password must be at least 8 characters long') }}
            </p>
          </div>
          
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
              {{ safeTranslate('Confirm New Password') }} *
            </label>
            <input
              id="confirmPassword"
              v-model="passwordData.confirmPassword"
              type="password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          
          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="showChangePassword = false"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              {{ safeTranslate('Cancel') }}
            </button>
            <button
              type="submit"
              :disabled="changingPassword"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="changingPassword" class="flex items-center gap-2">
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ safeTranslate('Changing...') }}
              </span>
              <span v-else>
                {{ safeTranslate('Change Password') }}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Two-Factor Setup Modal -->
    <div v-if="showTwoFactorSetup" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-luxury-xl max-w-md w-full p-6">
        <h2 class="text-xl font-display-en font-bold text-gray-900 mb-4">
          {{ safeTranslate('Set Up Two-Factor Authentication') }}
        </h2>
        
        <div class="space-y-4">
          <p class="text-gray-600">
            {{ safeTranslate('Scan the QR code with your authenticator app to set up 2FA.') }}
          </p>
          
          <div class="bg-gray-50 p-4 rounded-lg flex justify-center">
            <!-- Placeholder for QR code -->
            <div class="w-48 h-48 bg-gray-200 rounded flex items-center justify-center">
              <span class="text-gray-500">
                {{ safeTranslate('QR Code Placeholder') }}
              </span>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ safeTranslate('Verification Code') }}
            </label>
            <input
              v-model="twoFactorCode"
              type="text"
              placeholder="000000"
              maxlength="6"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-center text-xl tracking-widest"
            />
            <p class="text-xs text-gray-500 mt-1">
              {{ safeTranslate('Enter the 6-digit code from your authenticator app') }}
            </p>
          </div>
          
          <div class="flex justify-end gap-3 pt-4">
            <button
              @click="showTwoFactorSetup = false"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              {{ safeTranslate('Cancel') }}
            </button>
            <button
              @click="enableTwoFactor"
              :disabled="!twoFactorCode || twoFactorCode.length !== 6"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ safeTranslate('Enable 2FA') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'

const authStore = useAuthStore()
const languageStore = useLanguageStore()

// User data
const currentUser = computed(() => authStore.user)
const userInitials = computed(() => {
  if (!currentUser.value?.displayName) return 'AD'
  return currentUser.value.displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

// State
const editingPersonalInfo = ref(false)
const saving = ref(false)
const showChangePassword = ref(false)
const showTwoFactorSetup = ref(false)
const changingPassword = ref(false)
const uploadingImage = ref(false)
const uploadProgress = ref(0)
const savingPreferences = ref(false)
const twoFactorCode = ref('')

// Form data
const formData = ref({
  displayName: currentUser.value?.displayName || '',
  email: currentUser.value?.email || ''
})

const passwordData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const preferences = ref({
  language: languageStore.currentLanguage || 'en',
  darkMode: localStorage.getItem('admin_dark_mode') === 'true',
  emailNotifications: true
})

const fileInput = ref<HTMLInputElement>()

// Translations with fallbacks
const appTranslations = {
  'Profile Settings': { en: 'Profile Settings', ar: 'إعدادات الملف الشخصي' },
  'Manage your account settings and profile information': { en: 'Manage your account settings and profile information', ar: 'إدارة إعدادات حسابك ومعلومات الملف الشخصي' },
  'Personal Information': { en: 'Personal Information', ar: 'المعلومات الشخصية' },
  'Edit': { en: 'Edit', ar: 'تعديل' },
  'Cancel': { en: 'Cancel', ar: 'إلغاء' },
  'Full Name': { en: 'Full Name', ar: 'الاسم الكامل' },
  'Email Address': { en: 'Email Address', ar: 'البريد الإلكتروني' },
  'Role': { en: 'Role', ar: 'الدور' },
  'Account Created': { en: 'Account Created', ar: 'تاريخ إنشاء الحساب' },
  'Saving...': { en: 'Saving...', ar: 'جاري الحفظ...' },
  'Save Changes': { en: 'Save Changes', ar: 'حفظ التغييرات' },
  'Security': { en: 'Security', ar: 'الأمان' },
  'Password': { en: 'Password', ar: 'كلمة المرور' },
  'Change your account password': { en: 'Change your account password', ar: 'تغيير كلمة مرور حسابك' },
  'Change': { en: 'Change', ar: 'تغيير' },
  'Two-Factor Authentication': { en: 'Two-Factor Authentication', ar: 'المصادقة الثنائية' },
  'Add an extra layer of security to your account': { en: 'Add an extra layer of security to your account', ar: 'أضف طبقة أمان إضافية لحسابك' },
  'Not set up': { en: 'Not set up', ar: 'غير مفعل' },
  'Set up': { en: 'Set up', ar: 'تفعيل' },
  'Profile Photo': { en: 'Profile Photo', ar: 'صورة الملف الشخصي' },
  'Upload a new profile photo. JPG, PNG or GIF, max 5MB.': { en: 'Upload a new profile photo. JPG, PNG or GIF, max 5MB.', ar: 'قم بتحميل صورة شخصية جديدة. JPG أو PNG أو GIF، الحد الأقصى 5 ميجابايت.' },
  'Uploading...': { en: 'Uploading...', ar: 'جاري التحميل...' },
  'Preferences': { en: 'Preferences', ar: 'التفضيلات' },
  'Language': { en: 'Language', ar: 'اللغة' },
  'Choose your preferred language': { en: 'Choose your preferred language', ar: 'اختر لغتك المفضلة' },
  'Dark Mode': { en: 'Dark Mode', ar: 'الوضع الداكن' },
  'Switch between light and dark themes': { en: 'Switch between light and dark themes', ar: 'تبديل بين السمات الفاتحة والداكنة' },
  'Email Notifications': { en: 'Email Notifications', ar: 'إشعارات البريد الإلكتروني' },
  'Receive email updates': { en: 'Receive email updates', ar: 'تلقي تحديثات البريد الإلكتروني' },
  'Save Preferences': { en: 'Save Preferences', ar: 'حفظ التفضيلات' },
  'Change Password': { en: 'Change Password', ar: 'تغيير كلمة المرور' },
  'Current Password': { en: 'Current Password', ar: 'كلمة المرور الحالية' },
  'New Password': { en: 'New Password', ar: 'كلمة المرور الجديدة' },
  'Password must be at least 8 characters long': { en: 'Password must be at least 8 characters long', ar: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل' },
  'Confirm New Password': { en: 'Confirm New Password', ar: 'تأكيد كلمة المرور الجديدة' },
  'Changing...': { en: 'Changing...', ar: 'جاري التغيير...' },
  'Set Up Two-Factor Authentication': { en: 'Set Up Two-Factor Authentication', ar: 'إعداد المصادقة الثنائية' },
  'Scan the QR code with your authenticator app to set up 2FA.': { en: 'Scan the QR code with your authenticator app to set up 2FA.', ar: 'امسح رمز QR باستخدام تطبيق المصادقة لإعداد 2FA.' },
  'QR Code Placeholder': { en: 'QR Code Placeholder', ar: 'رمز QR' },
  'Verification Code': { en: 'Verification Code', ar: 'رمز التحقق' },
  'Enter the 6-digit code from your authenticator app': { en: 'Enter the 6-digit code from your authenticator app', ar: 'أدخل الرمز المكون من 6 أرقام من تطبيق المصادقة الخاص بك' },
  'Enable 2FA': { en: 'Enable 2FA', ar: 'تفعيل 2FA' }
}

// Safe translate function
const safeTranslate = (key: string) => {
  const translations = appTranslations[key as keyof typeof appTranslations]
  if (!translations) return key
  const lang = languageStore.currentLanguage as 'en' | 'ar'
  return translations[lang] || translations.en || key
}

// Methods
const formatDate = (date: string | Date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const savePersonalInfo = async () => {
  if (!formData.value.displayName.trim() || !formData.value.email.trim()) {
    showNotification('error', safeTranslate('Please fill in all required fields'))
    return
  }

  saving.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Update user data
    if (currentUser.value) {
      currentUser.value.displayName = formData.value.displayName
      currentUser.value.email = formData.value.email
    }
    
    showNotification('success', safeTranslate('Personal information updated successfully'))
    editingPersonalInfo.value = false
  } catch (error) {
    console.error('Error updating personal info:', error)
    showNotification('error', safeTranslate('Failed to update personal information'))
  } finally {
    saving.value = false
  }
}

const changePassword = async () => {
  if (!passwordData.value.currentPassword || !passwordData.value.newPassword || !passwordData.value.confirmPassword) {
    showNotification('error', safeTranslate('Please fill in all password fields'))
    return
  }

  if (passwordData.value.newPassword.length < 8) {
    showNotification('error', safeTranslate('New password must be at least 8 characters long'))
    return
  }

  if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
    showNotification('error', safeTranslate('New passwords do not match'))
    return
  }

  changingPassword.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Clear password fields
    passwordData.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    
    showNotification('success', safeTranslate('Password changed successfully'))
    showChangePassword.value = false
  } catch (error) {
    console.error('Error changing password:', error)
    showNotification('error', safeTranslate('Failed to change password'))
  } finally {
    changingPassword.value = false
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleProfileImage = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return

  const file = input.files[0]
  
  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!validTypes.includes(file.type)) {
    showNotification('error', safeTranslate('Please upload a valid image file (JPG, PNG, GIF)'))
    return
  }

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    showNotification('error', safeTranslate('Image size must be less than 5MB'))
    return
  }

  uploadingImage.value = true
  uploadProgress.value = 0

  // Simulate upload progress
  const interval = setInterval(() => {
    uploadProgress.value += 10
    if (uploadProgress.value >= 100) {
      clearInterval(interval)
      
      // Simulate API call completion
      setTimeout(() => {
        uploadingImage.value = false
        uploadProgress.value = 0
        showNotification('success', safeTranslate('Profile image updated successfully'))
        input.value = '' // Clear the file input
      }, 500)
    }
  }, 200)
}

const toggleDarkMode = () => {
  preferences.value.darkMode = !preferences.value.darkMode
  localStorage.setItem('admin_dark_mode', preferences.value.darkMode.toString())
  
  if (preferences.value.darkMode) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const updateLanguage = () => {
  languageStore.setLanguage(preferences.value.language)
}

const savePreferences = async () => {
  savingPreferences.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Save preferences to localStorage
    localStorage.setItem('admin_preferences', JSON.stringify(preferences.value))
    
    showNotification('success', safeTranslate('Preferences saved successfully'))
  } catch (error) {
    console.error('Error saving preferences:', error)
    showNotification('error', safeTranslate('Failed to save preferences'))
  } finally {
    savingPreferences.value = false
  }
}

const enableTwoFactor = async () => {
  if (!twoFactorCode.value || twoFactorCode.value.length !== 6) {
    showNotification('error', safeTranslate('Please enter a valid 6-digit code'))
    return
  }

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    showNotification('success', safeTranslate('Two-factor authentication enabled successfully'))
    showTwoFactorSetup.value = false
    twoFactorCode.value = ''
  } catch (error) {
    console.error('Error enabling 2FA:', error)
    showNotification('error', safeTranslate('Failed to enable two-factor authentication'))
  }
}

const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
  window.dispatchEvent(new CustomEvent('luxury-notification', {
    detail: {
      type,
      title: type === 'success' ? safeTranslate('Success') : 
             type === 'error' ? safeTranslate('Error') : 
             type === 'warning' ? safeTranslate('Warning') : safeTranslate('Info'),
      message,
      duration: 3000
    }
  }))
}

// Initialize
onMounted(() => {
  // Load saved preferences
  const savedPreferences = localStorage.getItem('admin_preferences')
  if (savedPreferences) {
    try {
      preferences.value = { ...preferences.value, ...JSON.parse(savedPreferences) }
    } catch (error) {
      console.error('Error loading preferences:', error)
    }
  }
})
</script>

<style scoped>
.admin-profile-page {
  min-height: calc(100vh - 12rem);
}

/* Form input focus styles */
input:focus, select:focus {
  outline: none;
  ring-width: 2px;
}

/* Smooth transitions */
button, .rounded-full {
  transition: all 0.2s ease-in-out;
}

/* Notification styles */
@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .admin-profile-page :deep(.bg-white) {
    background-color: #1e293b !important;
  }
  
  .admin-profile-page :deep(.text-gray-900) {
    color: #f1f5f9 !important;
  }
  
  .admin-profile-page :deep(.text-gray-700) {
    color: #cbd5e1 !important;
  }
  
  .admin-profile-page :deep(.text-gray-600) {
    color: #94a3b8 !important;
  }
  
  .admin-profile-page :deep(.border-gray-200) {
    border-color: #334155 !important;
  }
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .admin-profile-page {
    padding: 1rem;
  }
  
  .grid {
    gap: 1rem;
  }
  
  .p-6 {
    padding: 1rem;
  }
}

/* Print styles */
@media print {
  .admin-profile-page {
    padding: 0;
  }
  
  button, .modal, .file-upload {
    display: none !important;
  }
}
</style>