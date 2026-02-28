<!-- src/pages/Admin/OrdersPage.vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- New Orders Notification Banner -->
    <div v-if="showNewOrdersNotification" class="fixed top-20 right-4 z-50 max-w-md bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 animate-slide-in">
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0">
          <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="flex-1">
          <h3 class="font-semibold text-green-800">{{ newOrdersCount }} New Order{{ newOrdersCount > 1 ? 's' : '' }} Received!</h3>
          <p class="text-sm text-green-600 mt-1">Click refresh to see the latest orders</p>
          <div class="flex gap-2 mt-3">
            <button 
              @click="refreshOrders" 
              class="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
            >
              Refresh Now
            </button>
            <button 
              @click="dismissNotification" 
              class="px-3 py-1.5 border border-green-300 text-green-700 text-sm rounded-lg hover:bg-green-50"
            >
              Dismiss
            </button>
          </div>
        </div>
        <button @click="dismissNotification" class="text-green-600 hover:text-green-800">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-display-en font-bold text-gray-900">
              {{ t('Orders Management') }}
            </h1>
            <p class="text-gray-600 mt-1">
              {{ t('View and manage customer orders') }}
            </p>
          </div>
          <div class="flex items-center gap-4">
            <!-- Date Filter -->
            <div class="relative">
              <input
                type="date"
                v-model="dateFilter"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <!-- Export Button -->
            <button
              @click="exportOrders"
              :disabled="ordersStore.loading || ordersStore.orders.length === 0"
              class="px-4 py-2 border border-primary-500 text-primary-500 rounded-lg hover:bg-primary-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              {{ t('Export') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="p-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Orders -->
        <div class="bg-white rounded-xl shadow-luxury p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">{{ t('Total Orders') }}</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                {{ ordersStore.orders.length }}
              </p>
              <p class="text-sm text-gray-500 mt-1">
                {{ t('All time') }}
              </p>
            </div>
            <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Pending Orders -->
        <div class="bg-white rounded-xl shadow-luxury p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">{{ t('Pending') }}</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                {{ ordersStore.pendingOrdersCount }}
              </p>
              <p class="text-sm text-gray-500 mt-1">
                {{ t('Awaiting processing') }}
              </p>
            </div>
            <div class="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Completed Orders -->
        <div class="bg-white rounded-xl shadow-luxury p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">{{ t('Completed') }}</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                {{ ordersStore.completedOrdersCount }}
              </p>
              <p class="text-sm text-gray-500 mt-1">
                {{ t('Successfully delivered') }}
              </p>
            </div>
            <div class="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Revenue -->
        <div class="bg-white rounded-xl shadow-luxury p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">{{ t('Total Revenue') }}</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                EGP {{ formatCurrency(ordersStore.totalRevenue) }}
              </p>
              <p class="text-sm text-gray-500 mt-1">
                {{ t('From delivered orders') }}
              </p>
            </div>
            <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Orders Table -->
      <div class="bg-white rounded-xl shadow-luxury overflow-hidden">
        <!-- Filters -->
        <div class="p-6 border-b border-gray-200">
          <div class="flex flex-wrap items-center gap-4">
            <!-- Status Filter -->
            <select
              v-model="statusFilter"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              @change="applyFilters"
            >
              <option value="">{{ t('All Statuses') }}</option>
              <option value="pending">{{ t('Pending') }}</option>
              <option value="processing">{{ t('Processing') }}</option>
              <option value="shipped">{{ t('Shipped') }}</option>
              <option value="delivered">{{ t('Delivered') }}</option>
              <option value="cancelled">{{ t('Cancelled') }}</option>
            </select>

            <!-- Search -->
            <div class="relative flex-1 min-w-[200px]">
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="t('Search by order ID, customer name, email...')"
                class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                @input="debouncedSearch"
              />
              <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>

            <!-- Clear Filters -->
            <button
              v-if="hasActiveFilters"
              @click="clearFilters"
              class="px-4 py-2 text-gray-600 hover:text-primary-600"
            >
              {{ t('Clear Filters') }}
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="ordersStore.loading" class="p-12 text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          <p class="text-gray-600 mt-4">{{ t('Loading orders...') }}</p>
        </div>

        <!-- Error State -->
        <div v-else-if="ordersStore.error" class="p-12 text-center">
          <div class="w-16 h-16 mx-auto mb-4 text-red-300">
            <svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" 
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">
            {{ t('Error loading orders') }}
          </h3>
          <p class="text-gray-600 mb-4">{{ ordersStore.error }}</p>
          <button
            @click="fetchOrders"
            class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            {{ t('Try Again') }}
          </button>
        </div>

        <!-- Orders Table -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ t('Order ID') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ t('Customer') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ t('Date') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ t('Amount') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ t('Status') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ t('Actions') }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr 
                v-for="order in paginatedOrders" 
                :key="order.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    #{{ order.orderNumber }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ order.items?.length || 0 }} {{ t('items') }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ order.customer?.name || t('Guest') }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ order.customer?.email || order.userEmail || t('No email') }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(order.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-bold text-gray-900">
                    EGP {{ formatCurrency(order.total) }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ getPaymentMethodText(order.paymentMethod) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusClasses(order.status)" class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full">
                    {{ getStatusText(order.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex items-center gap-3">
                    <button
                      @click="viewOrder(order)"
                      class="text-primary-600 hover:text-primary-700"
                      :title="t('View Details')"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    </button>
                    <button
                      @click="updateStatus(order)"
                      class="text-gray-600 hover:text-primary-600"
                      :title="t('Update Status')"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button
                      @click="printInvoice(order)"
                      class="text-gray-600 hover:text-primary-600"
                      :title="t('Print Invoice')"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="!ordersStore.loading && !ordersStore.error && filteredOrders.length === 0" class="p-12 text-center">
          <div class="w-16 h-16 mx-auto mb-4 text-gray-300">
            <svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" 
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">
            {{ t('No orders found') }}
          </h3>
          <p class="text-gray-600">
            {{ hasActiveFilters ? t('Try adjusting your filters') : t('No orders have been placed yet') }}
          </p>
        </div>

        <!-- Pagination -->
        <div v-if="!ordersStore.loading && !ordersStore.error && filteredOrders.length > 0" class="px-6 py-4 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700">
              {{ t('Showing') }} 
              <span class="font-medium">{{ startIndex + 1 }}</span>
              {{ t('to') }}
              <span class="font-medium">{{ endIndex }}</span>
              {{ t('of') }}
              <span class="font-medium">{{ filteredOrders.length }}</span>
              {{ t('orders') }}
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="prevPage"
                :disabled="currentPage === 1"
                class="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {{ t('Previous') }}
              </button>
              <span class="px-3 py-1 text-sm text-gray-700">
                {{ currentPage }} / {{ totalPages }}
              </span>
              <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {{ t('Next') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Details Modal -->
    <div 
      v-if="selectedOrder"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
      @click.self="selectedOrder = null"
    >
      <div class="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-gray-900">
              {{ t('Order Details') }} #{{ selectedOrder.orderNumber }}
            </h3>
            <button
              @click="selectedOrder = null"
              class="text-gray-400 hover:text-gray-500"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="p-6">
          <!-- Order Summary -->
          <div class="grid md:grid-cols-2 gap-8 mb-8">
            <!-- Customer Information -->
            <div>
              <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                {{ t('Customer Information') }}
              </h4>
              <div class="space-y-3">
                <div>
                  <p class="text-sm text-gray-600">{{ t('Name') }}</p>
                  <p class="font-medium">{{ selectedOrder.customer?.name || t('Guest') }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">{{ t('Email') }}</p>
                  <p class="font-medium">{{ selectedOrder.customer?.email || selectedOrder.userEmail || t('N/A') }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">{{ t('Phone') }}</p>
                  <p class="font-medium">{{ selectedOrder.customer?.phone || t('N/A') }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">{{ t('Shipping Address') }}</p>
                  <p class="font-medium">
                    {{ getShippingAddress(selectedOrder) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Order Information -->
            <div>
              <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                {{ t('Order Information') }}
              </h4>
              <div class="space-y-3">
                <div>
                  <p class="text-sm text-gray-600">{{ t('Order Date') }}</p>
                  <p class="font-medium">{{ formatDate(selectedOrder.createdAt) }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">{{ t('Status') }}</p>
                  <span :class="getStatusClasses(selectedOrder.status)" class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full">
                    {{ getStatusText(selectedOrder.status) }}
                  </span>
                </div>
                <div>
                  <p class="text-sm text-gray-600">{{ t('Payment Method') }}</p>
                  <p class="font-medium">{{ getPaymentMethodText(selectedOrder.paymentMethod) }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">{{ t('Payment Status') }}</p>
                  <span :class="getPaymentStatusClasses(selectedOrder.paymentStatus || 'pending')" class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full">
                    {{ getPaymentStatusText(selectedOrder.paymentStatus || 'pending') }}
                  </span>
                </div>
                <div v-if="selectedOrder.trackingNumber">
                  <p class="text-sm text-gray-600">{{ t('Tracking Number') }}</p>
                  <p class="font-medium">{{ selectedOrder.trackingNumber }}</p>
                </div>
                <div v-if="selectedOrder.guestId">
                  <p class="text-sm text-gray-600">{{ t('Guest Order') }}</p>
                  <p class="font-medium text-xs text-gray-500">{{ selectedOrder.guestId }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="mb-8">
            <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              {{ t('Order Items') }}
            </h4>
            <div v-if="selectedOrder.items && selectedOrder.items.length > 0" class="border border-gray-200 rounded-lg overflow-hidden">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ t('Product') }}
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ t('Price') }}
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ t('Quantity') }}
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ t('Total') }}
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="item in selectedOrder.items" :key="item.id">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="h-10 w-10 flex-shrink-0">
                          <img :src="item.image || '/images/default-product.jpg'" 
                               :alt="item.name || 'Product'" 
                               class="h-10 w-10 rounded object-cover"
                               @error="handleImageError">
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">
                            {{ item.name || t('Unnamed Product') }}
                          </div>
                          <div class="text-sm text-gray-500">
                            {{ item.size }} • {{ item.concentration }}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      EGP {{ formatCurrency(item.price) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ item.quantity || 1 }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      EGP {{ formatCurrency((item.price || 0) * (item.quantity || 1)) }}
                    </td>
                  </tr>
                </tbody>
                <tfoot class="bg-gray-50">
                  <tr>
                    <td colspan="3" class="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      {{ t('Subtotal') }}
                    </td>
                    <td class="px-6 py-4 text-sm font-bold text-gray-900">
                      EGP {{ formatCurrency(selectedOrder.subtotal || 0) }}
                    </td>
                  </tr>
                  <tr>
                    <td colspan="3" class="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      {{ t('Shipping') }}
                    </td>
                    <td class="px-6 py-4 text-sm font-bold text-gray-900">
                      EGP {{ formatCurrency(selectedOrder.shipping || 0) }}
                    </td>
                  </tr>
                  <tr v-if="selectedOrder.tax">
                    <td colspan="3" class="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      {{ t('Tax') }}
                    </td>
                    <td class="px-6 py-4 text-sm font-bold text-gray-900">
                      EGP {{ formatCurrency(selectedOrder.tax) }}
                    </td>
                  </tr>
                  <tr>
                    <td colspan="3" class="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      {{ t('Total') }}
                    </td>
                    <td class="px-6 py-4 text-sm font-bold text-primary-600">
                      EGP {{ formatCurrency(selectedOrder.total || 0) }}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div v-else class="text-center py-8 text-gray-500">
              {{ t('No items found in this order') }}
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end gap-3">
            <button
              @click="printInvoice(selectedOrder)"
              class="px-4 py-2 border border-primary-500 text-primary-500 rounded-lg hover:bg-primary-50"
            >
              {{ t('Print Invoice') }}
            </button>
            <button
              @click="updateStatus(selectedOrder)"
              class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              {{ t('Update Status') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Update Status Modal -->
    <div 
      v-if="showStatusModal"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      @click.self="showStatusModal = false"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4">
          {{ t('Update Order Status') }} #{{ orderToUpdate?.orderNumber }}
        </h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('Select Status') }}
            </label>
            <select
              v-model="newStatus"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="pending">{{ t('Pending') }}</option>
              <option value="processing">{{ t('Processing') }}</option>
              <option value="shipped">{{ t('Shipped') }}</option>
              <option value="delivered">{{ t('Delivered') }}</option>
              <option value="cancelled">{{ t('Cancelled') }}</option>
            </select>
          </div>
          <div v-if="newStatus === 'shipped' || newStatus === 'delivered'">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('Tracking Number') }}
            </label>
            <input
              v-model="trackingNumber"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              :placeholder="t('Enter tracking number')"
            />
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="showStatusModal = false"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            {{ t('Cancel') }}
          </button>
          <button
            @click="confirmStatusUpdate"
            :disabled="ordersStore.loading"
            class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="ordersStore.loading" class="flex items-center gap-2">
              <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ t('Updating...') }}
            </span>
            <span v-else>{{ t('Update') }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useLanguageStore } from '@/stores/language'
import { useOrdersStore } from '@/stores/orders'
import type { Order, OrderStatus } from '@/types'
import debounce from 'lodash/debounce'
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { authNotification } from '@/utils/notifications'

const languageStore = useLanguageStore()
const ordersStore = useOrdersStore()
// Removed unused authStore
const { t } = languageStore

// Real-time listener
let unsubscribeOrders: (() => void) | null = null
const newOrdersCount = ref(0)
const showNewOrdersNotification = ref(false)
const lastOrderCount = ref(0)

// Filters and search
const searchQuery = ref('')
const statusFilter = ref<OrderStatus | ''>('')
const dateFilter = ref('')

// Pagination
const currentPage = ref(1)
const itemsPerPage = 10

// Modals
const selectedOrder = ref<Order | null>(null)
const showStatusModal = ref(false)
const orderToUpdate = ref<Order | null>(null)
const newStatus = ref<OrderStatus>('pending')
const trackingNumber = ref('')

// Helper function to format shipping address
const getShippingAddress = (order: any) => {
  if (typeof order.shippingAddress === 'object') {
    return `${order.shippingAddress.address || ''}, ${order.shippingAddress.city || ''}, ${order.shippingAddress.country || ''}`.replace(/^, |, $/g, '')
  }
  return order.shippingAddress || order.customer?.address || t('N/A')
}

// Computed properties (unchanged)
const filteredOrders = computed(() => {
  let filtered = [...ordersStore.orders]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(order => {
      const orderNumber = order.orderNumber?.toLowerCase() || ''
      const customerName = order.customer?.name?.toLowerCase() || ''
      const customerEmail = order.customer?.email?.toLowerCase() || order.userEmail?.toLowerCase() || ''
      
      return orderNumber.includes(query) ||
             customerName.includes(query) ||
             customerEmail.includes(query)
    })
  }

  if (statusFilter.value) {
    filtered = filtered.filter(order => order.status === statusFilter.value)
  }

  if (dateFilter.value) {
    const selectedDate = new Date(dateFilter.value).toDateString()
    filtered = filtered.filter(order => {
      const orderDate = new Date(order.createdAt).toDateString()
      return orderDate === selectedDate
    })
  }

  return filtered
})

const hasActiveFilters = computed(() => {
  return searchQuery.value || statusFilter.value || dateFilter.value
})

const totalPages = computed(() => {
  return Math.ceil(filteredOrders.value.length / itemsPerPage)
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * itemsPerPage
})

const endIndex = computed(() => {
  return Math.min(startIndex.value + itemsPerPage, filteredOrders.value.length)
})

const paginatedOrders = computed(() => {
  return filteredOrders.value.slice(startIndex.value, endIndex.value)
})

// Methods (unchanged except for setupOrdersListener)
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace('EGP', 'LE ')
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusClasses = (status: OrderStatus) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusText = (status: OrderStatus) => {
  const texts = {
    pending: t('Pending'),
    processing: t('Processing'),
    shipped: t('Shipped'),
    delivered: t('Delivered'),
    cancelled: t('Cancelled')
  }
  return texts[status] || status
}

const getPaymentMethodText = (method: string) => {
  const methods: Record<string, string> = {
    cash_on_delivery: t('Cash on Delivery'),
    credit_card: t('Credit Card'),
    bank_transfer: t('Bank Transfer')
  }
  return methods[method] || method || t('N/A')
}

const getPaymentStatusClasses = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-emerald-100 text-emerald-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getPaymentStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: t('Pending'),
    paid: t('Paid'),
    failed: t('Failed'),
    refunded: t('Refunded')
  }
  return texts[status] || status
}

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.src = '/images/default-product.jpg'
}

const viewOrder = async (order: Order) => {
  try {
    const fetchedOrder = await ordersStore.fetchOrderById(order.id)
    selectedOrder.value = fetchedOrder || order
  } catch (err) {
    console.error('Error fetching order details:', err)
    selectedOrder.value = order
  }
}

const updateStatus = (order: Order) => {
  orderToUpdate.value = order
  newStatus.value = order.status
  trackingNumber.value = order.trackingNumber || ''
  showStatusModal.value = true
}

const confirmStatusUpdate = async () => {
  if (!orderToUpdate.value) return

  try {
    const success = await ordersStore.updateOrderStatus(
      orderToUpdate.value.id,
      newStatus.value,
      trackingNumber.value
    )
    
    if (success) {
      if (selectedOrder.value && selectedOrder.value.id === orderToUpdate.value.id) {
        selectedOrder.value.status = newStatus.value
        if (trackingNumber.value) {
          selectedOrder.value.trackingNumber = trackingNumber.value
        }
      }
      
      showStatusModal.value = false
      orderToUpdate.value = null
      authNotification.loggedIn(t('Order status updated successfully'))
    }
  } catch (err) {
    console.error('Error updating order status:', err)
    authNotification.error(t('Failed to update order status'))
  }
}

const printInvoice = (order: Order) => {
  ordersStore.downloadInvoice(order.id)
}

const exportOrders = async () => {
  try {
    const headers = ['Order ID', 'Customer Name', 'Customer Email', 'Customer Phone', 'Date', 'Amount', 'Status', 'Payment Method', 'Payment Status']
    const csvData = filteredOrders.value.map(order => [
      order.orderNumber,
      order.customer?.name || 'Guest',
      order.customer?.email || order.userEmail || '',
      order.customer?.phone || '',
      new Date(order.createdAt).toLocaleDateString(),
      `EGP ${order.total?.toFixed(2) || '0.00'}`,
      getStatusText(order.status),
      getPaymentMethodText(order.paymentMethod),
      getPaymentStatusText(order.paymentStatus || 'pending')
    ])

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `orders-${new Date().toISOString().split('T')[0]}.csv`)
    link.click()
    URL.revokeObjectURL(url)
    
    authNotification.loggedIn(t('Orders exported successfully'))
  } catch (err) {
    console.error('Error exporting orders:', err)
    authNotification.error(t('Failed to export orders'))
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  dateFilter.value = ''
  currentPage.value = 1
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const applyFilters = () => {
  currentPage.value = 1
}

const debouncedSearch = debounce(() => {
  currentPage.value = 1
}, 300)

const fetchOrders = async () => {
  await ordersStore.fetchOrders({ limit: 100 })
}

const refreshOrders = async () => {
  await ordersStore.fetchOrders({ limit: 100 })
  newOrdersCount.value = 0
  showNewOrdersNotification.value = false
  lastOrderCount.value = ordersStore.orders.length
}

const dismissNotification = () => {
  showNewOrdersNotification.value = false
  lastOrderCount.value = ordersStore.orders.length
}

// Setup real-time listener for orders – now using store actions
const setupOrdersListener = () => {
  const ordersRef = collection(db, 'orders')
  const q = query(ordersRef, orderBy('createdAt', 'desc'), limit(50))
  
  unsubscribeOrders = onSnapshot(q, (snapshot) => {
    if (ordersStore.orders.length === 0) {
      // First load – set orders via store action
      const newOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order))
      ordersStore.setOrders(newOrders)
      lastOrderCount.value = newOrders.length
    } else {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const newOrder = {
            id: change.doc.id,
            ...change.doc.data()
          } as Order
          ordersStore.addOrder(newOrder)
          newOrdersCount.value++
          showNewOrdersNotification.value = true
          playNotificationSound()
          if (Notification.permission === 'granted') {
            new Notification('🛍️ New Order Received!', {
              body: `Order #${newOrder.orderNumber} - EGP ${newOrder.total?.toFixed(2)}`,
              icon: '/favicon.ico'
            })
          }
          authNotification.loggedIn(`New order #${newOrder.orderNumber} received`)
        }
      })
    }
  }, (error) => {
    console.error('Error in orders listener:', error)
  })
}

const playNotificationSound = () => {
  const audio = new Audio('/sounds/notification.mp3')
  audio.play().catch(e => console.log('Audio play failed:', e))
}

const requestNotificationPermission = () => {
  if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
    Notification.requestPermission()
  }
}

onMounted(async () => {
  await fetchOrders()
  setupOrdersListener()
  requestNotificationPermission()
  lastOrderCount.value = ordersStore.orders.length
})

onUnmounted(() => {
  if (unsubscribeOrders) {
    unsubscribeOrders()
  }
})

watch([statusFilter, dateFilter], () => {
  applyFilters()
})
</script>

<style scoped>
.shadow-luxury {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.transition-colors {
  transition: all 0.2s ease-in-out;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Animation */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}
</style>