<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="px-8 py-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-display-en font-bold text-gray-900">
              {{ t('Brands Management') }}
            </h1>
            <p class="text-gray-600 mt-1">
              {{ t('Manage your perfume brands and collections') }}
            </p>
          </div>
          <button
            @click="showAddModal = true"
            class="px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {{ t('Add New Brand') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="p-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Brands -->
        <div class="bg-white rounded-xl shadow-luxury p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">{{ t('Total Brands') }}</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                {{ brands.length }}
              </p>
              <p class="text-sm text-gray-500 mt-1">
                {{ t('All brands') }}
              </p>
            </div>
            <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Active Brands -->
        <div class="bg-white rounded-xl shadow-luxury p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">{{ t('Active Brands') }}</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                {{ activeBrandsCount }}
              </p>
              <p class="text-sm text-gray-500 mt-1">
                {{ t('Currently available') }}
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

        <!-- Total Products -->
        <div class="bg-white rounded-xl shadow-luxury p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">{{ t('Total Products') }}</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                {{ totalProducts }}
              </p>
              <p class="text-sm text-gray-500 mt-1">
                {{ t('Across all brands') }}
              </p>
            </div>
            <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Categories -->
        <div class="bg-white rounded-xl shadow-luxury p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">{{ t('Categories') }}</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                {{ categoriesCount }}
              </p>
              <p class="text-sm text-gray-500 mt-1">
                {{ t('Unique categories') }}
              </p>
            </div>
            <div class="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Brands Table -->
      <div class="bg-white rounded-xl shadow-luxury overflow-hidden">
        <!-- Filters -->
        <div class="p-6 border-b border-gray-200">
          <div class="flex flex-wrap items-center gap-4">
            <!-- Status Filter -->
            <select
              v-model="statusFilter"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">{{ t('All Statuses') }}</option>
              <option value="active">{{ t('Active') }}</option>
              <option value="inactive">{{ t('Inactive') }}</option>
            </select>

            <!-- Category Filter -->
            <select
              v-model="categoryFilter"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">{{ t('All Categories') }}</option>
              <option 
                v-for="category in uniqueCategories" 
                :key="category"
                :value="category"
              >
                {{ t(category || '') }}
              </option>
            </select>

            <!-- Search -->
            <div class="relative flex-1 min-w-[200px]">
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="t('Search by brand name...')"
                class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
        <div v-if="isLoading" class="p-12 text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          <p class="text-gray-600 mt-4">{{ t('Loading brands...') }}</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="p-12 text-center">
          <div class="w-16 h-16 mx-auto mb-4 text-red-300">
            <svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" 
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">
            {{ t('Error loading brands') }}
          </h3>
          <p class="text-gray-600 mb-4">{{ error }}</p>
          <button
            @click="loadBrands"
            class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            {{ t('Try Again') }}
          </button>
        </div>

        <!-- Brands Table -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ t('Brand') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ t('Category') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ t('Products') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ t('Status') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ t('Created') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ t('Actions') }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr 
                v-for="brand in filteredBrands" 
                :key="brand.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 flex-shrink-0">
                      <img 
                        :src="brand.image || '/images/placeholder-brand.jpg'" 
                        :alt="brand.name"
                        class="w-10 h-10 rounded object-cover"
                      />
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-900">
                        {{ brand.name }}
                      </div>
                      <div class="text-sm text-gray-500">
                        {{ brand.signature || t('No signature') }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                    {{ t(brand.category || 'Uncategorized') }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ brand.productIds?.length || 0 }} {{ t('products') }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    :class="brand.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'"
                    class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                  >
                    {{ brand.isActive ? t('Active') : t('Inactive') }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(brand.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex items-center gap-2">
                    <button
                      @click="viewBrand(brand)"
                      class="text-primary-600 hover:text-primary-700 p-1"
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
                      @click="editBrand(brand)"
                      class="text-gray-600 hover:text-primary-600 p-1"
                      :title="t('Edit')"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button
                      @click="toggleBrandStatus(brand)"
                      class="text-gray-600 hover:text-primary-600 p-1"
                      :title="brand.isActive ? t('Deactivate') : t('Activate')"
                    >
                      <svg v-if="brand.isActive" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                      </svg>
                      <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    </button>
                    <button
                      @click="confirmDelete(brand)"
                      class="text-red-600 hover:text-red-800 p-1"
                      :title="t('Delete')"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="!isLoading && !error && filteredBrands.length === 0" class="p-12 text-center">
          <div class="w-16 h-16 mx-auto mb-4 text-gray-300">
            <svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" 
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">
            {{ t('No brands found') }}
          </h3>
          <p class="text-gray-600">
            {{ hasActiveFilters ? t('Try adjusting your filters') : t('No brands have been added yet') }}
          </p>
          <button
            v-if="!hasActiveFilters"
            @click="showAddModal = true"
            class="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            {{ t('Add Your First Brand') }}
          </button>
        </div>

        <!-- Pagination -->
        <div v-if="!isLoading && !error && filteredBrands.length > 0" class="px-6 py-4 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700">
              {{ t('Showing') }} 
              <span class="font-medium">{{ filteredBrands.length }}</span>
              {{ t('of') }}
              <span class="font-medium">{{ brands.length }}</span>
              {{ t('brands') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Brand Modal -->
    <BrandFormModal
      v-if="showAddModal || editingBrand"
      :brand="editingBrand || undefined"
      @close="closeModal"
      @saved="handleBrandSaved"
    />

    <!-- Delete Confirmation Modal -->
    <div 
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6">
        <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
        </div>
        <h3 class="text-lg font-bold text-gray-900 text-center mb-2">
          {{ t('Delete Brand') }}
        </h3>
        <p class="text-gray-600 text-center mb-6">
          {{ t('Are you sure you want to delete') }} "<strong>{{ brandToDelete?.name }}</strong>"?
          {{ t('This action cannot be undone.') }}
        </p>
        <div class="flex justify-center gap-3">
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            {{ t('Cancel') }}
          </button>
          <button
            @click="deleteBrand"
            :disabled="deleting"
            class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="deleting" class="flex items-center gap-2">
              <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ t('Deleting...') }}
            </span>
            <span v-else>{{ t('Delete') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Brand Details Modal -->
    <div 
      v-if="viewingBrand"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div class="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-gray-900">
              {{ t('Brand Details') }}: {{ viewingBrand.name }}
            </h3>
            <button
              @click="viewingBrand = null"
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
          <div class="grid md:grid-cols-2 gap-8 mb-8">
            <!-- Brand Information -->
            <div>
              <div class="flex items-center gap-4 mb-6">
                <div class="w-24 h-24 flex-shrink-0">
                  <img 
                    :src="viewingBrand.image || '/images/placeholder-brand.jpg'" 
                    :alt="viewingBrand.name"
                    class="w-24 h-24 rounded-lg object-cover"
                  />
                </div>
                <div>
                  <h4 class="text-xl font-bold text-gray-900">{{ viewingBrand.name }}</h4>
                  <p class="text-gray-600">{{ viewingBrand.signature }}</p>
                  <span :class="viewingBrand.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'"
                        class="mt-2 px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full">
                    {{ viewingBrand.isActive ? t('Active') : t('Inactive') }}
                  </span>
                </div>
              </div>

              <div class="space-y-4">
                <div>
                  <p class="text-sm text-gray-600">{{ t('Category') }}</p>
                  <p class="font-medium">{{ t(viewingBrand.category || 'Uncategorized') }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">{{ t('Description') }}</p>
                  <p class="font-medium">{{ viewingBrand.description || t('No description provided') }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">{{ t('Price Range') }}</p>
                  <p class="font-medium">${{ viewingBrand.price?.toFixed(2) || '0.00' }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">{{ t('Created') }}</p>
                  <p class="font-medium">{{ formatDate(viewingBrand.createdAt) }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">{{ t('Last Updated') }}</p>
                  <p class="font-medium">{{ formatDate(viewingBrand.updatedAt) }}</p>
                </div>
              </div>
            </div>

            <!-- Products List -->
            <div>
              <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                {{ t('Products') }} ({{ viewingBrand.productIds?.length || 0 }})
              </h4>

              <div v-if="viewingBrand.productIds?.length" class="space-y-3">
                <div 
                  v-for="productId in viewingBrand.productIds.slice(0, 10)" 
                  :key="productId"
                  class="p-3 border border-gray-200 rounded-lg"
                >
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ t('Product ID') }}: {{ productId }}</p>
                      <p class="text-xs text-gray-500">{{ t('Click to view details') }}</p>
                    </div>
                    <button
                      @click="viewProduct(productId)"
                      class="text-primary-600 hover:text-primary-700"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div v-if="viewingBrand.productIds.length > 10" class="text-center pt-2">
                  <p class="text-sm text-gray-500">
                    +{{ viewingBrand.productIds.length - 10 }} {{ t('more products') }}
                  </p>
                </div>
              </div>

              <div v-else class="text-center py-8 text-gray-500">
                {{ t('No products assigned to this brand yet') }}
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end gap-3">
            <button
              @click="editBrand(viewingBrand)"
              class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              {{ t('Edit Brand') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useLanguageStore } from '@/stores/language'
import { useBrandsStore } from '@/stores/brands'
import { useRouter } from 'vue-router'
import BrandFormModal from '@/components/Admin/AddBrandModal.vue'
import type { Brand } from '@/types'

const languageStore = useLanguageStore()
const brandsStore = useBrandsStore()
const router = useRouter()

const { t, formatDate } = languageStore

// State
const isLoading = computed(() => brandsStore.isLoading)
const error = computed(() => brandsStore.error)
const brands = computed(() => brandsStore.brands)

// Filters
const searchQuery = ref('')
const statusFilter = ref('')
const categoryFilter = ref('')

// Modals
const showAddModal = ref(false)
const showDeleteModal = ref(false)
const editingBrand = ref<Brand | null>(null)
const viewingBrand = ref<Brand | null>(null)
const brandToDelete = ref<Brand | null>(null)
const deleting = ref(false)

// Computed properties
const activeBrandsCount = computed(() => {
  return brands.value.filter(brand => brand.isActive).length
})

const totalProducts = computed(() => {
  return brands.value.reduce((total, brand) => {
    return total + (brand.productIds?.length || 0)
  }, 0)
})

const uniqueCategories = computed(() => {
  const categories = brands.value.map(brand => brand.category).filter(Boolean)
  return [...new Set(categories)]
})

const categoriesCount = computed(() => uniqueCategories.value.length)

const filteredBrands = computed(() => {
  let filtered = [...brands.value]

  // Apply search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(brand =>
      brand.name.toLowerCase().includes(query) ||
      brand.signature?.toLowerCase().includes(query) ||
      brand.description?.toLowerCase().includes(query)
    )
  }

  // Apply status filter
  if (statusFilter.value === 'active') {
    filtered = filtered.filter(brand => brand.isActive)
  } else if (statusFilter.value === 'inactive') {
    filtered = filtered.filter(brand => !brand.isActive)
  }

  // Apply category filter
  if (categoryFilter.value) {
    filtered = filtered.filter(brand => brand.category === categoryFilter.value)
  }

  return filtered
})

const hasActiveFilters = computed(() => {
  return searchQuery.value || statusFilter.value || categoryFilter.value
})

// Methods
const loadBrands = async () => {
  await brandsStore.loadBrands()
}

const viewBrand = (brand: Brand) => {
  viewingBrand.value = brand
}

const editBrand = (brand: Brand) => {
  editingBrand.value = brand
  viewingBrand.value = null
}

const confirmDelete = (brand: Brand) => {
  brandToDelete.value = brand
  showDeleteModal.value = true
}

const deleteBrand = async () => {
  if (!brandToDelete.value) return

  deleting.value = true
  try {
    const success = await brandsStore.deleteBrand(brandToDelete.value.id)
    if (success) {
      showDeleteModal.value = false
      brandToDelete.value = null
    } else {
      alert(t('Failed to delete brand. Please try again.'))
    }
  } catch (err) {
    console.error('Error deleting brand:', err)
    alert(t('An error occurred. Please try again.'))
  } finally {
    deleting.value = false
  }
}

const toggleBrandStatus = async (brand: Brand) => {
  try {
    await brandsStore.updateBrand(brand.id, {
      isActive: !brand.isActive
    })
  } catch (err) {
    console.error('Error toggling brand status:', err)
    alert(t('Failed to update brand status. Please try again.'))
  }
}

const viewProduct = (productId: string) => {
  router.push(`/admin/products/edit/${productId}`)
}

const closeModal = () => {
  showAddModal.value = false
  editingBrand.value = null
}

const handleBrandSaved = () => {
  closeModal()
  loadBrands()
}
// Mark as used for TypeScript (called in template)
void handleBrandSaved;

const clearFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  categoryFilter.value = ''
}

// Initialize
onMounted(() => {
  loadBrands()
})

// Watch for brand updates
watch(() => brandsStore.brands, () => {
  // Any post-loading logic if needed
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
</style>