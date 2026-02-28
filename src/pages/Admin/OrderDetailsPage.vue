<!-- src/pages/Admin/OrderDetailsPage.vue -->
<template>
  <div class="admin-order-details-page">
    <!-- Admin Access Check -->
    <div v-if="!authStore.isAdmin" class="text-center py-12 px-4">
      <div class="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
        <svg class="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">{{ t('Admin Access Required') }}</h3>
        <p class="mt-2 text-gray-500">{{ t('You need admin privileges to view this page') }}</p>
        <button
          @click="router.push('/admin/login')"
          class="mt-6 inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gold-500 hover:bg-gold-600"
        >
          {{ t('Go to Admin Login') }}
        </button>
      </div>
    </div>

    <!-- Header - Only show for admins -->
    <template v-else>
      <div class="mb-6 sm:mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center space-x-4">
            <button
              @click="goBack"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              :title="t('Back')"
            >
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
            </button>
            <div>
              <h1 class="text-xl sm:text-2xl font-bold text-gray-900">{{ t('Order Details') }}</h1>
              <p class="text-sm text-gray-500 mt-1">{{ t('Order Number') }}: #{{ order?.orderNumber }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <span :class="[
              'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
              getStatusColor(order?.status)
            ]">
              {{ ordersStore.getStatusText(order?.status) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
        <p class="mt-4 text-gray-600">{{ t('Loading order details...') }}</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <svg class="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">{{ t('Error Loading Order') }}</h3>
        <p class="mt-2 text-gray-500">{{ error }}</p>
        <div class="mt-6 space-x-4">
          <button
            @click="fetchOrder"
            class="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gold-500 hover:bg-gold-600"
          >
            {{ t('Try Again') }}
          </button>
          <button
            @click="goBack"
            class="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            {{ t('Back to Orders') }}
          </button>
        </div>
      </div>

      <!-- Order Details -->
      <div v-else-if="order" class="space-y-6">
        <!-- Status Timeline -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">{{ t('Order Timeline') }}</h2>
          </div>
          <div class="p-4 sm:p-6">
            <div class="flow-root">
              <ul class="-mb-8">
                <li v-for="(statusItem, index) in order.statusHistory" :key="index" class="relative pb-8">
                  <div v-if="index !== order.statusHistory.length - 1" class="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></div>
                  <div class="relative flex space-x-3">
                    <div>
                      <span :class="[
                        'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white',
                        getTimelineIconColor(statusItem.status)
                      ]">
                        <svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                      </span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div>
                        <p class="text-sm text-gray-900">
                          {{ ordersStore.getStatusText(statusItem.status) }}
                          <span v-if="statusItem.note" class="text-gray-500"> - {{ statusItem.note }}</span>
                        </p>
                        <p class="mt-0.5 text-xs text-gray-500">
                          {{ formatDate(statusItem.timestamp) }}
                          <span v-if="statusItem.updatedBy" class="ml-2">by {{ statusItem.updatedBy }}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Customer Information -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">{{ t('Customer Information') }}</h2>
          </div>
          <div class="p-4 sm:p-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 class="text-sm font-medium text-gray-700 mb-3">{{ t('Contact Details') }}</h3>
                <div class="space-y-2 text-sm text-gray-600">
                  <p><span class="font-medium">{{ t('Name') }}:</span> {{ order.customer?.name || t('Guest') }}</p>
                  <p><span class="font-medium">{{ t('Email') }}:</span> 
                    <a :href="`mailto:${order.customer?.email || order.userEmail}`" class="text-gold-600 hover:text-gold-700">
                      {{ order.customer?.email || order.userEmail || t('N/A') }}
                    </a>
                  </p>
                  <p><span class="font-medium">{{ t('Phone') }}:</span> 
                    <a :href="`tel:${order.customer?.phone}`" class="text-gold-600 hover:text-gold-700">
                      {{ order.customer?.phone || t('N/A') }}
                    </a>
                  </p>
                  <p v-if="order.guestId" class="text-xs text-gray-400">
                    <span class="font-medium">{{ t('Guest Order ID') }}:</span> {{ order.guestId }}
                  </p>
                </div>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-700 mb-3">{{ t('Shipping Address') }}</h3>
                <div class="space-y-2 text-sm text-gray-600">
                  <p>{{ order.shippingAddress?.address || order.customer?.address || t('N/A') }}</p>
                  <p>{{ order.shippingAddress?.city || order.customer?.city || '' }}, 
                     {{ order.shippingAddress?.country || order.customer?.country || '' }}</p>
                  <p v-if="order.shippingAddress?.postalCode">{{ order.shippingAddress.postalCode }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">{{ t('Order Items') }}</h2>
          </div>
          <div class="overflow-x-auto">
            <!-- Mobile View -->
            <div class="sm:hidden divide-y divide-gray-200">
              <div v-for="item in order.items" :key="item.id" class="p-4">
                <div class="flex items-start space-x-4">
                  <div class="flex-shrink-0 w-16 h-16 bg-gray-100 rounded overflow-hidden">
                    <img :src="item.image || '/images/default-product.jpg'" :alt="item.name" class="h-full w-full object-cover">
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="text-sm font-medium text-gray-900">{{ item.name }}</h3>
                    <p class="text-xs text-gray-500 mt-1">{{ item.size }} • {{ item.concentration }}</p>
                    <p class="text-xs text-gray-500">{{ item.brand }}</p>
                    <div class="mt-2 flex justify-between items-center">
                      <span class="text-sm text-gray-900">{{ formatCurrency(item.price) }} EGP × {{ item.quantity }}</span>
                      <span class="text-sm font-medium text-gray-900">{{ formatCurrency(item.price * item.quantity) }} EGP</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Desktop View -->
            <div class="hidden sm:block">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ t('Product') }}
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ t('Details') }}
                    </th>
                    <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ t('Price') }}
                    </th>
                    <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ t('Quantity') }}
                    </th>
                    <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ t('Total') }}
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="item in order.items" :key="item.id">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-12 w-12 bg-gray-100 rounded overflow-hidden">
                          <img :src="item.image || '/images/default-product.jpg'" :alt="item.name" class="h-full w-full object-cover">
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">{{ item.name }}</div>
                          <div class="text-sm text-gray-500">{{ item.brand }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">{{ item.size }}</div>
                      <div class="text-sm text-gray-500">{{ item.concentration }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {{ formatCurrency(item.price) }} EGP
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {{ item.quantity }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                      {{ formatCurrency(item.price * item.quantity) }} EGP
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">{{ t('Order Summary') }}</h2>
          </div>
          <div class="p-4 sm:p-6">
            <div class="flex justify-end">
              <div class="w-full sm:w-80 space-y-3">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">{{ t('Subtotal') }}</span>
                  <span class="font-medium text-gray-900">{{ formatCurrency(order.subtotal) }} EGP</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">{{ t('Shipping') }}</span>
                  <span class="font-medium text-gray-900">{{ order.shipping === 0 ? t('Free') : formatCurrency(order.shipping) + ' EGP' }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">{{ t('Tax') }}</span>
                  <span class="font-medium text-gray-900">{{ formatCurrency(order.tax) }} EGP</span>
                </div>
                <div class="flex justify-between text-base font-medium pt-3 border-t border-gray-200">
                  <span class="text-gray-900">{{ t('Total') }}</span>
                  <span class="text-gold-600">{{ formatCurrency(order.total) }} EGP</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Information -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">{{ t('Payment Information') }}</h2>
          </div>
          <div class="p-4 sm:p-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div>
                <h3 class="text-sm font-medium text-gray-700 mb-2">{{ t('Payment Method') }}</h3>
                <p class="text-sm text-gray-900">{{ getPaymentMethodText(order.paymentMethod) }}</p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-700 mb-2">{{ t('Payment Status') }}</h3>
                <div class="flex items-center gap-3">
                  <span :class="getPaymentStatusClasses(order.paymentStatus)" class="px-2 py-1 text-xs rounded-full">
                    {{ ordersStore.getPaymentStatusText(order.paymentStatus) }}
                  </span>
                  <button
                    @click="showPaymentStatusModal = true"
                    class="text-xs text-gold-600 hover:text-gold-700"
                  >
                    {{ t('Update') }}
                  </button>
                </div>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-700 mb-2">{{ t('Order Date') }}</h3>
                <p class="text-sm text-gray-900">{{ formatDate(order.createdAt) }}</p>
              </div>
              <div v-if="order.trackingNumber">
                <h3 class="text-sm font-medium text-gray-700 mb-2">{{ t('Tracking Number') }}</h3>
                <p class="text-sm text-gray-900">{{ order.trackingNumber }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Status Update Form -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">{{ t('Update Order Status') }}</h2>
          </div>
          <div class="p-4 sm:p-6">
            <form @submit.prevent="updateOrderStatus" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ t('Status') }}
                  </label>
                  <select
                    v-model="statusForm.status"
                    class="w-full px-4 py-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 text-base"
                  >
                    <option value="pending">{{ t('Pending') }}</option>
                    <option value="processing">{{ t('Processing') }}</option>
                    <option value="shipped">{{ t('Shipped') }}</option>
                    <option value="delivered">{{ t('Delivered') }}</option>
                    <option value="cancelled">{{ t('Cancelled') }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ t('Tracking Number') }}
                  </label>
                  <input
                    v-model="statusForm.trackingNumber"
                    type="text"
                    class="w-full px-4 py-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 text-base"
                    :placeholder="t('Enter tracking number')"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('Status Note (Optional)') }}
                </label>
                <textarea
                  v-model="statusForm.note"
                  rows="2"
                  class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 text-base"
                  :placeholder="t('Add a note about this status update...')"
                ></textarea>
              </div>
              <div class="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  @click="resetStatusForm"
                  class="w-full sm:w-auto px-6 py-3 sm:py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {{ t('Reset') }}
                </button>
                <button
                  type="submit"
                  :disabled="updating"
                  class="w-full sm:w-auto px-6 py-3 sm:py-2 bg-gold-500 text-white rounded-md text-sm font-medium hover:bg-gold-600 disabled:opacity-50"
                >
                  {{ updating ? t('Updating...') : t('Update Status') }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Admin Notes -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">{{ t('Admin Notes') }}</h2>
          </div>
          <div class="p-4 sm:p-6">
            <textarea
              v-model="adminNotes"
              rows="4"
              class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 text-base"
              :placeholder="t('Add internal notes about this order...')"
            ></textarea>
            <div class="mt-3 flex justify-end">
              <button
                @click="saveNotes"
                :disabled="savingNotes"
                class="w-full sm:w-auto px-6 py-3 sm:py-2 bg-gray-800 text-white rounded-md text-sm font-medium hover:bg-gray-900 disabled:opacity-50"
              >
                {{ savingNotes ? t('Saving...') : t('Save Notes') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row justify-end gap-3">
          <button
            @click="printInvoice"
            class="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
            </svg>
            {{ t('Print Invoice') }}
          </button>
          <button
            @click="sendEmailNotification"
            class="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gold-500 hover:bg-gold-600"
          >
            <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            {{ t('Send Email') }}
          </button>
        </div>
      </div>
    </template>

    <!-- Payment Status Update Modal -->
    <div v-if="showPaymentStatusModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4">{{ t('Update Payment Status') }}</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('Payment Status') }}
            </label>
            <select
              v-model="paymentStatusForm.status"
              class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 text-base"
            >
              <option value="pending">{{ t('Pending') }}</option>
              <option value="paid">{{ t('Paid') }}</option>
              <option value="failed">{{ t('Failed') }}</option>
              <option value="refunded">{{ t('Refunded') }}</option>
            </select>
          </div>
          <div class="flex flex-col sm:flex-row justify-end gap-3">
            <button
              @click="showPaymentStatusModal = false"
              class="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {{ t('Cancel') }}
            </button>
            <button
              @click="updatePaymentStatus"
              :disabled="updatingPayment"
              class="w-full sm:w-auto px-4 py-2 bg-gold-500 text-white rounded-md text-sm font-medium hover:bg-gold-600 disabled:opacity-50"
            >
              {{ updatingPayment ? t('Updating...') : t('Update') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrdersStore } from '@/stores/orders'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'
import { authNotification } from '@/utils/notifications'  // Fixed import
import { showConfirmation } from '@/utils/confirmation'
import type { PaymentStatus } from '@/types'

const route = useRoute()
const router = useRouter()
const ordersStore = useOrdersStore()
const authStore = useAuthStore()
const { t } = useLanguageStore()

// State
const order = ref<any>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const updating = ref(false)
const updatingPayment = ref(false)
const savingNotes = ref(false)
const adminNotes = ref('')
const showPaymentStatusModal = ref(false)

// Form state
const statusForm = reactive({
  status: 'pending',
  trackingNumber: '',
  note: ''
})

const paymentStatusForm = reactive({
  status: 'pending' as PaymentStatus
})

// Methods
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

const getTimelineIconColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-500',
    processing: 'bg-blue-500',
    shipped: 'bg-purple-500',
    delivered: 'bg-green-500',
    cancelled: 'bg-red-500'
  }
  return colors[status] || 'bg-gray-500'
}

const getPaymentStatusClasses = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getPaymentMethodText = (method: string) => {
  const methods: Record<string, string> = {
    cash_on_delivery: t('Cash on Delivery'),
    credit_card: t('Credit Card'),
    bank_transfer: t('Bank Transfer')
  }
  return methods[method] || method
}

const goBack = () => {
  router.push('/admin/orders')
}

const fetchOrder = async () => {
  if (!authStore.isAdmin) {
    error.value = t('Admin access required')
    loading.value = false
    return
  }

  const orderId = route.params.orderId as string
  loading.value = true
  error.value = null
  
  try {
    const fetchedOrder = await ordersStore.fetchOrderById(orderId)
    if (fetchedOrder) {
      order.value = fetchedOrder
      statusForm.status = fetchedOrder.status
      statusForm.trackingNumber = fetchedOrder.trackingNumber || ''
      adminNotes.value = fetchedOrder.adminNotes || ''
      paymentStatusForm.status = fetchedOrder.paymentStatus
    } else {
      error.value = t('Order not found')
    }
  } catch (err: any) {
    console.error('Error loading order:', err)
    error.value = err.code === 'permission-denied' 
      ? t('Permission denied. Please check your admin access.')
      : t('Failed to load order details')
  } finally {
    loading.value = false
  }
}

const updateOrderStatus = async () => {
  if (!order.value) return
  
  const confirmed = await showConfirmation({
    title: t('Update Order Status'),
    message: t('Are you sure you want to update this order status?'),
    confirmText: t('Yes, Update'),
    cancelText: t('Cancel'),
    type: 'warning'
  })
  
  if (!confirmed) return
  
  updating.value = true
  
  try {
    const success = await ordersStore.updateOrderStatus(
      order.value.id,
      statusForm.status as any,
      statusForm.trackingNumber,
      statusForm.note
    )
    
    if (success) {
      authNotification.loggedIn(t('Order status updated successfully')) // Changed from success
      await fetchOrder()
    }
  } catch (err) {
    authNotification.error(t('Failed to update order status'))
  } finally {
    updating.value = false
  }
}

const updatePaymentStatus = async () => {
  if (!order.value) return
  
  updatingPayment.value = true
  
  try {
    const success = await ordersStore.updatePaymentStatus(
      order.value.id,
      paymentStatusForm.status
    )
    
    if (success) {
      showPaymentStatusModal.value = false
      await fetchOrder()
      authNotification.loggedIn(t('Payment status updated successfully')) // Changed from success
    }
  } catch (err) {
    authNotification.error(t('Failed to update payment status'))
  } finally {
    updatingPayment.value = false
  }
}

const resetStatusForm = () => {
  if (order.value) {
    statusForm.status = order.value.status
    statusForm.trackingNumber = order.value.trackingNumber || ''
    statusForm.note = ''
  }
}

const saveNotes = async () => {
  if (!order.value) return
  
  savingNotes.value = true
  
  try {
    await ordersStore.updateOrder(order.value.id, {
      adminNotes: adminNotes.value
    })
    authNotification.loggedIn(t('Notes saved successfully')) // Changed from success
  } catch (err) {
    authNotification.error(t('Failed to save notes'))
  } finally {
    savingNotes.value = false
  }
}

const printInvoice = () => {
  window.print()
}

const sendEmailNotification = async () => {
  if (!order.value) return
  
  try {
    // In a real app, you'd call an API endpoint here
    authNotification.loggedIn(t('Email notification sent to customer')) // Changed from success
  } catch (err) {
    authNotification.error(t('Failed to send email'))
  }
}

watch(() => route.params.orderId, () => {
  if (authStore.isAdmin) {
    fetchOrder()
  }
})

onMounted(() => {
  if (authStore.isAdmin) {
    fetchOrder()
  } else {
    loading.value = false
    error.value = t('Admin access required')
  }
})
</script>

<style scoped>
.admin-order-details-page {
  padding: 1rem;
}

@media (min-width: 640px) {
  .admin-order-details-page {
    padding: 2rem;
  }
}

@media print {
  .admin-order-details-page {
    padding: 0;
  }
  
  button,
  .bg-gold-500,
  form,
  [class*="modal"] {
    display: none !important;
  }
}
</style>