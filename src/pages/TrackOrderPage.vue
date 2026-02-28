<!-- src/pages/TrackOrderPage.vue -->
<template>
  <div class="track-order-page min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ t('Track Your Order') }}</h1>
        <p class="text-gray-600">{{ t('Enter your order number and email to track your package') }}</p>
      </div>

      <!-- Tracking Form -->
      <div v-if="!trackingResult" class="bg-white rounded-lg shadow-lg p-6">
        <form @submit.prevent="trackOrder" class="space-y-6">
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

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 px-4 bg-gold-500 text-white rounded-lg hover:bg-gold-600 disabled:opacity-50 font-medium transition-colors"
          >
            {{ loading ? t('Tracking...') : t('Track Order') }}
          </button>
        </form>
      </div>

      <!-- Tracking Result -->
      <div v-else-if="order" class="bg-white rounded-lg shadow-lg overflow-hidden">
        <!-- Order Header -->
        <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-lg font-bold text-gray-900">{{ t('Order') }} #{{ order.orderNumber }}</h2>
              <p class="text-sm text-gray-600">{{ t('Placed on') }} {{ formatDate(order.createdAt) }}</p>
            </div>
            <span :class="[
              'px-3 py-1 rounded-full text-sm font-medium',
              getStatusColor(order.status)
            ]">
              {{ getStatusText(order.status) }}
            </span>
          </div>
        </div>

        <!-- Tracking Timeline -->
        <div class="p-6">
          <div class="relative">
            <!-- Timeline line -->
            <div class="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            <!-- Timeline steps -->
            <div class="space-y-6 relative">
              <div v-for="(step, index) in trackingSteps" :key="index" class="flex items-start">
                <div class="flex-shrink-0 relative z-10">
                  <div :class="[
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    step.completed ? 'bg-green-500' : 'bg-gray-200'
                  ]">
                    <svg v-if="step.completed" class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span v-else class="text-gray-500">{{ index + 1 }}</span>
                  </div>
                </div>
                <div class="ml-4 flex-1">
                  <h3 class="text-sm font-medium text-gray-900">{{ step.label }}</h3>
                  <p class="text-xs text-gray-500">{{ step.date ? formatDate(step.date) : step.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="border-t border-gray-200 px-6 py-4">
          <h3 class="text-sm font-medium text-gray-900 mb-3">{{ t('Order Summary') }}</h3>
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">{{ t('Items') }}</span>
              <span class="font-medium text-gray-900">{{ order.items.length }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">{{ t('Total') }}</span>
              <span class="font-medium text-gray-900">{{ formatCurrency(order.total) }} EGP</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="border-t border-gray-200 px-6 py-4 bg-gray-50 flex gap-3 justify-end">
          <router-link
            :to="`/order/details/${order.id}`"
            class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {{ t('View Details') }}
          </router-link>
          <button
            @click="copyTrackingNumber"
            class="px-4 py-2 bg-gold-500 text-white rounded-lg text-sm font-medium hover:bg-gold-600 flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
            </svg>
            {{ t('Copy Tracking Number') }}
          </button>
        </div>
      </div>

      <!-- Not Found -->
      <div v-else-if="trackingResult && !order" class="bg-white rounded-lg shadow-lg p-8 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <h2 class="mt-4 text-lg font-medium text-gray-900">{{ t('Order Not Found') }}</h2>
        <p class="mt-1 text-gray-500">{{ t('No order matches the provided information. Please check and try again.') }}</p>
        <div class="mt-6">
          <button
            @click="resetForm"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {{ t('Try Again') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import { useLanguageStore } from '@/stores/language'
import { showSuccess } from '@/utils/notifications'

const ordersStore = useOrdersStore()
const { t } = useLanguageStore()

const form = reactive({
  orderNumber: '',
  email: ''
})

const loading = ref(false)
const trackingResult = ref(false)
const order = ref<any>(null)

// Define tracking steps with optional date
interface TrackingStep {
  label: string
  description: string
  date: Date | null
  completed: boolean
}

const trackingSteps = ref<TrackingStep[]>([
  {
    label: t('Order Placed'),
    description: t('Your order has been placed'),
    date: null,
    completed: true
  },
  {
    label: t('Processing'),
    description: t('Your order is being processed'),
    date: null,
    completed: false
  },
  {
    label: t('Shipped'),
    description: t('Your order has been shipped'),
    date: null,
    completed: false
  },
  {
    label: t('Delivered'),
    description: t('Your order has been delivered'),
    date: null,
    completed: false
  }
])

const trackOrder = async () => {
  loading.value = true
  try {
    // Ensure orderNumber is a string (not string[] from route)
    const orderNumber = Array.isArray(form.orderNumber) ? form.orderNumber[0] : form.orderNumber
    const fetchedOrder = await ordersStore.fetchOrderByNumber(orderNumber, form.email)
    
    trackingResult.value = true
    
    if (fetchedOrder) {
      order.value = fetchedOrder
      
      // Update tracking steps based on order status
      const status = fetchedOrder.status
      
      if (status === 'pending') {
        trackingSteps.value[0].date = fetchedOrder.createdAt
        trackingSteps.value[0].completed = true
      } else if (status === 'processing') {
        trackingSteps.value[0].date = fetchedOrder.createdAt
        trackingSteps.value[1].date = fetchedOrder.updatedAt
        trackingSteps.value[1].completed = true
      } else if (status === 'shipped') {
        trackingSteps.value[0].date = fetchedOrder.createdAt
        trackingSteps.value[1].date = fetchedOrder.updatedAt
        trackingSteps.value[2].date = fetchedOrder.shippedAt || fetchedOrder.updatedAt
        trackingSteps.value[2].completed = true
      } else if (status === 'delivered') {
        trackingSteps.value[0].date = fetchedOrder.createdAt
        trackingSteps.value[1].date = fetchedOrder.updatedAt
        trackingSteps.value[2].date = fetchedOrder.shippedAt || fetchedOrder.updatedAt
        trackingSteps.value[3].date = fetchedOrder.deliveredAt || fetchedOrder.updatedAt
        trackingSteps.value[3].completed = true
      } else if (status === 'cancelled') {
        // For cancelled orders, mark first step and maybe show cancellation reason
        trackingSteps.value[0].date = fetchedOrder.createdAt
        trackingSteps.value[0].completed = true
        // other steps remain incomplete
      }
    } else {
      order.value = null
    }
  } catch (error) {
    console.error('Error tracking order:', error)
    trackingResult.value = true
    order.value = null
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.orderNumber = ''
  form.email = ''
  trackingResult.value = false
  order.value = null
}

const formatDate = (date: Date) => {
  if (!date) return ''
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

const copyTrackingNumber = async () => {
  if (order.value?.trackingNumber) {
    await navigator.clipboard.writeText(order.value.trackingNumber)
    showSuccess(t('Tracking number copied!'))
  }
}
</script>

<style scoped>
/* ... same styles ... */
</style>