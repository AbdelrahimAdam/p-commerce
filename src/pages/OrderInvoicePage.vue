<!-- src/pages/OrderInvoicePage.vue -->
<template>
  <div class="order-invoice-page min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
        <p class="mt-4 text-gray-600">{{ t('Loading invoice...') }}</p>
      </div>

      <!-- Email Verification (for guests) -->
      <div v-else-if="!isVerified && !order" class="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
        <h2 class="text-xl font-medium text-gray-900 mb-4">{{ t('Verify Your Email') }}</h2>
        <p class="text-sm text-gray-600 mb-6">{{ t('Please enter the email address used for this order to view the invoice.') }}</p>
        
        <form @submit.prevent="verifyEmail">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('Email Address') }}</label>
            <input
              v-model="verificationEmail"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
              :placeholder="t('Enter your email')"
            />
          </div>
          <button
            type="submit"
            :disabled="verifying"
            class="w-full py-2 px-4 bg-gold-500 text-white rounded-md hover:bg-gold-600 disabled:opacity-50"
          >
            {{ verifying ? t('Verifying...') : t('View Invoice') }}
          </button>
        </form>
      </div>

      <!-- Invoice -->
      <div v-else-if="order" class="bg-white rounded-lg shadow-lg overflow-hidden" id="invoice-content">
        <!-- Header Actions -->
        <div class="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h1 class="text-xl font-bold text-gray-900">{{ t('Invoice') }}</h1>
          <div class="flex gap-2">
            <button
              @click="printInvoice"
              class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
              </svg>
              {{ t('Print') }}
            </button>
            <button
              @click="downloadInvoice"
              class="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gold-500 hover:bg-gold-600"
            >
              <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              {{ t('Download PDF') }}
            </button>
          </div>
        </div>

        <!-- Invoice Content -->
        <div class="px-6 py-8">
          <!-- Header -->
          <div class="flex justify-between items-start mb-8">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">LUXURY PERFUME STORE</h2>
              <p class="text-sm text-gray-600 mt-1">123 Nile Street, Cairo, Egypt</p>
              <p class="text-sm text-gray-600">info@luxuryperfume.com | +20 100 123 4567</p>
            </div>
            <div class="text-right">
              <h3 class="text-lg font-bold text-gray-900">{{ t('INVOICE') }}</h3>
              <p class="text-sm text-gray-600 mt-1">{{ t('Invoice #') }}: {{ order.orderNumber }}</p>
              <p class="text-sm text-gray-600">{{ t('Date') }}: {{ formatDate(order.createdAt) }}</p>
            </div>
          </div>

          <!-- Customer Info -->
          <div class="mb-8 p-4 bg-gray-50 rounded-lg">
            <h4 class="text-sm font-medium text-gray-700 mb-2">{{ t('Bill To:') }}</h4>
            <p class="text-sm text-gray-900">{{ order.customer.name }}</p>
            <p class="text-sm text-gray-600">{{ order.customer.address }}</p>
            <p class="text-sm text-gray-600">{{ order.customer.city }}, {{ order.customer.country }}</p>
            <p class="text-sm text-gray-600">{{ t('Email') }}: {{ order.customer.email }}</p>
            <p class="text-sm text-gray-600">{{ t('Phone') }}: {{ order.customer.phone }}</p>
          </div>

          <!-- Items Table -->
          <table class="w-full mb-8">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="text-left py-3 text-sm font-medium text-gray-700">{{ t('Item') }}</th>
                <th class="text-left py-3 text-sm font-medium text-gray-700">{{ t('Size') }}</th>
                <th class="text-center py-3 text-sm font-medium text-gray-700">{{ t('Qty') }}</th>
                <th class="text-right py-3 text-sm font-medium text-gray-700">{{ t('Price') }}</th>
                <th class="text-right py-3 text-sm font-medium text-gray-700">{{ t('Total') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in order.items" :key="item.id" class="border-b border-gray-100">
                <td class="py-3 text-sm text-gray-900">{{ item.name }}</td>
                <td class="py-3 text-sm text-gray-600">{{ item.size }}</td>
                <td class="py-3 text-sm text-gray-600 text-center">{{ item.quantity }}</td>
                <td class="py-3 text-sm text-gray-900 text-right">{{ formatCurrency(item.price) }} EGP</td>
                <td class="py-3 text-sm text-gray-900 text-right">{{ formatCurrency(item.price * item.quantity) }} EGP</td>
              </tr>
            </tbody>
          </table>

          <!-- Summary -->
          <div class="flex justify-end">
            <div class="w-64">
              <div class="flex justify-between py-2">
                <span class="text-sm text-gray-600">{{ t('Subtotal') }}</span>
                <span class="text-sm font-medium text-gray-900">{{ formatCurrency(order.subtotal) }} EGP</span>
              </div>
              <div class="flex justify-between py-2">
                <span class="text-sm text-gray-600">{{ t('Shipping') }}</span>
                <span class="text-sm font-medium text-gray-900">{{ order.shipping === 0 ? t('Free') : formatCurrency(order.shipping || 0) + ' EGP' }}</span>
              </div>
              <div class="flex justify-between py-2">
                <span class="text-sm text-gray-600">{{ t('Tax') }}</span>
                <span class="text-sm font-medium text-gray-900">{{ formatCurrency(order.tax || 0) }} EGP</span>
              </div>
              <div class="flex justify-between py-3 border-t border-gray-200">
                <span class="text-base font-bold text-gray-900">{{ t('Total') }}</span>
                <span class="text-base font-bold text-gold-600">{{ formatCurrency(order.total) }} EGP</span>
              </div>
            </div>
          </div>

          <!-- Payment Info -->
          <div class="mt-8 pt-8 border-t border-gray-200">
            <div class="text-sm text-gray-600">
              <p><span class="font-medium">{{ t('Payment Method') }}:</span> {{ getPaymentMethodText(order.paymentMethod) }}</p>
              <p><span class="font-medium">{{ t('Payment Status') }}:</span> 
                <span :class="order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'">
                  {{ t(order.paymentStatus) }}
                </span>
              </p>
              <p><span class="font-medium">{{ t('Order Status') }}:</span> {{ getStatusText(order.status) }}</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="mt-8 text-center text-sm text-gray-500">
            <p>{{ t('Thank you for shopping with Luxury Perfume Store!') }}</p>
            <p class="mt-1">{{ t('This is a computer generated invoice. No signature required.') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useOrdersStore } from '@/stores/orders'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'
import { showError, showSuccess } from '@/utils/notifications' // ✅ corrected import

// Type declaration for html2pdf
declare module 'html2pdf.js' {
  const html2pdf: any
  export default html2pdf
}
import html2pdf from 'html2pdf.js'

const route = useRoute()
const ordersStore = useOrdersStore()
const authStore = useAuthStore()
const { t } = useLanguageStore()

const order = ref<any>(null)
const loading = ref(false)
const isVerified = ref(false)
const verificationEmail = ref('')
const verifying = ref(false)

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-EG').format(amount)
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getPaymentMethodText = (method: string) => {
  const methods: Record<string, string> = {
    cash_on_delivery: t('Cash on Delivery'),
    credit_card: t('Credit Card'),
    bank_transfer: t('Bank Transfer')
  }
  return methods[method] || method
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: t('Pending'),
    processing: t('Processing'),
    shipped: t('Shipped'),
    delivered: t('Delivered'),
    cancelled: t('Cancelled')
  }
  return texts[status] || status
}

const verifyEmail = async () => {
  verifying.value = true
  try {
    const orderId = route.params.orderId as string
    const fetchedOrder = await ordersStore.fetchOrderById(orderId)
    
    if (fetchedOrder && fetchedOrder.customer.email === verificationEmail.value) {
      order.value = fetchedOrder
      isVerified.value = true
    } else {
      showError(t('Invalid email address')) // ✅ corrected
    }
  } catch (err) {
    showError(t('Failed to verify email')) // ✅ corrected
  } finally {
    verifying.value = false
  }
}

const printInvoice = () => {
  window.print()
}

const downloadInvoice = async () => {
  const element = document.getElementById('invoice-content')
  if (element) {
    const opt = {
      margin: 1,
      filename: `invoice-${order.value.orderNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }
    
    await html2pdf().set(opt).from(element).save()
    showSuccess(t('Invoice downloaded successfully')) // ✅ corrected
  }
}

onMounted(async () => {
  const orderId = route.params.orderId as string
  
  // If user is authenticated, try to fetch order directly
  if (authStore.isAuthenticated) {
    loading.value = true
    try {
      const fetchedOrder = await ordersStore.fetchOrderById(orderId)
      if (fetchedOrder) {
        order.value = fetchedOrder
        isVerified.value = true
      }
    } catch (err) {
      showError(t('Order not found')) // ✅ corrected
    } finally {
      loading.value = false
    }
  }
})
</script>

<style>
@media print {
  .order-invoice-page {
    background: white;
    padding: 0;
  }
  .bg-gray-50,
  .bg-gold-500,
  button {
    display: none;
  }
  #invoice-content {
    box-shadow: none;
    padding: 1rem;
  }
}
</style>