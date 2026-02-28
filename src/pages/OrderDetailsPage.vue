<!-- src/pages/OrderDetailsPage.vue -->
<template>
  <div class="order-details-page min-h-screen bg-gray-50 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
        <p class="mt-4 text-gray-600">{{ t('Loading order details...') }}</p>
      </div>

      <!-- Email Verification (for guests) -->
      <div v-else-if="!isVerified && !ordersStore.currentOrder" class="bg-white rounded-lg shadow-lg p-6 sm:p-8 max-w-md mx-auto">
        <h2 class="text-xl font-medium text-gray-900 mb-4">{{ t('Verify Your Email') }}</h2>
        <p class="text-sm text-gray-600 mb-6">{{ t('Please enter the email address used for this order to view details.') }}</p>
        
        <form @submit.prevent="verifyEmail">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('Email Address') }}</label>
            <input
              v-model="verificationEmail"
              type="email"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 text-base"
              :placeholder="t('Enter your email')"
            />
          </div>
          <button
            type="submit"
            :disabled="verifying"
            class="w-full py-3 px-4 bg-gold-500 text-white rounded-md hover:bg-gold-600 disabled:opacity-50 text-base font-medium"
          >
            {{ verifying ? t('Verifying...') : t('View Order') }}
          </button>
        </form>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white rounded-lg shadow-lg p-8 text-center">
        <svg class="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <h2 class="mt-4 text-xl font-medium text-gray-900">{{ t('Order Not Found') }}</h2>
        <p class="mt-2 text-gray-500">{{ error }}</p>
        <div class="mt-6">
          <router-link to="/" class="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gold-500 hover:bg-gold-600">
            {{ t('Go Home') }}
          </router-link>
        </div>
      </div>

      <!-- Order Details -->
      <div v-else-if="order" class="bg-white rounded-lg shadow-lg overflow-hidden">
        <!-- Header -->
        <div class="bg-gray-50 px-4 sm:px-6 py-4 border-b border-gray-200">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 class="text-xl font-bold text-gray-900">{{ t('Order Details') }}</h1>
              <p class="text-sm text-gray-500 mt-1">{{ t('Order Number') }}: #{{ order.orderNumber }}</p>
            </div>
            <span :class="[
              'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium self-start',
              getStatusColor(order.status)
            ]">
              {{ ordersStore.getStatusText(order.status) }}
            </span>
          </div>
        </div>

        <!-- Status Timeline - Mobile -->
        <div class="sm:hidden px-4 py-4 border-b border-gray-200">
          <h3 class="text-sm font-medium text-gray-900 mb-3">{{ t('Order Timeline') }}</h3>
          <div class="space-y-3">
            <div v-for="(statusItem, index) in order.statusHistory" :key="index" class="flex items-start space-x-3">
              <div class="flex-shrink-0">
                <span :class="['w-2 h-2 mt-2 rounded-full', getTimelineDotColor(statusItem.status)]"></span>
              </div>
              <div class="flex-1">
                <p class="text-sm text-gray-900">{{ ordersStore.getStatusText(statusItem.status) }}</p>
                <p class="text-xs text-gray-500">{{ formatDate(statusItem.date) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tracking Info -->
        <div v-if="order.trackingNumber" class="bg-blue-50 px-4 sm:px-6 py-4 border-b border-blue-100">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-blue-800">{{ t('Tracking Number') }}</p>
              <p class="text-sm text-blue-600 mt-1">{{ order.trackingNumber }}</p>
            </div>
            <button
              @click="trackOrder"
              class="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {{ t('Track Package') }} →
            </button>
          </div>
        </div>

        <!-- Order Items -->
        <div class="px-4 sm:px-6 py-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">{{ t('Items Ordered') }}</h2>
          <div class="space-y-4">
            <div v-for="item in order.items" :key="item.id" class="flex flex-col sm:flex-row sm:items-start py-3 border-b border-gray-100 last:border-0">
              <div class="flex items-start">
                <div class="flex-shrink-0 w-16 h-16 bg-gray-100 rounded overflow-hidden">
                  <img :src="item.image || '/images/default-product.jpg'" :alt="item.name" class="w-full h-full object-cover">
                </div>
                <div class="ml-4 flex-1">
                  <h3 class="text-sm font-medium text-gray-900">{{ item.name }}</h3>
                  <p class="text-xs text-gray-500 mt-1">{{ item.size }} • {{ item.concentration }}</p>
                  <p class="text-xs text-gray-500">{{ item.brand }}</p>
                </div>
              </div>
              <div class="mt-2 sm:mt-0 sm:ml-4 flex justify-between items-center">
                <span class="text-sm text-gray-900">{{ formatCurrency(item.price) }} EGP × {{ item.quantity }}</span>
                <span class="text-sm font-medium text-gray-900 ml-4">{{ formatCurrency(item.price * item.quantity) }} EGP</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="bg-gray-50 px-4 sm:px-6 py-6 border-t border-gray-200">
          <h3 class="text-sm font-medium text-gray-900 mb-4">{{ t('Order Summary') }}</h3>
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">{{ t('Subtotal') }}</span>
              <span class="font-medium text-gray-900">{{ formatCurrency(order.subtotal) }} EGP</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">{{ t('Shipping') }}</span>
              <span class="font-medium text-gray-900">{{ order.shipping === 0 ? t('Free') : formatCurrency(order.shipping || 0) + ' EGP' }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">{{ t('Tax') }}</span>
              <span class="font-medium text-gray-900">{{ formatCurrency(order.tax || 0) }} EGP</span>
            </div>
            <div class="flex justify-between text-base font-medium pt-4 border-t border-gray-200">
              <span class="text-gray-900">{{ t('Total') }}</span>
              <span class="text-gold-600">{{ formatCurrency(order.total) }} EGP</span>
            </div>
          </div>
        </div>

        <!-- Shipping Information -->
        <div class="px-4 sm:px-6 py-6 border-t border-gray-200">
          <h3 class="text-sm font-medium text-gray-900 mb-4">{{ t('Shipping Information') }}</h3>
          <div class="text-sm text-gray-600 space-y-1">
            <p><span class="font-medium">{{ t('Name') }}:</span> {{ order.customer.name }}</p>
            <p><span class="font-medium">{{ t('Address') }}:</span> {{ order.customer.address }}</p>
            <p><span class="font-medium">{{ t('City') }}:</span> {{ order.customer.city }}</p>
            <p><span class="font-medium">{{ t('Country') }}:</span> {{ order.customer.country }}</p>
            <p><span class="font-medium">{{ t('Phone') }}:</span> {{ order.customer.phone }}</p>
            <p><span class="font-medium">{{ t('Email') }}:</span> {{ order.customer.email }}</p>
          </div>
        </div>

        <!-- Payment Information -->
        <div class="px-4 sm:px-6 py-6 bg-gray-50 border-t border-gray-200">
          <h3 class="text-sm font-medium text-gray-900 mb-4">{{ t('Payment Information') }}</h3>
          <div class="text-sm text-gray-600 space-y-1">
            <p><span class="font-medium">{{ t('Payment Method') }}:</span> {{ getPaymentMethodText(order.paymentMethod) }}</p>
            <p><span class="font-medium">{{ t('Payment Status') }}:</span> 
              <span :class="order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'">
                {{ ordersStore.getPaymentStatusText(order.paymentStatus) }}
              </span>
            </p>
            <p><span class="font-medium">{{ t('Order Date') }}:</span> {{ formatDate(order.createdAt) }}</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="px-4 sm:px-6 py-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3 justify-end">
          <button
            @click="downloadInvoice"
            class="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            {{ t('Download Invoice') }}
          </button>
          <button
            v-if="canCancel"
            @click="cancelOrder"
            class="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            {{ t('Cancel Order') }}
          </button>
          <button
            v-if="canReorder"
            @click="reorder"
            class="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gold-500 hover:bg-gold-600"
          >
            <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            {{ t('Reorder') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrdersStore } from '@/stores/orders'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'
import { showError, showSuccess } from '@/utils/notifications' // ✅ corrected import
import { showConfirmation } from '@/utils/confirmation'

const route = useRoute()
const router = useRouter()
const ordersStore = useOrdersStore()
const authStore = useAuthStore()
const { t } = useLanguageStore()

const order = computed(() => ordersStore.currentOrder)
const loading = ref(false)
const error = ref<string | null>(null)
const isVerified = ref(false)
const verificationEmail = ref('')
const verifying = ref(false)

const canCancel = computed(() => {
  return order.value && ['pending', 'processing'].includes(order.value.status)
})

const canReorder = computed(() => {
  return order.value && order.value.status === 'delivered'
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-EG').format(amount)
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const getTimelineDotColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-500',
    processing: 'bg-blue-500',
    shipped: 'bg-purple-500',
    delivered: 'bg-green-500',
    cancelled: 'bg-red-500'
  }
  return colors[status] || 'bg-gray-500'
}

const getPaymentMethodText = (method: string) => {
  const methods: Record<string, string> = {
    cash_on_delivery: t('Cash on Delivery'),
    credit_card: t('Credit Card'),
    bank_transfer: t('Bank Transfer')
  }
  return methods[method] || method
}

const verifyEmail = async () => {
  verifying.value = true
  try {
    const orderId = route.params.orderId as string
    const fetchedOrder = await ordersStore.fetchOrderById(orderId)
    
    if (fetchedOrder && fetchedOrder.customer.email === verificationEmail.value) {
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

const trackOrder = () => {
  if (order.value?.trackingNumber) {
    // In a real app, you'd redirect to a tracking page or open a tracking URL
    window.open(`https://www.tracking.com/${order.value.trackingNumber}`, '_blank')
  }
}

const downloadInvoice = async () => {
  if (order.value) {
    await ordersStore.downloadInvoice(order.value.id)
  }
}

const cancelOrder = async () => {
  if (!order.value) return
  
  const confirmed = await showConfirmation({
    title: t('Cancel Order'),
    message: t('Are you sure you want to cancel this order?'),
    confirmText: t('Yes, Cancel'),
    cancelText: t('No, Keep'),
    type: 'warning'
  })
  
  if (confirmed) {
    await ordersStore.cancelOrder(order.value.id, 'Cancelled by customer')
    showSuccess(t('Order cancelled successfully')) // ✅ corrected
    await ordersStore.fetchOrderById(order.value.id)
  }
}

const reorder = async () => {
  if (order.value) {
    await ordersStore.reorder(order.value.id)
    router.push('/cart')
  }
}

onMounted(async () => {
  const orderId = route.params.orderId as string
  
  if (authStore.isAuthenticated) {
    loading.value = true
    try {
      const fetchedOrder = await ordersStore.fetchOrderById(orderId)
      if (fetchedOrder && fetchedOrder.userId === authStore.user?.uid) {
        isVerified.value = true
      }
    } catch (err) {
      error.value = t('Order not found')
    } finally {
      loading.value = false
    }
  }
})
</script>

<style scoped>
.order-details-page {
  min-height: calc(100vh - 200px);
}
</style>