<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-display-en font-bold text-gray-900">
              {{ t('Settings') }}
            </h1>
            <p class="text-gray-600 mt-1">
              {{ t('Manage your store settings and preferences') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="p-8">
      <div class="max-w-6xl mx-auto">
        <!-- Settings Tabs -->
        <div class="mb-8">
          <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                :class="[
                  'py-4 px-1 border-b-2 font-medium text-sm',
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]"
              >
                {{ t(tab.name) }}
              </button>
            </nav>
          </div>
        </div>

        <!-- General Settings -->
        <div v-if="activeTab === 'general'" class="bg-white rounded-xl shadow-luxury p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">
            {{ t('General Settings') }}
          </h3>
          
          <div class="space-y-6">
            <!-- Store Name -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('Store Name (English)') }} *
                </label>
                <input
                  v-model="settings.storeName.en"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  :placeholder="t('Luxury Perfume Store')"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('Store Name (Arabic)') }} *
                </label>
                <input
                  v-model="settings.storeName.ar"
                  type="text"
                  dir="rtl"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-right"
                  :placeholder="t('متجر العطور الفاخرة')"
                />
              </div>
            </div>

            <!-- Contact Information -->
            <div>
              <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                {{ t('Contact Information') }}
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ t('Email Address') }}
                  </label>
                  <input
                    v-model="settings.contact.email"
                    type="email"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    :placeholder="t('contact@example.com')"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ t('Phone Number') }}
                  </label>
                  <input
                    v-model="settings.contact.phone"
                    type="tel"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    :placeholder="t('+1234567890')"
                  />
                </div>
              </div>
            </div>

            <!-- Store Address -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('Store Address') }}
              </label>
              <textarea
                v-model="settings.contact.address"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                :placeholder="t('Enter store address')"
              />
            </div>

            <!-- Store Status -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-4">
                {{ t('Store Status') }}
              </label>
              <div class="flex items-center space-x-6">
                <label class="inline-flex items-center">
                  <input
                    v-model="settings.isStoreOpen"
                    type="radio"
                    :value="true"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span class="ml-2 text-sm text-gray-700">{{ t('Open') }}</span>
                </label>
                <label class="inline-flex items-center">
                  <input
                    v-model="settings.isStoreOpen"
                    type="radio"
                    :value="false"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span class="ml-2 text-sm text-gray-700">{{ t('Closed') }}</span>
                </label>
              </div>
              <p class="mt-2 text-sm text-gray-500">
                {{ t('When closed, customers cannot place orders') }}
              </p>
            </div>
          </div>
        </div>

        <!-- Currency & Payments -->
        <div v-else-if="activeTab === 'currency'" class="bg-white rounded-xl shadow-luxury p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">
            {{ t('Currency & Payments') }}
          </h3>
          
          <div class="space-y-6">
            <!-- Currency Settings -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('Currency Code') }} *
                </label>
                <select
                  v-model="settings.currency.code"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="EGP">EGP - Egyptian Pound</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="AED">AED - UAE Dirham</option>
                  <option value="SAR">SAR - Saudi Riyal</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('Currency Symbol') }} *
                </label>
                <input
                  v-model="settings.currency.symbol"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  :placeholder="t('$')"
                />
              </div>
            </div>

            <!-- Payment Methods -->
            <div>
              <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                {{ t('Payment Methods') }}
              </h4>
              <div class="space-y-3">
                <div class="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span class="text-blue-600 font-bold text-sm">$</span>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ t('Cash on Delivery') }}</p>
                      <p class="text-xs text-gray-500">{{ t('Pay when you receive the order') }}</p>
                    </div>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      v-model="settings.paymentMethods.cod"
                      type="checkbox"
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div class="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ t('Credit/Debit Card') }}</p>
                      <p class="text-xs text-gray-500">{{ t('Secure online payment') }}</p>
                    </div>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      v-model="settings.paymentMethods.card"
                      type="checkbox"
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div class="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <svg class="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ t('PayPal') }}</p>
                      <p class="text-xs text-gray-500">{{ t('Pay with PayPal account') }}</p>
                    </div>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      v-model="settings.paymentMethods.paypal"
                      type="checkbox"
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <!-- Tax Settings -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('Tax Rate') }} (%)
              </label>
              <div class="flex items-center gap-3">
                <input
                  v-model.number="settings.taxRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  class="w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                <span class="text-sm text-gray-500">%</span>
              </div>
              <p class="mt-2 text-sm text-gray-500">
                {{ t('Tax will be automatically calculated on orders') }}
              </p>
            </div>
          </div>
        </div>

        <!-- Shipping -->
        <div v-else-if="activeTab === 'shipping'" class="bg-white rounded-xl shadow-luxury p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">
            {{ t('Shipping Settings') }}
          </h3>
          
          <div class="space-y-6">
            <!-- Shipping Methods -->
            <div class="space-y-4">
              <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ t('Standard Shipping') }}</p>
                    <p class="text-xs text-gray-500">{{ t('3-7 business days') }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm font-bold text-gray-900">{{ formatCurrency(settings.shipping.standard) }}</p>
                </div>
              </div>

              <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ t('Express Shipping') }}</p>
                    <p class="text-xs text-gray-500">{{ t('1-3 business days') }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm font-bold text-gray-900">{{ formatCurrency(settings.shipping.express) }}</p>
                </div>
              </div>
            </div>

            <!-- Free Shipping Threshold -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('Free Shipping Threshold') }}
              </label>
              <div class="flex items-center gap-3">
                <div class="relative flex-1">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="text-gray-500 sm:text-sm">{{ settings.currency.symbol }}</span>
                  </div>
                  <input
                    v-model.number="settings.freeShippingThreshold"
                    type="number"
                    min="0"
                    step="1"
                    class="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>
              <p class="mt-2 text-sm text-gray-500">
                {{ t('Orders above this amount qualify for free shipping') }}
              </p>
            </div>

            <!-- Shipping Regions -->
            <div>
              <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                {{ t('Shipping Regions') }}
              </h4>
              <div class="space-y-3">
                <div v-for="region in settings.shippingRegions" :key="region.id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ region.name }}</p>
                    <p class="text-xs text-gray-500">{{ region.description }}</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      v-model="region.enabled"
                      type="checkbox"
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Notifications -->
        <div v-else-if="activeTab === 'notifications'" class="bg-white rounded-xl shadow-luxury p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">
            {{ t('Notification Settings') }}
          </h3>
          
          <div class="space-y-6">
            <!-- Email Notifications -->
            <div>
              <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                {{ t('Email Notifications') }}
              </h4>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ t('New Order Notifications') }}</p>
                    <p class="text-xs text-gray-500">{{ t('Receive email when new order is placed') }}</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      v-model="settings.notifications.newOrders"
                      type="checkbox"
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ t('Low Stock Alerts') }}</p>
                    <p class="text-xs text-gray-500">{{ t('Receive email when stock is low') }}</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      v-model="settings.notifications.lowStock"
                      type="checkbox"
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ t('Customer Reviews') }}</p>
                    <p class="text-xs text-gray-500">{{ t('Receive email when new review is posted') }}</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      v-model="settings.notifications.newReviews"
                      type="checkbox"
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <!-- Notification Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('Notification Email Address') }}
              </label>
              <input
                v-model="settings.notificationEmail"
                type="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                :placeholder="t('notifications@example.com')"
              />
              <p class="mt-2 text-sm text-gray-500">
                {{ t('All notifications will be sent to this email') }}
              </p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-8 flex justify-end gap-3">
          <button
            @click="resetSettings"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            {{ t('Reset') }}
          </button>
          <button
            @click="saveSettings"
            :disabled="saving"
            class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="saving" class="flex items-center gap-2">
              <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ t('Saving...') }}
            </span>
            <span v-else>{{ t('Save Settings') }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useLanguageStore } from '@/stores/language'
// Removed unused authStore import

const languageStore = useLanguageStore()
// Removed unused isSuperAdmin computed

const { t } = languageStore

// State
const activeTab = ref('general')
const saving = ref(false)

// Settings Data
const settings = reactive({
  // General
  storeName: {
    en: 'Luxury Perfume Store',
    ar: 'متجر العطور الفاخرة'
  },
  contact: {
    email: 'contact@luxuryperfumes.com',
    phone: '+1234567890',
    address: '123 Luxury Street, Perfume District, Cairo, Egypt'
  },
  isStoreOpen: true,
  
  // Currency & Payments
  currency: {
    code: 'EGP',
    symbol: 'EGP'
  },
  paymentMethods: {
    cod: true,
    card: true,
    paypal: false
  },
  taxRate: 14,
  
  // Shipping
  shipping: {
    standard: 50,
    express: 100
  },
  freeShippingThreshold: 2000,
  shippingRegions: [
    { id: 'cairo', name: t('Cairo'), description: t('Greater Cairo area'), enabled: true },
    { id: 'alex', name: t('Alexandria'), description: t('Alexandria governorate'), enabled: true },
    { id: 'giza', name: t('Giza'), description: t('Giza governorate'), enabled: true },
    { id: 'other', name: t('Other Cities'), description: t('All other Egyptian cities'), enabled: true }
  ],
  
  // Notifications
  notifications: {
    newOrders: true,
    lowStock: true,
    newReviews: true
  },
  notificationEmail: 'admin@luxuryperfumes.com'
})

// Tabs
const tabs = [
  { id: 'general', name: 'General' },
  { id: 'currency', name: 'Currency & Payments' },
  { id: 'shipping', name: 'Shipping' },
  { id: 'notifications', name: 'Notifications' }
]

// Methods
const formatCurrency = (amount: number) => {
  return `${settings.currency.symbol}${amount.toFixed(2)}`
}

const resetSettings = () => {
  if (confirm(t('Are you sure you want to reset all settings to default?'))) {
    Object.assign(settings, {
      storeName: {
        en: 'Luxury Perfume Store',
        ar: 'متجر العطور الفاخرة'
      },
      contact: {
        email: 'contact@luxuryperfumes.com',
        phone: '+1234567890',
        address: '123 Luxury Street, Perfume District, Cairo, Egypt'
      },
      isStoreOpen: true,
      currency: {
        code: 'EGP',
        symbol: 'EGP'
      },
      paymentMethods: {
        cod: true,
        card: true,
        paypal: false
      },
      taxRate: 14,
      shipping: {
        standard: 50,
        express: 100
      },
      freeShippingThreshold: 2000,
      shippingRegions: [
        { id: 'cairo', name: t('Cairo'), description: t('Greater Cairo area'), enabled: true },
        { id: 'alex', name: t('Alexandria'), description: t('Alexandria governorate'), enabled: true },
        { id: 'giza', name: t('Giza'), description: t('Giza governorate'), enabled: true },
        { id: 'other', name: t('Other Cities'), description: t('All other Egyptian cities'), enabled: true }
      ],
      notifications: {
        newOrders: true,
        lowStock: true,
        newReviews: true
      },
      notificationEmail: 'admin@luxuryperfumes.com'
    })
  }
}

const saveSettings = async () => {
  saving.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // In production, save to Firebase
    // await saveSettingsToFirebase(settings)
    
    alert(t('Settings saved successfully!'))
  } catch (err) {
    console.error('Error saving settings:', err)
    alert(t('Failed to save settings. Please try again.'))
  } finally {
    saving.value = false
  }
}

// Load settings on mount
onMounted(async () => {
  // Load settings from Firebase in production
  // const savedSettings = await loadSettingsFromFirebase()
  // if (savedSettings) {
  //   Object.assign(settings, savedSettings)
  // }
})
</script>

<style scoped>
.shadow-luxury {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.transition-colors {
  transition: all 0.2s ease-in-out;
}
</style>