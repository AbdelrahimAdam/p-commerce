<!-- src/pages/Admin/CustomersPage.vue -->
<template>
  <div class="customers-page p-4 sm:p-6">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 mb-1">{{ t('Customers') }}</h1>
        <p class="text-gray-600">{{ t('Manage all registered customers') }}</p>
      </div>

      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <!-- Search -->
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('Search customers...')"
            class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full sm:w-64"
            @input="debouncedSearch"
          >
          <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>

        <!-- Export Button -->
        <button 
          @click="exportCustomers"
          :disabled="loading || filteredCustomers.length === 0"
          class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <span class="hidden sm:inline">{{ t('Export') }}</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && customers.length === 0" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      <p class="text-gray-600 mt-4">{{ t('Loading customers...') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <div class="w-16 h-16 mx-auto mb-4 text-red-300">
        <svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <h3 class="text-xl font-bold text-gray-900 mb-2">{{ t('Error loading customers') }}</h3>
      <p class="text-gray-600 mb-4">{{ error }}</p>
      <button
        @click="loadCustomers"
        class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 min-h-[44px]"
      >
        {{ t('Try Again') }}
      </button>
    </div>

    <!-- Stats Cards -->
    <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl p-4 shadow border">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">{{ t('Total Customers') }}</p>
            <p class="text-2xl font-bold">{{ stats.totalCustomers.toLocaleString() }}</p>
          </div>
          <div class="p-3 bg-blue-100 rounded-full">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
        </div>
        <p class="text-xs text-green-600 mt-2">
          <span class="font-semibold">{{ stats.growthRate }}%</span> {{ t('from last month') }}
        </p>
      </div>

      <div class="bg-white rounded-xl p-4 shadow border">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">{{ t('Active Customers') }}</p>
            <p class="text-2xl font-bold">{{ stats.activeCustomers.toLocaleString() }}</p>
          </div>
          <div class="p-3 bg-green-100 rounded-full">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>
        <p class="text-xs text-green-600 mt-2">
          {{ Math.round((stats.activeCustomers / stats.totalCustomers) * 100) }}% {{ t('of total customers') }}
        </p>
      </div>

      <div class="bg-white rounded-xl p-4 shadow border">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">{{ t('Customers with Orders') }}</p>
            <p class="text-2xl font-bold">{{ customersWithOrders.length.toLocaleString() }}</p>
          </div>
          <div class="p-3 bg-purple-100 rounded-full">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
          </div>
        </div>
        <p class="text-xs text-green-600 mt-2">
          {{ Math.round((customersWithOrders.length / stats.totalCustomers) * 100) }}% {{ t('of total customers') }}
        </p>
      </div>

      <div class="bg-white rounded-xl p-4 shadow border">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">{{ t('Avg. Order Value') }}</p>
            <p class="text-2xl font-bold">{{ formatCurrency(stats.avgOrderValue) }}</p>
          </div>
          <div class="p-3 bg-yellow-100 rounded-full">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>
        <p class="text-xs text-green-600 mt-2">
          {{ t('Across all orders') }}
        </p>
      </div>
    </div>

    <!-- Customers Table -->
    <div v-if="!loading" class="bg-white rounded-xl shadow border overflow-hidden">
      <!-- Mobile card view (visible on small screens) -->
      <div class="block md:hidden">
        <div v-for="customer in paginatedCustomers" :key="customer.id" class="p-4 border-b last:border-0">
          <div class="flex items-start gap-3">
            <input 
              type="checkbox" 
              class="mt-1 w-4 h-4 rounded border-gray-300"
              v-model="selectedCustomers"
              :value="customer.id"
            >
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold">
                  <span>{{ getInitials(customer.name || customer.displayName || 'Customer') }}</span>
                </div>
                <div>
                  <p class="font-medium">{{ customer.name || customer.displayName || 'N/A' }}</p>
                  <p class="text-xs text-gray-500">ID: {{ customer.id.slice(0, 8) }}</p>
                </div>
              </div>
              <div class="mt-2 space-y-1 text-sm">
                <p><span class="font-medium text-gray-600">{{ t('Email') }}:</span> {{ customer.email }}</p>
                <p><span class="font-medium text-gray-600">{{ t('Phone') }}:</span> {{ customer.phone || '-' }}</p>
                <p><span class="font-medium text-gray-600">{{ t('Orders') }}:</span> {{ customer.orders || 0 }}</p>
                <p><span class="font-medium text-gray-600">{{ t('Total Spent') }}:</span> {{ formatCurrency(customer.totalSpent || 0) }}</p>
                <p><span class="font-medium text-gray-600">{{ t('Last Order') }}:</span> {{ customer.lastOrder ? formatDate(customer.lastOrder) : t('Never') }}</p>
                <div class="flex items-center gap-2 mt-2">
                  <span :class="[
                    'px-2 py-0.5 rounded-full text-xs font-medium',
                    customer.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : customer.status === 'inactive'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                  ]">
                    {{ getStatusText(customer.status) }}
                  </span>
                  <div class="flex gap-1 ml-auto">
                    <button 
                      @click="viewCustomer(customer)"
                      class="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                      :title="t('View Details')"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    </button>
                    <button 
                      @click="editCustomer(customer)"
                      class="p-2 text-gray-500 hover:text-yellow-600 transition-colors"
                      :title="t('Edit')"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button 
                      @click="viewCustomerOrders(customer)"
                      class="p-2 text-gray-500 hover:text-purple-600 transition-colors"
                      :title="t('View Orders')"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                      </svg>
                    </button>
                    <button 
                      @click="deleteCustomer(customer.id)"
                      class="p-2 text-gray-500 hover:text-red-600 transition-colors"
                      :title="t('Delete')"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop table view -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                <div class="flex items-center gap-2">
                  <input type="checkbox" class="rounded border-gray-300 w-4 h-4" v-model="selectAll">
                  {{ t('Customer') }}
                </div>
              </th>
              <th class="py-3 px-4 text-left text-sm font-semibold text-gray-700">{{ t('Email') }}</th>
              <th class="py-3 px-4 text-left text-sm font-semibold text-gray-700">{{ t('Phone') }}</th>
              <th class="py-3 px-4 text-left text-sm font-semibold text-gray-700">{{ t('Orders') }}</th>
              <th class="py-3 px-4 text-left text-sm font-semibold text-gray-700">{{ t('Total Spent') }}</th>
              <th class="py-3 px-4 text-left text-sm font-semibold text-gray-700">{{ t('Last Order') }}</th>
              <th class="py-3 px-4 text-left text-sm font-semibold text-gray-700">{{ t('Status') }}</th>
              <th class="py-3 px-4 text-left text-sm font-semibold text-gray-700">{{ t('Actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="customer in paginatedCustomers" :key="customer.id" class="hover:bg-gray-50">
              <td class="py-4 px-4">
                <div class="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    class="rounded border-gray-300 w-4 h-4"
                    v-model="selectedCustomers"
                    :value="customer.id"
                  >
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold">
                    <span>{{ getInitials(customer.name || customer.displayName || 'Customer') }}</span>
                  </div>
                  <div>
                    <p class="font-medium">{{ customer.name || customer.displayName || 'N/A' }}</p>
                    <p class="text-sm text-gray-500">ID: {{ customer.id.slice(0, 8) }}</p>
                  </div>
                </div>
              </td>
              <td class="py-4 px-4">
                <p class="text-sm">{{ customer.email }}</p>
              </td>
              <td class="py-4 px-4">
                <p class="text-sm">{{ customer.phone || '-' }}</p>
              </td>
              <td class="py-4 px-4">
                <span :class="[
                  'px-3 py-1 rounded-full text-sm font-medium',
                  customer.orders > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                ]">
                  {{ customer.orders || 0 }}
                </span>
              </td>
              <td class="py-4 px-4 font-medium">
                {{ formatCurrency(customer.totalSpent || 0) }}
              </td>
              <td class="py-4 px-4 text-sm text-gray-600">
                {{ customer.lastOrder ? formatDate(customer.lastOrder) : t('Never') }}
              </td>
              <td class="py-4 px-4">
                <span :class="[
                  'px-3 py-1 rounded-full text-sm',
                  customer.status === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : customer.status === 'inactive'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-yellow-100 text-yellow-800'
                ]">
                  {{ getStatusText(customer.status) }}
                </span>
              </td>
              <td class="py-4 px-4">
                <div class="flex items-center gap-2">
                  <button 
                    @click="viewCustomer(customer)"
                    class="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                    :title="t('View Details')"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </button>
                  <button 
                    @click="editCustomer(customer)"
                    class="p-2 text-gray-500 hover:text-yellow-600 transition-colors"
                    :title="t('Edit')"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  <button 
                    @click="viewCustomerOrders(customer)"
                    class="p-2 text-gray-500 hover:text-purple-600 transition-colors"
                    :title="t('View Orders')"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                  </button>
                  <button 
                    @click="deleteCustomer(customer.id)"
                    class="p-2 text-gray-500 hover:text-red-600 transition-colors"
                    :title="t('Delete')"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="filteredCustomers.length === 0" class="py-12 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">{{ t('No customers found') }}</h3>
        <p class="mt-1 text-gray-500">{{ t('Try adjusting your search or filter') }}</p>
      </div>

      <!-- Pagination -->
      <div v-if="filteredCustomers.length > 0" class="px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
        <p class="text-sm text-gray-700">
          {{ t('Showing') }} 
          <span class="font-medium">{{ startIndex + 1 }}</span>
          {{ t('to') }}
          <span class="font-medium">{{ endIndex }}</span>
          {{ t('of') }} 
          <span class="font-medium">{{ filteredCustomers.length }}</span>
          {{ t('customers') }}
        </p>
        <div class="flex gap-2">
          <button 
            @click="prevPage"
            :disabled="pagination.page === 1"
            class="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 min-h-[36px] min-w-[44px]"
          >
            {{ t('Previous') }}
          </button>
          <button 
            @click="nextPage"
            :disabled="endIndex >= filteredCustomers.length"
            class="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 min-h-[36px] min-w-[44px]"
          >
            {{ t('Next') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Customer Details Modal -->
    <div 
      v-if="selectedCustomer"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      @click.self="selectedCustomer = null"
    >
      <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-gray-900">
              {{ t('Customer Details') }}
            </h3>
            <button
              @click="selectedCustomer = null"
              class="text-gray-400 hover:text-gray-500"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="p-6" v-if="selectedCustomer">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xl font-bold">
              {{ getInitials(selectedCustomer.name || selectedCustomer.displayName || 'Customer') }}
            </div>
            <div>
              <h4 class="text-xl font-bold">{{ selectedCustomer.name || selectedCustomer.displayName || 'N/A' }}</h4>
              <p class="text-gray-600">{{ selectedCustomer.email }}</p>
              <span :class="[
                'px-3 py-1 rounded-full text-sm inline-block mt-2',
                selectedCustomer.status === 'active' 
                  ? 'bg-green-100 text-green-800'
                  : selectedCustomer.status === 'inactive'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-yellow-100 text-yellow-800'
              ]">
                {{ getStatusText(selectedCustomer.status) }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-500">{{ t('Total Orders') }}</p>
              <p class="text-2xl font-bold">{{ selectedCustomer.orders || 0 }}</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-500">{{ t('Total Spent') }}</p>
              <p class="text-2xl font-bold">{{ formatCurrency(selectedCustomer.totalSpent || 0) }}</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-500">{{ t('Last Order') }}</p>
              <p class="text-lg font-medium">{{ selectedCustomer.lastOrder ? formatDate(selectedCustomer.lastOrder) : t('Never') }}</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-500">{{ t('Phone') }}</p>
              <p class="text-lg font-medium">{{ selectedCustomer.phone || '-' }}</p>
            </div>
          </div>

          <!-- Recent Orders -->
          <div v-if="selectedCustomer.recentOrders && selectedCustomer.recentOrders.length > 0" class="mb-6">
            <h4 class="font-bold mb-3">{{ t('Recent Orders') }}</h4>
            <div class="space-y-3">
              <div v-for="order in selectedCustomer.recentOrders.slice(0, 3)" :key="order.id" 
                   class="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                   @click="viewOrder(order)">
                <div class="flex justify-between items-center">
                  <div>
                    <p class="font-medium text-primary-600">#{{ order.orderNumber }}</p>
                    <p class="text-sm text-gray-600">{{ formatDate(order.createdAt) }}</p>
                  </div>
                  <div class="text-right">
                    <p class="font-bold">{{ formatCurrency(order.total) }}</p>
                    <span :class="getStatusClasses(order.status)" class="px-2 py-1 text-xs rounded-full">
                      {{ order.status }}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                v-if="selectedCustomer.recentOrders.length > 3"
                @click="viewAllOrders(selectedCustomer)"
                class="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                {{ t('View all orders') }} →
              </button>
            </div>
          </div>

          <div v-if="selectedCustomer.addresses && selectedCustomer.addresses.length > 0">
            <h4 class="font-bold mb-3">{{ t('Saved Addresses') }}</h4>
            <div class="space-y-3">
              <div v-for="(address, index) in selectedCustomer.addresses" :key="index" 
                   class="border rounded-lg p-4">
                <p class="font-medium">{{ address.name }}</p>
                <p class="text-sm text-gray-600">{{ address.address }}</p>
                <p class="text-sm text-gray-600">{{ address.city }}, {{ address.country }}</p>
                <p class="text-sm text-gray-600">{{ address.phone }}</p>
                <span v-if="address.isDefault" class="text-xs text-primary-600 font-medium mt-2 inline-block">
                  {{ t('Default Address') }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Customer Orders Modal -->
    <div 
      v-if="showOrdersModal"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      @click.self="showOrdersModal = false"
    >
      <div class="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-gray-900">
              {{ t('Customer Orders') }} - {{ selectedCustomer?.name || selectedCustomer?.displayName }}
            </h3>
            <button
              @click="showOrdersModal = false"
              class="text-gray-400 hover:text-gray-500"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="p-6">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{ t('Order #') }}</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{ t('Date') }}</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{ t('Items') }}</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{ t('Total') }}</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{ t('Status') }}</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{ t('Payment') }}</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="order in customerOrders" :key="order.id" class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm font-medium text-primary-600">#{{ order.orderNumber }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ formatDate(order.createdAt) }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ order.items?.length || 0 }}</td>
                  <td class="px-4 py-3 text-sm font-medium">{{ formatCurrency(order.total) }}</td>
                  <td class="px-4 py-3">
                    <span :class="getStatusClasses(order.status)" class="px-2 py-1 text-xs rounded-full">
                      {{ order.status }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ order.paymentMethod }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguageStore } from '@/stores/language'
import { useAuthStore } from '@/stores/auth'
import { collection, getDocs, query, orderBy, limit, where, doc, deleteDoc, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { showConfirmation } from '@/utils/confirmation'
import debounce from 'lodash/debounce'

const router = useRouter()
const languageStore = useLanguageStore()
const authStore = useAuthStore()

// Admin guard
if (!authStore.isAdmin) {
  router.push('/admin')
}

const { t } = languageStore

// State
const loading = ref(false)
const error = ref<string | null>(null)
const customers = ref<any[]>([])
const allOrders = ref<any[]>([])
const searchQuery = ref('')
const selectedCustomers = ref<string[]>([])
const selectedCustomer = ref<any | null>(null)
const customerOrders = ref<any[]>([])
const showOrdersModal = ref(false)
const lastVisible = ref<QueryDocumentSnapshot<DocumentData> | null>(null)
const hasMore = ref(true)

const pagination = ref({
  page: 1,
  perPage: 10
})

// Stats
const stats = ref({
  totalCustomers: 0,
  activeCustomers: 0,
  newThisMonth: 0,
  avgOrderValue: 0,
  growthRate: 0
})

// Computed
const customersWithOrders = computed(() => {
  return customers.value.filter(c => c.orders > 0)
})

const filteredCustomers = computed(() => {
  let result = customers.value
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(customer => 
      (customer.name?.toLowerCase() || customer.displayName?.toLowerCase() || '').includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.phone?.toLowerCase().includes(query) ||
      customer.id?.toLowerCase().includes(query)
    )
  }
  
  return result
})

const paginatedCustomers = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.perPage
  const end = start + pagination.value.perPage
  return filteredCustomers.value.slice(start, end)
})

const startIndex = computed(() => {
  return (pagination.value.page - 1) * pagination.value.perPage
})

const endIndex = computed(() => {
  return Math.min(startIndex.value + pagination.value.perPage, filteredCustomers.value.length)
})

const selectAll = computed({
  get: () => {
    return filteredCustomers.value.length > 0 && 
           selectedCustomers.value.length === filteredCustomers.value.length
  },
  set: (value) => {
    if (value) {
      selectedCustomers.value = filteredCustomers.value.map(c => c.id)
    } else {
      selectedCustomers.value = []
    }
  }
})

// Methods
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace('EGP', 'LE ')
}

const formatDate = (date: Date | string) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    active: t('Active'),
    inactive: t('Inactive'),
    pending: t('Pending')
  }
  return texts[status] || status || t('Active')
}

const getStatusClasses = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const loadOrders = async () => {
  const tenantId = authStore.currentTenant
  if (!tenantId) {
    console.warn('No tenant ID – cannot load orders')
    return {}
  }

  try {
    const ordersCollection = collection(db, 'orders')
    const q = query(
      ordersCollection,
      where('tenantId', '==', tenantId),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    
    allOrders.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    // Group orders by user
    const ordersByUser: Record<string, any[]> = {}
    allOrders.value.forEach(order => {
      const userId = order.userId
      if (userId) {
        if (!ordersByUser[userId]) {
          ordersByUser[userId] = []
        }
        ordersByUser[userId].push(order)
      }
    })
    
    return ordersByUser
  } catch (err) {
    console.error('Error loading orders:', err)
    return {}
  }
}

const loadCustomers = async () => {
  loading.value = true
  error.value = null
  
  const tenantId = authStore.currentTenant
  if (!tenantId) {
    error.value = 'Tenant not resolved. Cannot load customers.'
    loading.value = false
    return
  }

  try {
    const customersCollection = collection(db, 'customers')
    // Add tenant filter
    const q = query(
      customersCollection,
      where('tenantId', '==', tenantId),
      orderBy('createdAt', 'desc'),
      limit(50)
    )
    const querySnapshot = await getDocs(q)
    
    const ordersByUser = await loadOrders()
    
    customers.value = querySnapshot.docs.map(doc => {
      const data = doc.data()
      const userId = doc.id
      const userOrders = ordersByUser[userId] || []
      
      // Calculate order stats
      const totalSpent = userOrders.reduce((sum, order) => sum + (order.total || 0), 0)
      const lastOrder = userOrders.length > 0 ? userOrders[0].createdAt : null
      
      // Determine status based on lastLogin
      let status = 'active'
      if (data.lastLogin) {
        const lastLogin = data.lastLogin.toDate?.() || new Date(data.lastLogin)
        const daysSinceLastLogin = Math.floor((Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24))
        if (daysSinceLastLogin > 30) {
          status = 'inactive'
        }
      }
      
      return {
        id: doc.id,
        ...data,
        name: data.displayName || data.name || 'Customer',
        status,
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt || Date.now()),
        lastLogin: data.lastLogin?.toDate?.() || data.lastLogin,
        orders: userOrders.length,
        totalSpent,
        lastOrder: lastOrder ? (lastOrder.toDate?.() || new Date(lastOrder)) : null,
        recentOrders: userOrders.slice(0, 5)
      }
    })
    
    // Update lastVisible for pagination
    lastVisible.value = querySnapshot.docs[querySnapshot.docs.length - 1]
    hasMore.value = querySnapshot.docs.length === 50
    
    // Calculate stats
    await calculateStats()
    
  } catch (err: any) {
    console.error('Error loading customers:', err)
    error.value = err.message || 'Failed to load customers'
    // Use a simple notification that works (the component doesn't have a proper notification system)
    console.error('Failed to load customers:', error.value)
  } finally {
    loading.value = false
  }
}

const calculateStats = async () => {
  // Calculate total customers
  stats.value.totalCustomers = customers.value.length
  
  // Calculate active customers
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
  
  stats.value.activeCustomers = customers.value.filter(c => {
    if (!c.lastLogin) return false
    const lastLogin = new Date(c.lastLogin)
    return lastLogin > oneMonthAgo
  }).length
  
  // Calculate new this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  
  stats.value.newThisMonth = customers.value.filter(c => {
    const createdAt = new Date(c.createdAt)
    return createdAt >= startOfMonth
  }).length
  
  // Calculate growth rate
  const lastMonth = new Date()
  lastMonth.setMonth(lastMonth.getMonth() - 1)
  lastMonth.setDate(1)
  lastMonth.setHours(0, 0, 0, 0)
  
  const lastMonthCount = customers.value.filter(c => {
    const createdAt = new Date(c.createdAt)
    return createdAt >= lastMonth && createdAt < startOfMonth
  }).length
  
  stats.value.growthRate = lastMonthCount > 0 
    ? Math.round(((stats.value.newThisMonth - lastMonthCount) / lastMonthCount) * 100)
    : stats.value.newThisMonth > 0 ? 100 : 0
  
  // Calculate average order value from customers who have orders
  const customersWithOrders_ = customers.value.filter(c => c.orders > 0)
  const totalSpentAll = customersWithOrders_.reduce((sum, c) => sum + (c.totalSpent || 0), 0)
  stats.value.avgOrderValue = customersWithOrders_.length > 0 
    ? totalSpentAll / customersWithOrders_.length 
    : 0
}

const viewCustomer = (customer: any) => {
  selectedCustomer.value = customer
}

const viewCustomerOrders = (customer: any) => {
  customerOrders.value = customer.recentOrders || []
  selectedCustomer.value = customer
  showOrdersModal.value = true
}

const viewOrder = (order: any) => {
  router.push(`/admin/orders/${order.id}`)
}

const viewAllOrders = (customer: any) => {
  router.push(`/admin/orders?customerId=${customer.id}`)
}

const editCustomer = (customer: any) => {
  // Implement edit functionality
  console.log('Edit customer:', customer)
  // Show a simple alert for now (since notification system is not fully integrated)
  alert(t('Edit functionality coming soon'))
}

const deleteCustomer = async (id: string) => {
  const confirmed = await showConfirmation({
    title: t('Delete Customer'),
    message: t('Are you sure you want to delete this customer? This action cannot be undone.'),
    confirmText: t('Delete'),
    cancelText: t('Cancel'),
    type: 'warning'
  })
  
  if (confirmed) {
    try {
      await deleteDoc(doc(db, 'customers', id))
      customers.value = customers.value.filter(c => c.id !== id)
      selectedCustomers.value = selectedCustomers.value.filter(cId => cId !== id)
      alert(t('Customer deleted successfully'))
    } catch (err) {
      console.error('Error deleting customer:', err)
      alert(t('Failed to delete customer'))
    }
  }
}

const exportCustomers = () => {
  try {
    // Convert customers to CSV
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Orders', 'Total Spent', 'Last Order', 'Status', 'Created At']
    const csvData = filteredCustomers.value.map(customer => [
      customer.id,
      customer.name || customer.displayName || '',
      customer.email || '',
      customer.phone || '',
      customer.orders || 0,
      customer.totalSpent || 0,
      customer.lastOrder ? formatDate(customer.lastOrder) : '',
      customer.status || 'active',
      customer.createdAt ? formatDate(customer.createdAt) : ''
    ])

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `customers-${new Date().toISOString().split('T')[0]}.csv`)
    link.click()
    URL.revokeObjectURL(url)
    
    alert(t('Customers exported successfully'))
  } catch (err) {
    console.error('Error exporting customers:', err)
    alert(t('Failed to export customers'))
  }
}

const prevPage = () => {
  if (pagination.value.page > 1) {
    pagination.value.page--
  }
}

const nextPage = () => {
  if (endIndex.value < filteredCustomers.value.length) {
    pagination.value.page++
  }
}

const debouncedSearch = debounce(() => {
  pagination.value.page = 1
}, 300)

// Initialize
onMounted(() => {
  loadCustomers()
})
</script>

<style scoped>
.customers-page {
  min-height: calc(100vh - 80px);
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

.animate-spin {
  animation: spin 1s linear infinite;
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

/* Ensure buttons have adequate touch targets */
button {
  min-height: 44px;
  min-width: 44px;
}

@media (min-width: 768px) {
  button {
    min-height: 36px;
    min-width: 36px;
  }
}
</style>