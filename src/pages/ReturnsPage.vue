<!-- src/pages/ReturnsPage.vue -->
<template>
  <div class="returns-page min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-gradient-to-r from-primary-900 to-primary-700 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto text-center">
        <h1 class="text-3xl sm:text-4xl font-bold font-['Cormorant_Garamond'] mb-4">
          {{ t('Returns & Refunds') }}
        </h1>
        <p class="text-lg text-primary-100 max-w-2xl mx-auto">
          {{ t('Hassle-free returns within 14 days of delivery') }}
        </p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Return Policy Overview -->
      <div class="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div class="p-6 sm:p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">{{ t('Return Policy') }}</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="text-center p-4">
              <div class="w-16 h-16 mx-auto bg-gold-100 rounded-full flex items-center justify-center mb-4">
                <svg class="w-8 h-8 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                </svg>
              </div>
              <h3 class="font-semibold text-gray-900 mb-2">{{ t('14 Days Return') }}</h3>
              <p class="text-sm text-gray-600">{{ t('Return within 14 days of delivery') }}</p>
            </div>

            <div class="text-center p-4">
              <div class="w-16 h-16 mx-auto bg-gold-100 rounded-full flex items-center justify-center mb-4">
                <svg class="w-8 h-8 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <h3 class="font-semibold text-gray-900 mb-2">{{ t('Full Refund') }}</h3>
              <p class="text-sm text-gray-600">{{ t('Money back guarantee on returns') }}</p>
            </div>

            <div class="text-center p-4">
              <div class="w-16 h-16 mx-auto bg-gold-100 rounded-full flex items-center justify-center mb-4">
                <svg class="w-8 h-8 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 class="font-semibold text-gray-900 mb-2">{{ t('Easy Process') }}</h3>
              <p class="text-sm text-gray-600">{{ t('Simple online return request') }}</p>
            </div>
          </div>

          <div class="prose max-w-none">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">{{ t('Conditions for Returns') }}</h3>
            <ul class="list-disc pl-5 space-y-2 text-gray-600 mb-6">
              <li>{{ t('Items must be unused and in original packaging') }}</li>
              <li>{{ t('Return request must be initiated within 14 days of delivery') }}</li>
              <li>{{ t('Original receipt or proof of purchase is required') }}</li>
              <li>{{ t('Items must be in resalable condition with all tags attached') }}</li>
              <li>{{ t('Fragrance testers cannot be returned due to hygiene reasons') }}</li>
            </ul>

            <h3 class="text-lg font-semibold text-gray-900 mb-3">{{ t('Non-Returnable Items') }}</h3>
            <ul class="list-disc pl-5 space-y-2 text-gray-600 mb-6">
              <li>{{ t('Opened or used fragrances') }}</li>
              <li>{{ t('Gift cards and vouchers') }}</li>
              <li>{{ t('Sale items (unless faulty)') }}</li>
              <li>{{ t('Personalized or engraved items') }}</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Return Request Form -->
      <div class="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div class="p-6 sm:p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">{{ t('Request a Return') }}</h2>
          
          <form @submit.prevent="submitReturnRequest" class="space-y-6">
            <!-- Order Number -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('Order Number') }} *
              </label>
              <input
                v-model="form.orderNumber"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                :placeholder="t('e.g., ORD-240215-1234')"
              />
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('Email Address') }} *
              </label>
              <input
                v-model="form.email"
                type="email"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                :placeholder="t('Enter your email')"
              />
            </div>

            <!-- Item Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('Select Item to Return') }} *
              </label>
              <select
                v-model="form.itemId"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white"
              >
                <option value="">{{ t('Select an item') }}</option>
                <option v-for="item in mockOrderItems" :key="item.id" :value="item.id">
                  {{ item.name }} - {{ item.size }} ({{ formatCurrency(item.price) }} EGP)
                </option>
              </select>
              <p v-if="!mockOrderItems.length" class="mt-2 text-sm text-gray-500">
                {{ t('Please enter a valid order number to load items') }}
              </p>
            </div>

            <!-- Return Reason -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('Reason for Return') }} *
              </label>
              <select
                v-model="form.reason"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white"
              >
                <option value="">{{ t('Select a reason') }}</option>
                <option value="damaged">{{ t('Item damaged during shipping') }}</option>
                <option value="wrong_item">{{ t('Wrong item received') }}</option>
                <option value="not_as_described">{{ t('Not as described') }}</option>
                <option value="changed_mind">{{ t('Changed my mind') }}</option>
                <option value="scent_different">{{ t('Scent different than expected') }}</option>
                <option value="other">{{ t('Other') }}</option>
              </select>
            </div>

            <!-- Additional Details -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('Additional Details') }}
              </label>
              <textarea
                v-model="form.details"
                rows="4"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                :placeholder="t('Please provide any additional information about the return')"
              ></textarea>
            </div>

            <!-- Photo Upload -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('Upload Photos (Optional)') }}
              </label>
              <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div class="space-y-1 text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H8a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <div class="flex text-sm text-gray-600">
                    <label class="relative cursor-pointer bg-white rounded-md font-medium text-gold-600 hover:text-gold-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-gold-500">
                      <span>{{ t('Upload files') }}</span>
                      <input type="file" multiple class="sr-only" @change="handleFileUpload" accept="image/*">
                    </label>
                    <p class="pl-1">{{ t('or drag and drop') }}</p>
                  </div>
                  <p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                </div>
              </div>
              <div v-if="uploadedFiles.length > 0" class="mt-3">
                <p class="text-sm font-medium text-gray-700 mb-2">{{ t('Uploaded files:') }}</p>
                <ul class="space-y-1">
                  <li v-for="(file, index) in uploadedFiles" :key="index" class="text-sm text-gray-600 flex items-center">
                    <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    {{ file.name }}
                  </li>
                </ul>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="submitting"
              class="w-full py-3 px-4 bg-gold-500 text-white rounded-lg hover:bg-gold-600 disabled:opacity-50 font-medium transition-colors"
            >
              {{ submitting ? t('Submitting...') : t('Submit Return Request') }}
            </button>
          </form>
        </div>
      </div>

      <!-- FAQ Section -->
      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="p-6 sm:p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">{{ t('Frequently Asked Questions') }}</h2>
          
          <div class="space-y-4">
            <div v-for="(faq, index) in faqs" :key="index" class="border-b border-gray-200 pb-4 last:border-0">
              <button
                @click="toggleFaq(index)"
                class="w-full flex justify-between items-center text-left"
              >
                <span class="font-medium text-gray-900">{{ faq.question }}</span>
                <svg
                  class="w-5 h-5 text-gray-500 transform transition-transform"
                  :class="{ 'rotate-180': openFaqs.includes(index) }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              <div v-if="openFaqs.includes(index)" class="mt-3 text-sm text-gray-600">
                {{ faq.answer }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Support -->
      <div class="mt-8 text-center">
        <p class="text-gray-600">{{ t('Need help with your return?') }}</p>
        <div class="mt-4 flex flex-col sm:flex-row gap-4 justify-center">
          <router-link
            to="/contact"
            class="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            {{ t('Contact Support') }}
          </router-link>
          <a
            href="tel:+201001234567"
            class="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-gold-500 hover:bg-gold-600"
          >
            <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
            {{ t('Call Us') }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue' // ✅ added watch import
import { useLanguageStore } from '@/stores/language'
import { showSuccess, showError } from '@/utils/notifications' // ✅ corrected imports

const { t } = useLanguageStore()

// State
const submitting = ref(false)
const uploadedFiles = ref<File[]>([])
const openFaqs = ref<number[]>([])
const mockOrderItems = ref<any[]>([])

// Form state
const form = reactive({
  orderNumber: '',
  email: '',
  itemId: '',
  reason: '',
  details: ''
})

// FAQs data
const faqs = [
  {
    question: t('How long do I have to return an item?'),
    answer: t('You have 14 days from the date of delivery to initiate a return. Items must be unused and in their original packaging.')
  },
  {
    question: t('How long does it take to process a refund?'),
    answer: t('Once we receive and inspect your return, refunds are processed within 5-7 business days. The amount will be credited back to your original payment method.')
  },
  {
    question: t('Who pays for return shipping?'),
    answer: t('If the return is due to our error (wrong item, damaged, defective), we will cover the return shipping costs. For other reasons, the customer is responsible for return shipping.')
  },
  {
    question: t('Can I exchange an item instead of returning?'),
    answer: t('Yes, you can request an exchange for a different size or fragrance. Please indicate this in your return request and we will process the exchange once we receive the original item.')
  },
  {
    question: t('What if my item arrives damaged?'),
    answer: t('If your item arrives damaged, please contact us within 48 hours of delivery with photos of the damage. We will arrange a replacement or full refund including shipping costs.')
  },
  {
    question: t('Can I return a gift?'),
    answer: t('Yes, gifts can be returned. If the gift was purchased from our store, we can issue store credit to the gift recipient or exchange for another item.')
  }
]

// Methods
const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) {
    uploadedFiles.value = Array.from(input.files)
  }
}

const toggleFaq = (index: number) => {
  const pos = openFaqs.value.indexOf(index)
  if (pos === -1) {
    openFaqs.value.push(index)
  } else {
    openFaqs.value.splice(pos, 1)
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-EG').format(amount)
}

const submitReturnRequest = async () => {
  submitting.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // In production, send to your backend
    console.log('Return request:', {
      ...form,
      files: uploadedFiles.value
    })
    
    showSuccess(t('Return request submitted successfully! We will contact you within 24 hours.'))
    
    // Reset form
    form.orderNumber = ''
    form.email = ''
    form.itemId = ''
    form.reason = ''
    form.details = ''
    uploadedFiles.value = []
    
  } catch (error) {
    showError(t('Failed to submit return request. Please try again.'))
  } finally {
    submitting.value = false
  }
}

// Watch order number to load mock items (in production, fetch from API)
watch(() => form.orderNumber, (newVal) => {
  if (newVal && newVal.length > 8) {
    // Mock data - replace with actual API call
    mockOrderItems.value = [
      { id: '1', name: 'Tom Ford Noir Extreme', size: '100ml', price: 450 },
      { id: '2', name: 'YSL Black Opium', size: '90ml', price: 380 },
      { id: '3', name: 'Dior Sauvage', size: '100ml', price: 520 }
    ]
  } else {
    mockOrderItems.value = []
  }
})
</script>

<style scoped>
.prose {
  max-width: 65ch;
}

/* Animation for FAQ */
.rotate-180 {
  transform: rotate(180deg);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .grid {
    gap: 1rem;
  }
}
</style>