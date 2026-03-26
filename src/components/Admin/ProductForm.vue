<!-- src/components/Admin/ProductForm.vue -->
<template>
  <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <!-- Background overlay -->
    <div class="fixed inset-0 bg-black bg-opacity-75 transition-opacity" @click="close"></div>

    <div class="flex min-h-screen items-end justify-center p-4 text-center sm:items-center sm:p-0">
      <!-- Modal panel -->
      <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full mx-auto max-w-4xl">
        <!-- Modal header -->
        <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <h3 class="text-lg font-semibold leading-6 text-gray-900" id="modal-title">
                  {{ editing ? t('Edit Product') : t('Add New Product') }}
                </h3>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-xs px-2 py-1 rounded-full whitespace-nowrap" 
                        :class="currentStep === 1 ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-800'">
                    Step 1: Brand Selection
                  </span>
                  <span class="text-xs px-2 py-1 rounded-full whitespace-nowrap"
                        :class="currentStep === 2 ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-800'">
                    Step 2: Product Details
                  </span>
                </div>
              </div>

              <!-- Step Navigation -->
              <div class="mb-6">
                <div class="flex items-center">
                  <button
                    @click="currentStep = 1"
                    :class="currentStep === 1 ? 'text-primary-600 border-primary-600' : 'text-gray-500 border-gray-300'"
                    class="flex-1 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap px-1"
                  >
                    {{ t('Brand Selection') }}
                  </button>
                  <button
                    @click="goToStep(2)"
                    :class="currentStep === 2 ? 'text-primary-600 border-primary-600' : 'text-gray-500 border-gray-300'"
                    :disabled="!canProceedToProductDetails"
                    class="flex-1 py-2 text-sm font-medium border-b-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap px-1"
                  >
                    {{ t('Product Details') }}
                  </button>
                </div>
              </div>
            </div>
            <button
              type="button"
              class="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
              @click="close"
            >
              <span class="sr-only">{{ t('Close') }}</span>
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Modal content -->
        <div class="px-4 pb-3 sm:px-6 overflow-y-auto max-h-[calc(100vh-300px)]">
          <!-- Step 1: Brand Selection -->
          <div v-if="currentStep === 1" class="space-y-4">
            <!-- Brand Selection Toggle -->
            <div class="mb-4">
              <div class="flex flex-wrap gap-4">
                <button
                  type="button"
                  @click="brandSelectionMode = 'existing'"
                  :class="[
                    'px-4 py-2.5 text-sm font-medium rounded-lg transition-colors flex-1 sm:flex-none',
                    brandSelectionMode === 'existing' 
                      ? 'bg-primary-100 text-primary-700 border border-primary-300' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  ]"
                >
                  {{ t('Select Existing Brand') }}
                </button>
                <button
                  type="button"
                  @click="brandSelectionMode = 'new'"
                  :class="[
                    'px-4 py-2.5 text-sm font-medium rounded-lg transition-colors flex-1 sm:flex-none',
                    brandSelectionMode === 'new' 
                      ? 'bg-primary-100 text-primary-700 border border-primary-300' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  ]"
                >
                  {{ t('Create New Brand') }}
                </button>
              </div>
            </div>

            <!-- Existing Brand Selection -->
            <div v-if="brandSelectionMode === 'existing'" class="space-y-4">
              <div class="relative">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('Select Brand') }} *
                </label>
                <div class="relative">
                  <input
                    v-model="brandSearchQuery"
                    type="text"
                    class="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    :placeholder="t('Search brands...')"
                    @input="onBrandSearch"
                  />
                  <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                <!-- Loading state -->
                <div v-if="brandsLoading" class="mt-2 text-center py-4">
                  <div class="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-500"></div>
                  <p class="text-sm text-gray-500 mt-2">{{ t('Loading brands...') }}</p>
                </div>

                <!-- Brand List -->
                <div v-else-if="filteredBrands.length > 0" class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                  <div
                    v-for="brand in filteredBrands"
                    :key="brand.id"
                    @click="selectExistingBrand(brand)"
                    :class="[
                      'p-3 border rounded-lg cursor-pointer transition-all hover:border-primary-500 hover:bg-primary-50',
                      selectedBrandId === brand.id 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-gray-200'
                    ]"
                  >
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 flex-shrink-0">
                        <img 
                          :src="brand.image || '/images/placeholder-brand.jpg'" 
                          :alt="brand.name"
                          class="w-10 h-10 object-cover rounded-md"
                        />
                      </div>
                      <div class="flex-1 min-w-0">
                        <h4 class="text-sm font-medium text-gray-900 truncate">{{ brand.name }}</h4>
                        <p class="text-xs text-gray-500 truncate">{{ brand.category || t('Uncategorized') }}</p>
                      </div>
                      <svg 
                        v-if="selectedBrandId === brand.id" 
                        class="w-5 h-5 text-primary-600 flex-shrink-0" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <!-- No brands found -->
                <div v-else-if="!brandsLoading" class="mt-3 p-4 text-center border border-gray-200 rounded-lg">
                  <svg class="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <p class="mt-2 text-sm text-gray-600">
                    {{ t('No brands found. Try searching or create a new brand.') }}
                  </p>
                </div>
              </div>

              <!-- Selected Brand Preview -->
              <div v-if="selectedBrand" class="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 flex-shrink-0">
                      <img 
                        :src="selectedBrand.image || '/images/placeholder-brand.jpg'" 
                        :alt="selectedBrand.name"
                        class="w-12 h-12 object-cover rounded-md"
                      />
                    </div>
                    <div>
                      <h4 class="text-sm font-medium text-gray-900">{{ selectedBrand.name }}</h4>
                      <p class="text-xs text-gray-500">{{ selectedBrand.category || t('Uncategorized') }}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    @click="clearBrandSelection"
                    class="text-sm text-red-600 hover:text-red-800"
                  >
                    {{ t('Change') }}
                  </button>
                </div>
              </div>
            </div>

            <!-- New Brand Form -->
            <div v-else-if="brandSelectionMode === 'new'" class="space-y-4">
              <!-- Brand Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ t('Brand Name') }} *
                </label>
                <input
                  v-model="newBrand.name"
                  type="text"
                  :placeholder="t('e.g., Tom Ford')"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  :class="{ 'border-red-300': brandErrors.name }"
                  @input="generateBrandSlug"
                />
                <p v-if="brandErrors.name" class="mt-1 text-sm text-red-600">{{ brandErrors.name }}</p>
              </div>

              <!-- Brand Logo/Image -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ t('Brand Logo/Image') }} *
                </label>

                <!-- URL Input -->
                <div class="mb-3">
                  <label class="block text-xs text-gray-600 mb-1">{{ t('Image URL (optional)') }}</label>
                  <div class="flex flex-col sm:flex-row gap-2">
                    <input
                      v-model="newBrand.imageUrl"
                      type="text"
                      placeholder="https://example.com/image.jpg"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    />
                    <button
                      type="button"
                      @click="previewBrandImage(newBrand.imageUrl)"
                      class="inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 whitespace-nowrap"
                    >
                      {{ t('Preview') }}
                    </button>
                  </div>
                </div>

                <!-- File Upload -->
                <div class="mb-3">
                  <label class="block text-xs text-gray-600 mb-1">{{ t('Or Upload Image') }}</label>
                  <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <input
                      ref="brandImageInput"
                      type="file"
                      accept="image/*"
                      @change="handleBrandImageUpload"
                      class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                    />
                    <button
                      v-if="brandImageFile || newBrand.imageUrl"
                      @click="removeBrandImage"
                      type="button"
                      class="inline-flex items-center justify-center px-3 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 text-sm whitespace-nowrap"
                    >
                      {{ t('Remove') }}
                    </button>
                  </div>
                  <p class="mt-1 text-xs text-gray-500">
                    {{ t('Images will be stored in Supabase Storage. JPG, PNG, GIF recommended.') }}
                  </p>
                </div>

                <!-- Image Preview -->
                <div v-if="brandImagePreview" class="mt-3">
                  <p class="text-sm text-gray-600 mb-1">{{ t('Image Preview') }}:</p>
                  <div class="relative h-32 w-32 border border-gray-300 rounded-md overflow-hidden">
                    <img
                      :src="brandImagePreview"
                      :alt="t('Brand Image Preview')"
                      class="h-full w-full object-cover"
                      @error="handleBrandImageError"
                    />
                    <button
                      @click="clearBrandImagePreview"
                      class="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                      :title="t('Clear')"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>

              <!-- Brand Slug -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ t('URL Slug') }} *
                </label>
                <div class="flex flex-col sm:flex-row gap-2">
                  <div class="flex-1 relative rounded-md shadow-sm">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span class="text-gray-500 text-sm">/brand/</span>
                    </div>
                    <input
                      v-model="newBrand.slug"
                      type="text"
                      :placeholder="t('tom-ford')"
                      class="w-full pl-16 sm:pl-20 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                      :class="{ 'border-red-300': brandErrors.slug }"
                    />
                  </div>
                  <button
                    type="button"
                    @click="generateBrandSlug"
                    class="inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 whitespace-nowrap"
                  >
                    {{ t('Generate') }}
                  </button>
                </div>
                <p v-if="brandErrors.slug" class="mt-1 text-sm text-red-600">{{ brandErrors.slug }}</p>
                <p class="mt-1 text-xs text-gray-500">
                  {{ t('URL will be:') }} <span class="font-mono text-primary-600 break-all">/brand/{{ newBrand.slug || 'brand-slug' }}</span>
                </p>
              </div>

              <!-- Brand Category -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ t('Category') }} *
                </label>
                <select
                  v-model="newBrand.category"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  :class="{ 'border-red-300': brandErrors.category }"
                >
                  <option value="">{{ t('Select category') }}</option>
                  <option value="luxury">{{ t('Luxury') }}</option>
                  <option value="designer">{{ t('Designer') }}</option>
                  <option value="niche">{{ t('Niche') }}</option>
                  <option value="arabic">{{ t('Arabic') }}</option>
                  <option value="french">{{ t('French') }}</option>
                </select>
                <p v-if="brandErrors.category" class="mt-1 text-sm text-red-600">{{ brandErrors.category }}</p>
              </div>

              <!-- Brand Description -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ t('Description') }}
                </label>
                <textarea
                  v-model="newBrand.description"
                  rows="2"
                  :placeholder="t('Brief description about the brand...')"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                ></textarea>
              </div>

              <!-- Brand Status -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ t('Status') }}
                </label>
                <div class="flex flex-wrap items-center gap-4">
                  <label class="inline-flex items-center">
                    <input
                      v-model="newBrand.isActive"
                      type="radio"
                      :value="true"
                      class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <span class="ml-2 text-sm text-gray-700">{{ t('Active') }}</span>
                  </label>
                  <label class="inline-flex items-center">
                    <input
                      v-model="newBrand.isActive"
                      type="radio"
                      :value="false"
                      class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <span class="ml-2 text-sm text-gray-700">{{ t('Inactive') }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2: Product Details -->
          <div v-else-if="currentStep === 2" class="space-y-4">
            <!-- Current Brand Info -->
            <div class="bg-gray-50 rounded-lg p-4 mb-4">
              <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div class="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    :src="getBrandImage()"
                    :alt="getBrandName()"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-medium text-gray-900 truncate">{{ getBrandName() }}</h4>
                  <p class="text-sm text-gray-600 truncate">/brand/{{ getBrandSlug() }}</p>
                </div>
              </div>
            </div>

            <!-- Product Image -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('Product Image') }} *
              </label>

              <!-- URL Input -->
              <div class="mb-3">
                <label class="block text-xs text-gray-600 mb-1">{{ t('Image URL (optional)') }}</label>
                <div class="flex flex-col sm:flex-row gap-2">
                  <input
                    v-model="productData.imageUrl"
                    type="text"
                    placeholder="https://example.com/product.jpg"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    :class="{ 'border-red-300': errors.image }"
                  />
                  <button
                    type="button"
                    @click="previewProductImage(productData.imageUrl)"
                    class="inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 whitespace-nowrap"
                  >
                    {{ t('Preview') }}
                  </button>
                </div>
              </div>

              <!-- File Upload -->
              <div class="mb-3">
                <label class="block text-xs text-gray-600 mb-1">{{ t('Or Upload Image') }}</label>
                <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <input
                    ref="productImageInput"
                    type="file"
                    accept="image/*"
                    @change="handleProductImageUpload"
                    class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                  />
                  <button
                    v-if="productImageFile || productData.imageUrl"
                    @click="removeProductImage"
                    type="button"
                    class="inline-flex items-center justify-center px-3 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 text-sm whitespace-nowrap"
                  >
                    {{ t('Remove') }}
                  </button>
                </div>
                <p class="mt-1 text-xs text-gray-500">
                  {{ t('Images will be stored in Supabase Storage. JPG, PNG, GIF recommended.') }}
                </p>
              </div>

              <p v-if="errors.image" class="mt-1 text-sm text-red-600">{{ errors.image }}</p>

              <!-- Image Preview -->
              <div v-if="productImagePreview" class="mt-3">
                <p class="text-sm text-gray-600 mb-1">{{ t('Image Preview') }}:</p>
                <div class="relative h-32 w-32 border border-gray-300 rounded-md overflow-hidden">
                  <img
                    :src="productImagePreview"
                    :alt="t('Product Image Preview')"
                    class="h-full w-full object-cover"
                    @error="handleProductImageError"
                  />
                  <button
                    @click="clearProductImagePreview"
                    class="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    :title="t('Clear')"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>

            <!-- Product Name (English) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('Product Name (English)') }} *
              </label>
              <input
                v-model="productData.name.en"
                type="text"
                :placeholder="t('e.g., Noir Extreme')"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                :class="{ 'border-red-300': errors.nameEn }"
                @input="generateProductSlug"
              />
              <p v-if="errors.nameEn" class="mt-1 text-sm text-red-600">{{ errors.nameEn }}</p>
            </div>

            <!-- Product Name (Arabic) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('Product Name (Arabic)') }} *
              </label>
              <input
                v-model="productData.name.ar"
                type="text"
                :placeholder="t('نوار إكستريم')"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm text-right"
                :class="{ 'border-red-300': errors.nameAr }"
                dir="rtl"
              />
              <p v-if="errors.nameAr" class="mt-1 text-sm text-red-600">{{ errors.nameAr }}</p>
            </div>

            <!-- Product Slug -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('Product Slug') }} *
              </label>
              <div class="flex flex-col sm:flex-row gap-2">
                <div class="flex-1 relative rounded-md shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="text-gray-500 text-sm">/product/</span>
                  </div>
                  <input
                    v-model="productData.slug"
                    type="text"
                    :placeholder="t('noir-extreme')"
                    class="w-full pl-16 sm:pl-20 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    :class="{ 'border-red-300': errors.slug }"
                  />
                </div>
                <button
                  type="button"
                  @click="generateProductSlug"
                  class="inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 whitespace-nowrap"
                >
                  {{ t('Generate') }}
                </button>
              </div>
              <p v-if="errors.slug" class="mt-1 text-sm text-red-600">{{ errors.slug }}</p>
              <p class="mt-1 text-xs text-gray-500">
                {{ t('URL will be:') }} <span class="font-mono text-primary-600 break-all">/product/{{ productData.slug || 'product-slug' }}</span>
              </p>
            </div>

            <!-- Gender Classification Field -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">
                {{ t('Classification') }} <span class="text-red-500">*</span>
              </label>
              <div class="flex gap-4 flex-wrap">
                <label class="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    v-model="productData.classification"
                    value="M"
                    required
                    @change="onClassificationChange"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span class="text-sm text-gray-700">{{ t('Male') }}</span>
                </label>
                <label class="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    v-model="productData.classification"
                    value="F"
                    required
                    @change="onClassificationChange"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span class="text-sm text-gray-700">{{ t('Female') }}</span>
                </label>
                <label class="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    v-model="productData.classification"
                    value="U"
                    required
                    @change="onClassificationChange"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span class="text-sm text-gray-700">{{ t('Unisex') }}</span>
                </label>
              </div>
            </div>

            <!-- Category & Price -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ t('Category') }} *
                </label>
                <select
                  v-model="productData.category"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  :class="{ 'border-red-300': errors.category }"
                >
                  <option value="">{{ t('Select category') }}</option>
                  <option v-for="category in productsStore.categories" :key="category.id" :value="category.id">
                    {{ getCategoryDisplayName(category) }}
                  </option>
                </select>
                <p v-if="errors.category" class="mt-1 text-sm text-red-600">{{ errors.category }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ t('Price') }} ({{ t('currencyLE') }}) *
                </label>
                <div class="relative rounded-md shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="text-gray-500 text-sm">LE</span>
                  </div>
                  <input
                    v-model.number="productData.price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="450"
                    class="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    :class="{ 'border-red-300': errors.price }"
                  />
                </div>
                <p v-if="errors.price" class="mt-1 text-sm text-red-600">{{ errors.price }}</p>
              </div>
            </div>

            <!-- Size & Concentration -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ t('Size') }} *
                </label>
                <select
                  v-model="productData.size"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  :class="{ 'border-red-300': errors.size }"
                >
                  <option value="">{{ t('Select size') }}</option>
                  <option value="50ml">50ml</option>
                  <option value="100ml">100ml</option>
                  <option value="150ml">150ml</option>
                  <option value="200ml">200ml</option>
                </select>
                <p v-if="errors.size" class="mt-1 text-sm text-red-600">{{ errors.size }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ t('Concentration') }} *
                </label>
                <select
                  v-model="productData.concentration"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  :class="{ 'border-red-300': errors.concentration }"
                >
                  <option value="">{{ t('Select concentration') }}</option>
                  <option value="Eau de Parfum">Eau de Parfum</option>
                  <option value="Eau de Toilette">Eau de Toilette</option>
                  <option value="Parfum">Parfum</option>
                  <option value="Cologne">Cologne</option>
                </select>
                <p v-if="errors.concentration" class="mt-1 text-sm text-red-600">{{ errors.concentration }}</p>
              </div>
            </div>

            <!-- Description (English) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('Description (English)') }} *
              </label>
              <textarea
                v-model="productData.description.en"
                rows="3"
                :placeholder="t('A luxurious oriental fragrance with notes of vanilla, amber, and spices.')"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                :class="{ 'border-red-300': errors.descEn }"
              ></textarea>
              <p v-if="errors.descEn" class="mt-1 text-sm text-red-600">{{ errors.descEn }}</p>
            </div>

            <!-- Description (Arabic) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('Description (Arabic)') }} *
              </label>
              <textarea
                v-model="productData.description.ar"
                rows="3"
                :placeholder="t('عطر شرقي فاخر بنغمات الفانيليا والعنبر والتوابل.')"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm text-right"
                :class="{ 'border-red-300': errors.descAr }"
                dir="rtl"
              ></textarea>
              <p v-if="errors.descAr" class="mt-1 text-sm text-red-600">{{ errors.descAr }}</p>
            </div>

            <!-- Fragrance Notes -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">
                {{ t('Fragrance Notes') }}
              </label>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs text-gray-600 mb-2">
                    {{ t('Top Notes') }}
                  </label>
                  <div class="space-y-2">
                    <div 
                      v-for="(_note, index) in productData.notes.top" 
                      :key="`top-${index}`"
                      class="flex items-center gap-2"
                    >
                      <input
                        v-model="productData.notes.top[index]"
                        type="text"
                        class="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                        :placeholder="t('Note')"
                      />
                      <button
                        type="button"
                        @click="removeNote('top', index)"
                        class="p-1 text-red-600 hover:text-red-800"
                        :title="t('Remove note')"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                    <button
                      type="button"
                      @click="addNote('top')"
                      class="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      + {{ t('Add Top Note') }}
                    </button>
                  </div>
                </div>

                <div>
                  <label class="block text-xs text-gray-600 mb-2">
                    {{ t('Heart Notes') }}
                  </label>
                  <div class="space-y-2">
                    <div 
                      v-for="(_note, index) in productData.notes.heart" 
                      :key="`heart-${index}`"
                      class="flex items-center gap-2"
                    >
                      <input
                        v-model="productData.notes.heart[index]"
                        type="text"
                        class="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                        :placeholder="t('Note')"
                      />
                      <button
                        type="button"
                        @click="removeNote('heart', index)"
                        class="p-1 text-red-600 hover:text-red-800"
                        :title="t('Remove note')"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                    <button
                      type="button"
                      @click="addNote('heart')"
                      class="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      + {{ t('Add Heart Note') }}
                    </button>
                  </div>
                </div>

                <div>
                  <label class="block text-xs text-gray-600 mb-2">
                    {{ t('Base Notes') }}
                  </label>
                  <div class="space-y-2">
                    <div 
                      v-for="(_note, index) in productData.notes.base" 
                      :key="`base-${index}`"
                      class="flex items-center gap-2"
                    >
                      <input
                        v-model="productData.notes.base[index]"
                        type="text"
                        class="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                        :placeholder="t('Note')"
                      />
                      <button
                        type="button"
                        @click="removeNote('base', index)"
                        class="p-1 text-red-600 hover:text-red-800"
                        :title="t('Remove note')"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                    <button
                      type="button"
                      @click="addNote('base')"
                      class="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      + {{ t('Add Base Note') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Stock & SKU -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ t('Stock Quantity') }}
                </label>
                <input
                  v-model.number="productData.stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ t('SKU') }}
                </label>
                <div class="relative">
                  <input
                    v-model="productData.sku"
                    type="text"
                    readonly
                    :placeholder="skuLoading ? t('Generating...') : (editing ? '' : t('Auto-generated'))"
                    class="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600 text-sm pr-10"
                  />
                  <!-- Loading spinner -->
                  <div v-if="skuLoading" class="absolute right-2 top-1/2 -translate-y-1/2">
                    <svg class="animate-spin h-4 w-4 text-primary-500" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                </div>
                <p v-if="skuWarning" class="mt-1 text-sm text-yellow-600">{{ skuWarning }}</p>
                <p v-if="skuError" class="mt-1 text-sm text-red-600">{{ skuError }}</p>
              </div>
            </div>

            <!-- Flags -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label class="inline-flex items-center gap-2">
                <input
                  v-model="productData.isBestSeller"
                  type="checkbox"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span class="text-sm text-gray-700">{{ t('Mark as Best Seller') }}</span>
              </label>
              <label class="inline-flex items-center gap-2">
                <input
                  v-model="productData.isFeatured"
                  type="checkbox"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span class="text-sm text-gray-700">{{ t('Mark as Featured') }}</span>
              </label>
            </div>

            <!-- Status -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('Status') }}
              </label>
              <div class="flex flex-wrap items-center gap-4">
                <label class="inline-flex items-center">
                  <input
                    v-model="productData.isActive"
                    type="radio"
                    :value="true"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span class="ml-2 text-sm text-gray-700">{{ t('Active') }}</span>
                </label>
                <label class="inline-flex items-center">
                  <input
                    v-model="productData.isActive"
                    type="radio"
                    :value="false"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span class="ml-2 text-sm text-gray-700">{{ t('Inactive') }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal footer -->
        <div class="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-200">
          <div class="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3">
            <!-- Cancel Button -->
            <button
              type="button"
              @click="close"
              :disabled="loading"
              class="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {{ t('Cancel') }}
            </button>

            <!-- Navigation Buttons -->
            <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <!-- Back Button -->
              <button
                v-if="currentStep === 2"
                type="button"
                @click="goToStep(1)"
                :disabled="loading"
                class="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                {{ t('Back') }}
              </button>

              <!-- Next/Save Button -->
              <button
                v-if="currentStep === 1"
                type="button"
                @click="goToStep(2)"
                :disabled="!canProceedToProductDetails || loading"
                class="w-full sm:w-auto px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ t('Next: Product Details') }}
                <svg class="w-4 h-4 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>

              <button
                v-else-if="currentStep === 2"
                type="button"
                @click="saveProduct"
                :disabled="loading || !canSave || skuLoading || !productData.sku"
                class="w-full sm:w-auto px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <template v-if="loading">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ t('Saving...') }}
                </template>
                <template v-else>
                  {{ editing ? t('Update Product') : t('Add Product') }}
                </template>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useLanguageStore } from '@/stores/language'
import { useProductsStore } from '@/stores/products'
import { useBrandsStore } from '@/stores/brands'
import { useAuthStore } from '@/stores/auth'
import type { Product, Category, Brand } from '@/types'
import { authNotification } from '@/utils/notifications'
import { supabaseSafe } from '@/supabase/client'

const languageStore = useLanguageStore()
const productsStore = useProductsStore()
const brandsStore = useBrandsStore()
const authStore = useAuthStore()

const { currentLanguage, t } = languageStore

const props = defineProps<{
  product?: Product
  brand?: Brand
}>()

const emit = defineEmits<{
  close: []
  save: [data: {
    productData: any
    brandId?: string
    productId?: string
    createNewBrand?: boolean
    newBrandData?: any
  }]
  saved: []
}>()

// ========== HELPER: Clean object for Supabase ==========
const cleanForSupabase = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(item => cleanForSupabase(item))
  
  const cleaned: any = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value instanceof File) continue
    if (value === undefined) continue
    if (typeof value === 'function') continue
    cleaned[key] = cleanForSupabase(value)
  }
  return cleaned
}

// ========== STORAGE HELPERS ==========
// Upload product image
const uploadProductImage = async (file: File, productId: string): Promise<string> => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${productId}-${Date.now()}.${fileExt}`
  const filePath = `products/${fileName}`
  
  const { error: uploadError } = await supabaseSafe.storage
    .from('images')
    .upload(filePath, file, { upsert: true })
  
  if (uploadError) throw uploadError
  
  const { data: urlData } = supabaseSafe.storage
    .from('images')
    .getPublicUrl(filePath)
  
  return urlData.publicUrl
}

// Delete product image from Storage
const deleteProductImageFromStorage = async (imageUrl: string) => {
  if (!imageUrl) return
  try {
    const url = new URL(imageUrl)
    const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/images\/(.+)$/)
    if (pathMatch && pathMatch[1]) {
      const path = decodeURIComponent(pathMatch[1])
      await supabaseSafe.storage.from('images').remove([path])
    }
  } catch (err) {
    console.warn('Failed to delete old product image from Storage:', err)
  }
}

// Upload brand image
const uploadBrandImage = async (file: File, brandId: string): Promise<string> => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${brandId}-${Date.now()}.${fileExt}`
  const filePath = `brands/${fileName}`
  
  const { error: uploadError } = await supabaseSafe.storage
    .from('images')
    .upload(filePath, file, { upsert: true })
  
  if (uploadError) throw uploadError
  
  const { data: urlData } = supabaseSafe.storage
    .from('images')
    .getPublicUrl(filePath)
  
  return urlData.publicUrl
}

// ========== BRAND ABBREVIATION MAPPING ==========
const BRAND_CODES: Record<string, string> = {
  "Baccarat": "BC",
  "Burberry Her": "BH",
  "Calvin Klein": "CK",
  "Dior": "DI",
  "Dolcy & Gabana": "DG",
  "Escada": "EE",
  "Giorgio Armani": "GA",
  "Good Girl": "GG",
  "Gucci": "GU",
  "Jean Paul Gaultier": "JP",
  "Kayali": "KA",
  "La costa": "LC",
  "Lancome": "LN",
  "Latafa": "LF",
  "laverne": "LA",
  "Moscino": "MS",
  "Nishan": "NI",
  "Louis Vuitton": "LV",
  "Paco Rabanne": "PR",
  "Parfums de Maely": "PM",
  "Scandal": "SC",
  "TOM FORD": "TF",
  "Valantino": "VA",
  "Versace": "VR",
  "Victoria's Secret": "VS",
  "Yves Saint Laurent": "YL"
}

const getBrandAbbreviation = (brandName: string): { code: string, isFallback: boolean } => {
  const normalized = brandName.trim()
  const official = BRAND_CODES[normalized]
  if (official) {
    return { code: official, isFallback: false }
  }
  const fallback = normalized.replace(/\s+/g, '').substring(0, 2).toUpperCase()
  return { code: fallback, isFallback: true }
}

// Step management
const currentStep = ref(1)

// Brand selection state
const brandSelectionMode = ref<'existing' | 'new'>('existing')
const brandsLoading = ref(false)
const brandSearchQuery = ref('')
const filteredBrands = ref<any[]>([])
const selectedBrandId = ref('')
const selectedBrand = ref<Brand | null>(null)

// New brand form
const newBrand = reactive({
  name: '',
  slug: '',
  category: '',
  description: '',
  signature: '',
  imageUrl: '',
  imageFile: null as File | null,
  isActive: true
})

// Brand image state
const brandImageFile = ref<File | null>(null)
const brandImagePreview = ref('')
const brandImageInput = ref<HTMLInputElement | null>(null)

// Product form data
const productData = reactive({
  name: { en: '', ar: '' },
  slug: '',
  category: '',
  price: 0,
  size: '',
  concentration: '',
  classification: '',
  description: { en: '', ar: '' },
  notes: { top: [''], heart: [''], base: [''] },
  imageUrl: '',
  imageFile: null as File | null,
  isBestSeller: false,
  isFeatured: false,
  isActive: true,
  stock: 0,
  sku: ''
})

// Store original product for change tracking
const originalProduct = ref<Product | null>(null)

// Product image state
const productImageFile = ref<File | null>(null)
const productImagePreview = ref('')
const productImageInput = ref<HTMLInputElement | null>(null)

// Form state
const loading = ref(false)
const errors = reactive<Record<string, any>>({})
const brandErrors = reactive<Record<string, string>>({})

// SKU generation state
const skuLoading = ref(false)
const skuError = ref('')
const skuWarning = ref('')

// Computed
const editing = computed(() => !!props.product?.id)

const canProceedToProductDetails = computed(() => {
  if (brandSelectionMode.value === 'existing') {
    return !!selectedBrandId.value
  } else {
    return newBrand.name.trim() && 
           newBrand.slug.trim() && 
           newBrand.category.trim()
  }
})

const canSave = computed(() => {
  return !skuLoading.value &&
         productData.sku &&
         productData.classification &&
         productData.name.en.trim() &&
         productData.name.ar.trim() &&
         productData.category &&
         productData.price > 0 &&
         productData.size &&
         productData.concentration &&
         productData.description.en.trim() &&
         productData.description.ar.trim() &&
         (productData.imageUrl || productImageFile.value)
})

// Helper methods
const getCategoryDisplayName = (category: Category) => {
  if (!category) return ''
  if (typeof category === 'string') return category
  return category[currentLanguage as keyof Category] || category.id || ''
}

const isValidUrl = (url: string): boolean => {
  if (!url) return false
  try {
    if (url.startsWith('data:')) {
      return url.startsWith('data:image/')
    }
    new URL(url)
    return true
  } catch {
    return false
  }
}

// ========== BRAND IMAGE METHODS ==========
const previewBrandImage = (url: string) => {
  if (url && isValidUrl(url)) {
    brandImagePreview.value = url
    newBrand.imageFile = null
    newBrand.imageUrl = url
  } else {
    alert(t('Please enter a valid image URL or upload an image'))
  }
}

const handleBrandImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || !input.files[0]) return
  const file = input.files[0]
  brandImageFile.value = file
  brandImagePreview.value = ''
  const reader = new FileReader()
  reader.onload = (e) => {
    brandImagePreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
  if (brandErrors.image) delete brandErrors.image
}

const removeBrandImage = () => {
  newBrand.imageUrl = ''
  brandImageFile.value = null
  brandImagePreview.value = ''
  if (brandImageInput.value) {
    brandImageInput.value.value = ''
  }
}

const clearBrandImagePreview = () => {
  brandImagePreview.value = ''
  newBrand.imageUrl = ''
  brandImageFile.value = null
}

const handleBrandImageError = () => {
  alert(t('Failed to load image. Please check the URL or upload a new image.'))
  brandImagePreview.value = ''
  newBrand.imageUrl = ''
}

// ========== PRODUCT IMAGE METHODS ==========
const previewProductImage = (url: string) => {
  if (url && isValidUrl(url)) {
    productImagePreview.value = url
    productImageFile.value = null
    productData.imageUrl = url
  } else {
    alert(t('Please enter a valid image URL or upload an image'))
  }
}

const handleProductImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || !input.files[0]) return
  const file = input.files[0]
  
  productImageFile.value = file
  productImagePreview.value = ''
  const reader = new FileReader()
  reader.onload = (e) => {
    productImagePreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
  if (errors.image) delete errors.image
}

const removeProductImage = () => {
  productData.imageUrl = ''
  productImageFile.value = null
  productImagePreview.value = ''
  if (productImageInput.value) {
    productImageInput.value.value = ''
  }
}

const clearProductImagePreview = () => {
  productImagePreview.value = ''
  productData.imageUrl = ''
  productImageFile.value = null
}

const handleProductImageError = () => {
  alert(t('Failed to load image. Please check the URL or upload a new image.'))
  productImagePreview.value = ''
  productData.imageUrl = ''
}

// ========== BRAND SEARCH METHODS ==========
const loadBrands = async () => {
  brandsLoading.value = true
  try {
    if (brandsStore.brands.length === 0) {
      await brandsStore.loadBrands()
    }
    
    filteredBrands.value = brandsStore.activeBrands.map(brand => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      category: brand.category,
      image: brand.image || '/images/placeholder-brand.jpg',
      isActive: brand.isActive
    }))
  } catch (error) {
    console.error('Error loading brands:', error)
  } finally {
    brandsLoading.value = false
  }
}

const onBrandSearch = () => {
  const query = brandSearchQuery.value.toLowerCase().trim()
  if (!query) {
    filteredBrands.value = brandsStore.activeBrands.map(brand => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      category: brand.category,
      image: brand.image || '/images/placeholder-brand.jpg',
      isActive: brand.isActive
    }))
  } else {
    filteredBrands.value = brandsStore.activeBrands
      .filter(brand => 
        brand.name.toLowerCase().includes(query) ||
        brand.category?.toLowerCase().includes(query) ||
        brand.slug?.toLowerCase().includes(query)
      )
      .map(brand => ({
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        category: brand.category,
        image: brand.image || '/images/placeholder-brand.jpg',
        isActive: brand.isActive
      }))
  }
}

const selectExistingBrand = (brand: any) => {
  selectedBrandId.value = brand.id
  selectedBrand.value = brand
  brandSearchQuery.value = ''
  filteredBrands.value = brandsStore.activeBrands.map(b => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    category: b.category,
    image: b.image || '/images/placeholder-brand.jpg',
    isActive: b.isActive
  }))
}

const clearBrandSelection = () => {
  selectedBrandId.value = ''
  selectedBrand.value = null
  brandSearchQuery.value = ''
  filteredBrands.value = brandsStore.activeBrands.map(brand => ({
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    category: brand.category,
    image: brand.image || '/images/placeholder-brand.jpg',
    isActive: brand.isActive
  }))
}

// ========== BRAND SLUG METHODS ==========
const generateBrandSlug = () => {
  if (!newBrand.name) return
  
  const slug = newBrand.name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
  
  newBrand.slug = slug
}

// ========== PRODUCT SLUG METHODS ==========
const generateProductSlug = () => {
  if (!productData.name.en) return
  
  const slug = productData.name.en
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
  
  productData.slug = slug
}

// ========== NOTES METHODS ==========
const addNote = (type: 'top' | 'heart' | 'base') => {
  productData.notes[type].push('')
}

const removeNote = (type: 'top' | 'heart' | 'base', index: number) => {
  productData.notes[type].splice(index, 1)
  if (productData.notes[type].length === 0) {
    productData.notes[type].push('')
  }
}

// ========== HELPER GETTERS ==========
const getBrandName = (): string => {
  if (brandSelectionMode.value === 'existing' && selectedBrand.value) {
    return selectedBrand.value.name
  } else if (brandSelectionMode.value === 'new' && newBrand.name) {
    return newBrand.name
  } else if (props.brand) {
    return props.brand.name
  }
  return t('Select a brand')
}

const getBrandSlug = (): string => {
  if (brandSelectionMode.value === 'existing' && selectedBrand.value) {
    return selectedBrand.value.slug
  } else if (brandSelectionMode.value === 'new' && newBrand.slug) {
    return newBrand.slug
  } else if (props.brand) {
    return props.brand.slug
  }
  return ''
}

const getBrandImage = (): string => {
  if (brandSelectionMode.value === 'existing' && selectedBrand.value) {
    return selectedBrand.value.image || '/images/placeholder-brand.jpg'
  } else if (brandSelectionMode.value === 'new' && brandImagePreview.value) {
    return brandImagePreview.value
  } else if (props.brand) {
    return props.brand.image || '/images/placeholder-brand.jpg'
  }
  return '/images/placeholder-brand.jpg'
}

// ========== NAVIGATION METHODS ==========
const goToStep = (step: number) => {
  if (step === 2 && !canProceedToProductDetails.value) {
    if (brandSelectionMode.value === 'existing' && !selectedBrandId.value) {
      alert(t('Please select a brand'))
    } else if (brandSelectionMode.value === 'new') {
      alert(t('Please complete all required brand information'))
    }
    return
  }
  currentStep.value = step
}

// ========== SKU GENERATION ==========
const onClassificationChange = () => {
  if (!editing.value) {
    generateStrictSKU()
  }
}

watch(
  [() => selectedBrand.value, () => newBrand.name, () => brandSelectionMode.value],
  () => {
    if (!editing.value) {
      generateStrictSKU()
    }
  },
  { deep: true }
)

const generateStrictSKU = async () => {
  if (editing.value) return

  let brandName = ''
  if (brandSelectionMode.value === 'existing' && selectedBrand.value) {
    brandName = selectedBrand.value.name
  } else if (brandSelectionMode.value === 'new' && newBrand.name) {
    brandName = newBrand.name
  }

  const gender = productData.classification
  if (!brandName || !gender) {
    productData.sku = ''
    return
  }

  skuLoading.value = true
  skuError.value = ''
  skuWarning.value = ''

  try {
    const { code: brandAbbr, isFallback } = getBrandAbbreviation(brandName)
    if (isFallback) {
      skuWarning.value = t('Brand not in official mapping, using provisional code. Please update the mapping later.')
    }

    let packageNumber = '001'

    if (brandSelectionMode.value === 'existing' && selectedBrandId.value) {
      const prefix = `P.N${brandAbbr}${gender}`
      const { data, error } = await supabaseSafe
        .from('products')
        .select('sku')
        .eq('brand_id', selectedBrandId.value)
        .ilike('sku', `${prefix}%`)
        .order('sku', { ascending: false })
        .limit(1)

      if (error) throw error
      if (data && data.length > 0) {
        const lastSku = data[0].sku
        const match = lastSku.match(/\d{3}$/)
        if (match) {
          const lastNumber = parseInt(match[0], 10)
          const nextNumber = lastNumber + 1
          packageNumber = nextNumber.toString().padStart(3, '0')
        }
      }
    }

    const sku = `P.N${brandAbbr}${gender}${packageNumber}`
    productData.sku = sku
  } catch (error: any) {
    console.error('SKU generation error:', error)
    skuError.value = error.message || t('Failed to generate SKU')
    productData.sku = ''
  } finally {
    skuLoading.value = false
  }
}

// ========== VALIDATION METHODS ==========
const validateForm = (): boolean => {
  let isValid = true

  Object.keys(errors).forEach(key => delete errors[key])
  Object.keys(brandErrors).forEach(key => delete brandErrors[key])

  if (brandSelectionMode.value === 'existing') {
    if (!selectedBrandId.value) {
      brandErrors.selection = t('Please select a brand')
      isValid = false
    }
  } else if (brandSelectionMode.value === 'new') {
    if (!newBrand.name.trim()) {
      brandErrors.name = t('Brand name is required')
      isValid = false
    }

    if (!newBrand.slug.trim()) {
      brandErrors.slug = t('Brand slug is required')
      isValid = false
    }

    if (!newBrand.category) {
      brandErrors.category = t('Brand category is required')
      isValid = false
    }

    if (!newBrand.imageUrl && !brandImageFile.value) {
      brandErrors.image = t('Brand image is required')
      isValid = false
    }
  }

  if (!productData.classification) {
    errors.classification = t('Classification is required')
    isValid = false
  }

  if (!productData.name.en.trim()) {
    errors.nameEn = t('English name is required')
    isValid = false
  }

  if (!productData.name.ar.trim()) {
    errors.nameAr = t('Arabic name is required')
    isValid = false
  }

  if (!productData.imageUrl && !productImageFile.value) {
    errors.image = t('Product image is required')
    isValid = false
  }

  if (!productData.category) {
    errors.category = t('Category is required')
    isValid = false
  }

  if (!productData.price || productData.price <= 0) {
    errors.price = t('Valid price is required')
    isValid = false
  }

  if (!productData.size) {
    errors.size = t('Size is required')
    isValid = false
  }

  if (!productData.concentration) {
    errors.concentration = t('Concentration is required')
    isValid = false
  }

  if (!productData.description.en.trim()) {
    errors.descEn = t('English description is required')
    isValid = false
  }

  if (!productData.description.ar.trim()) {
    errors.descAr = t('Arabic description is required')
    isValid = false
  }

  return isValid
}

// ========== CHANGE DETECTION ==========
const getChangedFields = (): Record<string, any> => {
  if (!originalProduct.value) return {}

  const changed: Record<string, any> = {}
  const orig = originalProduct.value

  const simpleFields = [
    'slug', 'category', 'price', 'size', 'concentration', 'classification',
    'isBestSeller', 'isFeatured', 'isActive', 'sku'
  ] as const
  simpleFields.forEach(field => {
    if (productData[field] !== orig[field]) {
      changed[field] = productData[field]
    }
  })

  if (productImageFile.value) {
    changed.imageFile = productImageFile.value
  } else if (productData.imageUrl !== orig.imageUrl) {
    changed.imageUrl = productData.imageUrl
  }

  if (productData.stock !== orig.stockQuantity) {
    changed.stock = productData.stock
  }

  if (JSON.stringify(productData.name) !== JSON.stringify(orig.name)) {
    changed.name = { ...productData.name }
  }

  if (JSON.stringify(productData.description) !== JSON.stringify(orig.description)) {
    changed.description = { ...productData.description }
  }

  if (JSON.stringify(productData.notes) !== JSON.stringify(orig.notes)) {
    changed.notes = { ...productData.notes }
  }

  return cleanForSupabase(changed)
}

// ========== SAVE METHODS ==========
const saveProduct = async () => {
  if (!authStore.isAuthenticated) {
    alert(t('You must be logged in to perform this action'))
    return
  }

  if (!authStore.isAdmin) {
    alert(t('You must be logged in as an admin to manage products'))
    return
  }

  if (!authStore.currentTenant) {
    alert(t('Tenant not resolved. Please refresh the page or contact support.'))
    return
  }

  if (!validateForm()) return
  if (skuLoading.value) {
    alert(t('Please wait while SKU is being generated'))
    return
  }

  loading.value = true

  try {
    if (!productData.slug && productData.name.en) {
      generateProductSlug()
    }

    const cleanNotes = {
      top: productData.notes.top.filter((n: string) => n && n.trim() !== ''),
      heart: productData.notes.heart.filter((n: string) => n && n.trim() !== ''),
      base: productData.notes.base.filter((n: string) => n && n.trim() !== '')
    }

    if (cleanNotes.top.length === 0) cleanNotes.top = ['']
    if (cleanNotes.heart.length === 0) cleanNotes.heart = ['']
    if (cleanNotes.base.length === 0) cleanNotes.base = ['']

    const productPayload = {
      name: { en: productData.name.en, ar: productData.name.ar },
      description: { en: productData.description.en, ar: productData.description.ar },
      notes: cleanNotes,
      price: Number(productData.price) || 0,
      size: productData.size,
      concentration: productData.concentration,
      classification: productData.classification,
      imageUrl: productData.imageUrl || '',
      slug: productData.slug || '',
      category: productData.category,
      isBestSeller: productData.isBestSeller || false,
      isFeatured: productData.isFeatured || false,
      stock: Number(productData.stock) || 0,
      sku: productData.sku || '',
      isActive: productData.isActive !== false
    }

    const cleanPayload = cleanForSupabase(productPayload)

    if (editing.value) {
      if (!props.product?.brandId) {
        throw new Error('Product brand ID missing')
      }

      const changedFields = getChangedFields()
      if (Object.keys(changedFields).length === 0) {
        emit('close')
        return
      }

      let finalImageUrl = productData.imageUrl
      if (productImageFile.value) {
        finalImageUrl = await uploadProductImage(productImageFile.value, props.product.id)
        await deleteProductImageFromStorage(productData.imageUrl)
        changedFields.imageUrl = finalImageUrl
      }

      const updatePayload: any = { updated_at: new Date().toISOString() }
      if (changedFields.name) updatePayload.name = changedFields.name
      if (changedFields.description) updatePayload.description = changedFields.description
      if (changedFields.notes) updatePayload.notes = changedFields.notes
      if (changedFields.price !== undefined) updatePayload.price = changedFields.price
      if (changedFields.size) updatePayload.size = changedFields.size
      if (changedFields.concentration) updatePayload.concentration = changedFields.concentration
      if (changedFields.classification) updatePayload.classification = changedFields.classification
      if (changedFields.slug) updatePayload.slug = changedFields.slug
      if (changedFields.category) updatePayload.category = changedFields.category
      if (changedFields.isBestSeller !== undefined) updatePayload.is_best_seller = changedFields.isBestSeller
      if (changedFields.isFeatured !== undefined) updatePayload.is_featured = changedFields.isFeatured
      if (changedFields.stock !== undefined) updatePayload.stock_quantity = changedFields.stock
      if (changedFields.sku) updatePayload.sku = changedFields.sku
      if (changedFields.isActive !== undefined) updatePayload.is_active = changedFields.isActive
      if (changedFields.imageUrl) updatePayload.image_url = changedFields.imageUrl

      const { error: updateError } = await supabaseSafe
        .from('products')
        .update(updatePayload)
        .eq('id', props.product.id)

      if (updateError) throw updateError

      authNotification.loggedIn(t('Product updated successfully'))
      emit('save', { 
        productData: changedFields,
        brandId: props.product.brandId,
        productId: props.product.id
      })
    } 
    else if (brandSelectionMode.value === 'existing' && selectedBrandId.value) {
      const brand = brandsStore.brands.find(b => b.id === selectedBrandId.value)
      if (!brand) throw new Error('Brand not found')

      const now = new Date().toISOString()
      const productInsertData = {
        brand_id: brand.id,
        tenant_id: authStore.currentTenant,
        name: cleanPayload.name,
        description: cleanPayload.description,
        notes: cleanPayload.notes,
        price: cleanPayload.price,
        size: cleanPayload.size,
        concentration: cleanPayload.concentration,
        classification: cleanPayload.classification,
        slug: cleanPayload.slug,
        category: cleanPayload.category,
        is_best_seller: cleanPayload.isBestSeller,
        is_featured: cleanPayload.isFeatured,
        stock_quantity: cleanPayload.stock,
        sku: cleanPayload.sku,
        is_active: cleanPayload.isActive,
        created_at: now,
        updated_at: now,
        image_url: ''
      }

      const { data: newProduct, error: insertError } = await supabaseSafe
        .from('products')
        .insert(productInsertData)
        .select()
        .single()

      if (insertError) throw insertError

      const newProductId = newProduct.id

      let finalImageUrl = ''
      if (productImageFile.value) {
        finalImageUrl = await uploadProductImage(productImageFile.value, newProductId)
        await supabaseSafe
          .from('products')
          .update({ image_url: finalImageUrl, updated_at: now })
          .eq('id', newProductId)
        cleanPayload.imageUrl = finalImageUrl
      } else if (cleanPayload.imageUrl) {
        finalImageUrl = cleanPayload.imageUrl
        await supabaseSafe
          .from('products')
          .update({ image_url: finalImageUrl, updated_at: now })
          .eq('id', newProductId)
      }

      authNotification.loggedIn(t('Product added successfully'))
      emit('save', { productData: cleanPayload, brandId: brand.id, createNewBrand: false })
    } 
    else if (brandSelectionMode.value === 'new') {
      const brandSlug = newBrand.slug
      const brandCategory = newBrand.category
      const brandDescription = newBrand.description || ''
      const brandSignature = newBrand.signature || ''
      const isBrandActive = newBrand.isActive !== false

      const now = new Date().toISOString()
      const productPayloadForRPC = {
        name: cleanPayload.name,
        description: cleanPayload.description,
        notes: cleanPayload.notes,
        price: cleanPayload.price,
        size: cleanPayload.size,
        concentration: cleanPayload.concentration,
        classification: cleanPayload.classification,
        slug: cleanPayload.slug,
        category: cleanPayload.category,
        is_best_seller: cleanPayload.isBestSeller,
        is_featured: cleanPayload.isFeatured,
        stock_quantity: cleanPayload.stock,
        sku: cleanPayload.sku,
        is_active: cleanPayload.isActive
      }

      const { data: brandId, error: rpcError } = await supabaseSafe.rpc('create_brand_with_products', {
        _tenant_id: authStore.currentTenant,
        _name: newBrand.name,
        _slug: brandSlug,
        _category: brandCategory,
        _description: brandDescription,
        _signature: brandSignature,
        _is_active: isBrandActive,
        _image: '',
        _products: [productPayloadForRPC]
      })

      if (rpcError) throw rpcError
      if (!brandId) throw new Error('Failed to create brand')

      let brandImageUrl = ''
      if (brandImageFile.value) {
        brandImageUrl = await uploadBrandImage(brandImageFile.value, brandId)
        await supabaseSafe
          .from('brands')
          .update({ image: brandImageUrl, updated_at: now })
          .eq('id', brandId)
      } else if (newBrand.imageUrl) {
        brandImageUrl = newBrand.imageUrl
        await supabaseSafe
          .from('brands')
          .update({ image: brandImageUrl, updated_at: now })
          .eq('id', brandId)
      }

      let productImageUrl = ''
      const { data: newProduct, error: fetchError } = await supabaseSafe
        .from('products')
        .select('id')
        .eq('brand_id', brandId)
        .eq('slug', cleanPayload.slug)
        .single()

      if (fetchError) throw new Error('Product not found after brand creation')

      if (productImageFile.value) {
        productImageUrl = await uploadProductImage(productImageFile.value, newProduct.id)
        await supabaseSafe
          .from('products')
          .update({ image_url: productImageUrl, updated_at: now })
          .eq('id', newProduct.id)
      } else if (cleanPayload.imageUrl) {
        productImageUrl = cleanPayload.imageUrl
        await supabaseSafe
          .from('products')
          .update({ image_url: productImageUrl, updated_at: now })
          .eq('id', newProduct.id)
      }

      cleanPayload.imageUrl = productImageUrl
      const cleanBrandData = {
        id: brandId,
        name: newBrand.name,
        slug: brandSlug,
        category: brandCategory,
        description: brandDescription,
        signature: brandSignature,
        isActive: isBrandActive,
        image: brandImageUrl,
        tenantId: authStore.currentTenant
      }

      authNotification.loggedIn(t('Brand and product added successfully'))
      emit('save', { productData: cleanPayload, createNewBrand: true, newBrandData: cleanBrandData })
    }

    await productsStore.refreshProducts()
    emit('saved')
    emit('close')

  } catch (error: any) {
    console.error('❌ Error saving product:', error)
    const errorMsg = error.message || t('Unknown error')
    alert(t('Failed to save: ') + errorMsg)
  } finally {
    loading.value = false
  }
}

const close = () => {
  if (loading.value) return
  emit('close')
}

// ========== INITIALIZATION ==========
onMounted(async () => {
  await loadBrands()

  if (props.brand) {
    selectedBrandId.value = props.brand.id
    selectedBrand.value = props.brand
    brandSelectionMode.value = 'existing'
  }

  if (props.product) {
    originalProduct.value = { ...props.product }

    Object.assign(productData, {
      ...props.product,
      imageFile: undefined
    })
    if (props.product.classification) {
      productData.classification = props.product.classification
    }
    if (props.product.imageUrl) {
      productImagePreview.value = props.product.imageUrl
      productData.imageUrl = props.product.imageUrl
    }
    if (props.product.notes) {
      productData.notes = {
        top: props.product.notes.top?.length ? props.product.notes.top : [''],
        heart: props.product.notes.heart?.length ? props.product.notes.heart : [''],
        base: props.product.notes.base?.length ? props.product.notes.base : ['']
      }
    }
    if (props.product.brandId) {
      const brand = brandsStore.brands.find(b => b.id === props.product!.brandId)
      if (brand) {
        selectedBrandId.value = brand.id
        selectedBrand.value = brand
        brandSelectionMode.value = 'existing'
      }
    }
  }

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close()
  }
  document.addEventListener('keydown', handleKeydown)

  return () => {
    document.removeEventListener('keydown', handleKeydown)
  }
})
</script>

<style scoped>
/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar,
.max-h-48::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track,
.max-h-48::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb,
.max-h-48::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover,
.max-h-48::-webkit-scrollbar-thumb:hover {
  background: #555;
}

@media (max-height: 700px) {
  .max-h-\[calc\(100vh-300px\)\] {
    max-height: calc(100vh - 250px);
  }
  
  .max-h-48 {
    max-height: 150px;
  }
}

@media (max-width: 640px) {
  button, 
  input:not([type="checkbox"]):not([type="radio"]), 
  select, 
  textarea {
    min-height: 44px;
  }
  
  .text-sm {
    font-size: 0.875rem;
    line-height: 1.25rem;
  }
  
  .text-xs {
    font-size: 0.75rem;
    line-height: 1rem;
  }
}

.break-all {
  word-break: break-all;
}

button, input, select, textarea {
  transition: all 0.2s ease;
}

:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.bg-primary-100 {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
