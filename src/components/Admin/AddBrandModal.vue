<!-- src/components/Admin/AddBrandModal.vue -->
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
                  {{ editing ? t('Edit Brand') : t('Add New Brand') }}
                </h3>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-xs px-2 py-1 rounded-full whitespace-nowrap" 
                        :class="currentStep === 1 ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-800'">
                    Step 1: Brand Info
                  </span>
                  <span class="text-xs px-2 py-1 rounded-full whitespace-nowrap"
                        :class="currentStep === 2 ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-800'">
                    Step 2: Products ({{ products.length }})
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
                    {{ t('Brand Info') }}
                  </button>
                  <button
                    @click="goToStep(2)"
                    :class="currentStep === 2 ? 'text-primary-600 border-primary-600' : 'text-gray-500 border-gray-300'"
                    :disabled="!formData.name"
                    class="flex-1 py-2 text-sm font-medium border-b-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap px-1"
                  >
                    {{ t('Add Products') }}
                    <span v-if="products.length > 0" class="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs bg-primary-500 text-white rounded-full">
                      {{ products.length }}
                    </span>
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
          <!-- Step 1: Brand Information -->
          <div v-if="currentStep === 1" class="space-y-4">
            <!-- Brand Name -->
            <div>
              <label for="brand-name" class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('Brand Name') }} *
              </label>
              <input
                id="brand-name"
                v-model="formData.name"
                type="text"
                :placeholder="t('e.g., Tom Ford')"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm md:text-base"
                :class="{ 'border-red-300': errors.name }"
                required
                @input="generateSlug"
              />
              <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
            </div>

            <!-- Image Upload Section -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('Brand Logo/Image') }} *
              </label>

              <!-- URL Input -->
              <div class="mb-3">
                <label class="block text-xs text-gray-600 mb-1">{{ t('Image URL (optional)') }}</label>
                <div class="flex flex-col sm:flex-row gap-2">
                  <input
                    v-model="formData.image"
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    :class="{ 'border-red-300': errors.image }"
                  />
                  <button
                    type="button"
                    @click="previewImage(formData.image)"
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
                    type="file"
                    id="brand-file"
                    accept="image/*"
                    @change="handleBrandImageUpload"
                    class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                  />
                  <button
                    v-if="brandImageFile"
                    @click="removeBrandImage"
                    type="button"
                    class="inline-flex items-center justify-center px-3 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 text-sm whitespace-nowrap"
                  >
                    {{ t('Remove') }}
                  </button>
                </div>
                <p class="mt-1 text-xs text-gray-500">
                  {{ t('Max 100KB for base64. JPG, PNG, GIF. Small images recommended.') }}
                </p>
              </div>

              <p v-if="errors.image" class="mt-1 text-sm text-red-600">{{ errors.image }}</p>

              <!-- Image Preview -->
              <div v-if="imagePreview" class="mt-3">
                <p class="text-sm text-gray-600 mb-1">{{ t('Image Preview') }}:</p>
                <div class="relative h-32 w-32 border border-gray-300 rounded-md overflow-hidden">
                  <img
                    :src="imagePreview"
                    :alt="t('Brand Image Preview')"
                    class="h-full w-full object-cover"
                    @error="handleImageError"
                  />
                  <button
                    v-if="imagePreview"
                    @click="clearImagePreview"
                    class="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    :title="t('Clear')"
                  >
                    ×
                  </button>
                </div>
                <p v-if="brandImageBase64" class="mt-1 text-xs text-gray-500">
                  {{ t('Image size:') }} {{ formatBytes(brandImageBase64.length) }}
                </p>
              </div>
            </div>

            <!-- Signature Scent -->
            <div>
              <label for="brand-signature" class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('Signature Scent') }}
              </label>
              <input
                id="brand-signature"
                v-model="formData.signature"
                type="text"
                :placeholder="t('e.g., Noir Extreme')"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm md:text-base"
              />
            </div>

            <!-- Slug -->
            <div>
              <label for="brand-slug" class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('URL Slug') }} *
              </label>
              <div class="flex flex-col sm:flex-row gap-2">
                <div class="flex-1 relative rounded-md shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="text-gray-500 text-sm">/brand/</span>
                  </div>
                  <input
                    id="brand-slug"
                    v-model="formData.slug"
                    type="text"
                    :placeholder="t('tom-ford')"
                    class="w-full pl-16 sm:pl-20 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm md:text-base"
                    :class="{ 'border-red-300': errors.slug }"
                    required
                  />
                </div>
                <button
                  type="button"
                  @click="generateSlug"
                  class="inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 whitespace-nowrap"
                >
                  {{ t('Generate') }}
                </button>
              </div>
              <p v-if="errors.slug" class="mt-1 text-sm text-red-600">{{ errors.slug }}</p>
              <p class="mt-1 text-xs text-gray-500">
                {{ t('URL will be:') }} <span class="font-mono text-primary-600 break-all">/brand/{{ formData.slug || 'brand-slug' }}</span>
              </p>
            </div>

            <!-- Category -->
            <div>
              <label for="brand-category" class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('Category') }} *
              </label>
              <select
                id="brand-category"
                v-model="formData.category"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm md:text-base"
                :class="{ 'border-red-300': errors.category }"
                required
              >
                <option value="">{{ t('Select category') }}</option>
                <option value="luxury">{{ t('Luxury') }}</option>
                <option value="designer">{{ t('Designer') }}</option>
                <option value="niche">{{ t('Niche') }}</option>
                <option value="arabic">{{ t('Arabic') }}</option>
                <option value="french">{{ t('French') }}</option>
                <option value="mens-fragrances">{{ t("Men's Fragrances") }}</option>
                <option value="womens-fragrances">{{ t("Women's Fragrances") }}</option>
                <option value="unisex-fragrances">{{ t('Unisex Fragrances') }}</option>
              </select>
              <p v-if="errors.category" class="mt-1 text-sm text-red-600">{{ errors.category }}</p>
            </div>

            <!-- Description -->
            <div>
              <label for="brand-description" class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('Description') }}
              </label>
              <textarea
                id="brand-description"
                v-model="formData.description"
                rows="3"
                :placeholder="t('Brief description about the brand...')"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm md:text-base"
              ></textarea>
            </div>

            <!-- Status -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('Status') }}
              </label>
              <div class="flex flex-wrap items-center gap-4">
                <label class="inline-flex items-center">
                  <input
                    v-model="formData.isActive"
                    type="radio"
                    :value="true"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span class="ml-2 text-sm text-gray-700">{{ t('Active') }}</span>
                </label>
                <label class="inline-flex items-center">
                  <input
                    v-model="formData.isActive"
                    type="radio"
                    :value="false"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span class="ml-2 text-sm text-gray-700">{{ t('Inactive') }}</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Step 2: Add Products -->
          <div v-else-if="currentStep === 2" class="space-y-4">
            <!-- Current Brand Info -->
            <div class="bg-gray-50 rounded-lg p-4 mb-4">
              <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div class="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    :src="imagePreview || formData.image || '/images/brand-default.jpg'"
                    :alt="formData.name"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-medium text-gray-900 truncate">{{ formData.name }}</h4>
                  <p class="text-sm text-gray-600 truncate">/brand/{{ formData.slug }}</p>
                </div>
              </div>
            </div>

            <!-- Products List -->
            <div>
              <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <h4 class="text-sm font-medium text-gray-900">
                  {{ t('Products for') }} {{ formData.name }}
                  <span class="text-gray-500">({{ products.length }})</span>
                </h4>
                <button
                  type="button"
                  @click="addNewProduct"
                  class="inline-flex items-center justify-center px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 whitespace-nowrap"
                >
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                  {{ t('Add Product') }}
                </button>
              </div>

              <!-- Products Grid -->
              <div class="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                <!-- Empty State -->
                <div v-if="products.length === 0" class="text-center py-8 text-gray-500">
                  <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" 
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                  <p class="text-sm">{{ t('No products added yet') }}</p>
                  <p class="text-xs mt-1">{{ t('Add at least one product to complete brand creation') }}</p>
                </div>

                <!-- Product Cards -->
                <div
                  v-for="(product, index) in products"
                  :key="index"
                  class="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div class="flex flex-col sm:flex-row items-start gap-4">
                    <!-- Product Image -->
                    <div class="relative flex-shrink-0">
                      <div class="w-20 h-20 sm:w-16 sm:h-16 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          v-if="product.imageBase64 || product.imageUrl"
                          :src="product.imageBase64 || product.imageUrl"
                          :alt="product.name?.en || ''"
                          class="w-full h-full object-cover"
                          @error="() => handleProductImageError(index)"
                        />
                        <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" 
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                          </svg>
                        </div>
                      </div>
                      <div class="flex gap-1 mt-2 sm:mt-0 sm:absolute sm:-top-1 sm:-right-1">
                        <button
                          @click="uploadProductImage(index)"
                          class="w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:text-primary-600 hover:border-primary-400 transition-colors text-xs"
                          :title="t('Change Image')"
                        >
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                        </button>
                        <button
                          v-if="product.imageBase64 || product.imageUrl"
                          @click="removeProductImage(index)"
                          class="w-6 h-6 bg-red-100 border border-red-300 rounded-full flex items-center justify-center text-red-600 hover:bg-red-200 text-xs"
                          :title="t('Remove Image')"
                        >
                          ×
                        </button>
                      </div>
                      <input
                        type="file"
                        :ref="(el: HTMLInputElement | null) => setProductFileInputRef(el, index)"
                        @change="(event: Event) => handleProductImageUpload(event, index)"
                        accept="image/*"
                        class="hidden"
                      />
                      <p v-if="product.imageBase64" class="text-xs text-gray-500 mt-1">
                        {{ formatBytes(product.imageBase64.length) }}
                      </p>
                    </div>

                    <!-- Product Details -->
                    <div class="flex-1 min-w-0">
                      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                        <div class="flex-1">
                          <input
                            v-model="product.name!.en"
                            type="text"
                            :placeholder="t('Product Name (English)')"
                            class="w-full px-2 py-1 text-sm font-medium text-gray-900 border-0 bg-transparent focus:outline-none focus:ring-0 border-b border-transparent focus:border-gray-300"
                            :class="{ '!border-red-300': productErrors[index]?.nameEn }"
                          />
                          <input
                            v-model="product.name!.ar"
                            type="text"
                            :placeholder="t('Product Name (Arabic)')"
                            class="w-full px-2 py-1 text-sm text-gray-600 border-0 bg-transparent focus:outline-none focus:ring-0 rtl:text-right border-b border-transparent focus:border-gray-300 mt-1"
                            :class="{ '!border-red-300': productErrors[index]?.nameAr }"
                          />
                        </div>
                        <button
                          @click="removeProduct(index)"
                          class="self-end sm:self-start p-1 text-gray-400 hover:text-red-600 transition-colors"
                          :title="t('Remove Product')"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>

                      <!-- Gender Classification Field -->
                      <div class="mb-3">
                        <label class="block text-xs font-medium text-gray-700 mb-1">
                          {{ t('Classification') }} <span class="text-red-500">*</span>
                        </label>
                        <div class="flex gap-4 flex-wrap">
                          <label class="inline-flex items-center gap-1">
                            <input
                              type="radio"
                              v-model="product.classification"
                              value="M"
                              required
                              class="h-3 w-3 text-primary-600 focus:ring-primary-500 border-gray-300"
                            />
                            <span class="text-xs text-gray-700">{{ t('Male') }}</span>
                          </label>
                          <label class="inline-flex items-center gap-1">
                            <input
                              type="radio"
                              v-model="product.classification"
                              value="F"
                              required
                              class="h-3 w-3 text-primary-600 focus:ring-primary-500 border-gray-300"
                            />
                            <span class="text-xs text-gray-700">{{ t('Female') }}</span>
                          </label>
                          <label class="inline-flex items-center gap-1">
                            <input
                              type="radio"
                              v-model="product.classification"
                              value="U"
                              required
                              class="h-3 w-3 text-primary-600 focus:ring-primary-500 border-gray-300"
                            />
                            <span class="text-xs text-gray-700">{{ t('Unisex') }}</span>
                          </label>
                        </div>
                      </div>

                      <!-- Product Fields -->
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                        <div>
                          <label class="block text-xs text-gray-500 mb-1">{{ t('Price') }} ({{ t('currencyLE') }}) *</label>
                          <input
                            v-model.number="product.price"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="450"
                            class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            :class="{ 'border-red-300': productErrors[index]?.price }"
                          />
                        </div>
                        <div>
                          <label class="block text-xs text-gray-500 mb-1">{{ t('Size') }}</label>
                          <select
                            v-model="product.size"
                            class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                          >
                            <option value="50ml">50ml</option>
                            <option value="100ml">100ml</option>
                            <option value="150ml">150ml</option>
                            <option value="200ml">200ml</option>
                          </select>
                        </div>
                        <div>
                          <label class="block text-xs text-gray-500 mb-1">{{ t('Concentration') }}</label>
                          <select
                            v-model="product.concentration"
                            class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                          >
                            <option value="Eau de Parfum">Eau de Parfum</option>
                            <option value="Eau de Toilette">Eau de Toilette</option>
                            <option value="Parfum">Parfum</option>
                            <option value="Cologne">Cologne</option>
                          </select>
                        </div>
                        <div>
                          <label class="block text-xs text-gray-500 mb-1">{{ t('In Stock') }}</label>
                          <select
                            v-model="product.inStock"
                            class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                          >
                            <option :value="true">{{ t('Yes') }}</option>
                            <option :value="false">{{ t('No') }}</option>
                          </select>
                        </div>
                      </div>

                      <!-- Description -->
                      <div class="mt-3">
                        <label class="block text-xs text-gray-500 mb-1">{{ t('Description') }}</label>
                        <textarea
                          v-model="product.description!.en"
                          rows="2"
                          :placeholder="t('Brief description (English)')"
                          class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500 resize-none"
                        ></textarea>
                        <textarea
                          v-model="product.description!.ar"
                          rows="2"
                          :placeholder="t('وصف مختصر (العربية)')"
                          class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500 resize-none rtl:text-right mt-2"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Quick Add Products -->
              <div class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 class="text-sm font-medium text-blue-800 mb-3">{{ t('Quick Add Templates') }}</h4>
                <div class="flex flex-wrap gap-2">
                  <button
                    @click="addProductTemplate('noirExtreme')"
                    class="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors whitespace-nowrap"
                  >
                    Noir Extreme
                  </button>
                  <button
                    @click="addProductTemplate('ombreLeather')"
                    class="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors whitespace-nowrap"
                  >
                    Ombré Leather
                  </button>
                  <button
                    @click="addProductTemplate('tobaccoVanille')"
                    class="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors whitespace-nowrap"
                  >
                    Tobacco Vanille
                  </button>
                  <button
                    @click="addProductTemplate('oudWood')"
                    class="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors whitespace-nowrap"
                  >
                    Oud Wood
                  </button>
                </div>
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
                :disabled="!canProceedToProducts || loading"
                class="w-full sm:w-auto px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ t('Next: Add Products') }}
                <svg class="w-4 h-4 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>

              <button
                v-else-if="currentStep === 2"
                type="button"
                @click="saveBrandAndProducts"
                :disabled="loading || products.length === 0"
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
                  {{ editing ? t('Update Brand') : t('Create Brand') }}
                  <span class="ml-2 text-xs bg-white/30 px-2 py-1 rounded">
                    {{ products.length }} {{ t('products') }}
                  </span>
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
import { ref, reactive, watch, computed, onMounted, onUnmounted } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import { useLanguageStore } from '@/stores/language'
import { useProductsStore } from '@/stores/products'
import { useBrandsStore } from '@/stores/brands'
import { useHomepageStore } from '@/stores/homepage'
import { useAuthStore } from '@/stores/auth'
import type { Brand, Product, Translation } from '@/types'

const languageStore = useLanguageStore()
const productsStore = useProductsStore()
const brandsStore = useBrandsStore()
const homepageStore = useHomepageStore()
const authStore = useAuthStore()

const { t } = languageStore

const props = defineProps<{
  brand?: Brand
}>()

const emit = defineEmits<{
  close: []
  save: [data: { brand: Partial<Brand>, products: Partial<Product>[] }]
}>()

// ========== STRICT BRAND ABBREVIATION MAPPING ==========
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

// Form data
const formData = reactive({
  id: '',
  name: '',
  image: '',
  signature: '',
  slug: '',
  category: '',
  description: '',
  isActive: true
})

// Track base64 image for brand
const brandImageBase64 = ref<string>('')
const brandImageFile = ref<File | null>(null)

type ProductWithTemp = Partial<Product> & {
  imageBase64?: string;
  classification?: string;
}

const products = ref<ProductWithTemp[]>([])

// Form state
const errors = reactive({
  name: '',
  image: '',
  slug: '',
  category: ''
})

const productErrors = ref<any[]>([])
const loading = ref(false)
const imagePreview = ref('')
const productFileInputs = ref<(HTMLInputElement | null)[]>([])
const editing = computed(() => !!props.brand?.id)

const productTemplates: Record<string, ProductWithTemp> = {
  noirExtreme: {
    name: { en: 'Noir Extreme', ar: 'نوار إكستريم' },
    description: { 
      en: 'A luxurious oriental fragrance with notes of vanilla, amber, and spices.', 
      ar: 'عطر شرقي فاخر بنغمات الفانيليا والعنبر والتوابل.' 
    },
    price: 450,
    size: '100ml',
    concentration: 'Eau de Parfum',
    classification: 'M',
    inStock: true
  },
  ombreLeather: {
    name: { en: 'Ombré Leather', ar: 'أومبير ليزر' },
    description: { 
      en: 'A sophisticated leather fragrance with floral and woody notes.', 
      ar: 'عطر جلد متطور بنغمات زهرية وخشبية.' 
    },
    price: 520,
    size: '100ml',
    concentration: 'Eau de Parfum',
    classification: 'M',
    inStock: true
  },
  tobaccoVanille: {
    name: { en: 'Tobacco Vanille', ar: 'تباكو فانيليا' },
    description: { 
      en: 'A warm, spicy fragrance with tobacco leaf and vanilla bean.', 
      ar: 'عطر دافئ وحار بأوراق التبغ وحبوب الفانيليا.' 
    },
    price: 580,
    size: '100ml',
    concentration: 'Eau de Parfum',
    classification: 'U',
    inStock: true
  },
  oudWood: {
    name: { en: 'Oud Wood', ar: 'عود وود' },
    description: { 
      en: 'A rich, woody fragrance with rare oud and exotic spices.', 
      ar: 'عطر خشبي غني بالعود النادر والتوابل الغريبة.' 
    },
    price: 650,
    size: '100ml',
    concentration: 'Eau de Parfum',
    classification: 'U',
    inStock: true
  }
}

const canProceedToProducts = computed(() => {
  return formData.name.trim() && 
         formData.slug.trim() && 
         formData.category.trim()
})

onMounted(() => {
  if (props.brand) {
    Object.assign(formData, {
      id: props.brand.id || '',
      name: props.brand.name || '',
      image: props.brand.image || '',
      signature: props.brand.signature || '',
      slug: props.brand.slug || '',
      category: props.brand.category || '',
      description: props.brand.description || '',
      isActive: props.brand.isActive !== undefined ? props.brand.isActive : true
    })
    
    if (formData.image) {
      imagePreview.value = formData.image
    }
    
    if (props.brand.slug) {
      loadExistingProducts(props.brand.slug)
    }
  } else {
    addNewProduct()
  }
})

const loadExistingProducts = async (brandSlug: string) => {
  try {
    const brandProducts = await productsStore.getProductsByBrand(brandSlug)
    if (brandProducts && brandProducts.length > 0) {
      products.value = brandProducts.map(product => ({
        id: product.id,
        name: product.name || { en: '', ar: '' },
        description: product.description || { en: '', ar: '' },
        price: product.price,
        size: product.size || '100ml',
        concentration: product.concentration || 'Eau de Parfum',
        classification: product.classification || '',
        imageUrl: product.imageUrl || '',
        images: product.images || [],
        inStock: product.inStock !== false,
        isBestSeller: product.isBestSeller || false,
        isFeatured: product.isFeatured || false,
        slug: product.slug || '',
        brand: product.brand || brandSlug,
        brandId: product.brandId || '',
        category: product.category || '',
        sku: product.sku || ''
      }))
    }
  } catch (error) {
    console.error('Error loading existing products:', error)
  }
}

watch(() => formData.image, (newUrl) => {
  if (newUrl && isValidUrl(newUrl)) {
    imagePreview.value = newUrl
    brandImageFile.value = null
    brandImageBase64.value = ''
  } else if (brandImageBase64.value) {
    imagePreview.value = brandImageBase64.value
  } else if (!newUrl) {
    imagePreview.value = ''
  }
})

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

const compressBase64Image = (base64: string, maxSizeKB = 100): string => {
  if (base64.length <= maxSizeKB * 1024) {
    return base64
  }
  console.warn(`Image is too large: ${formatBytes(base64.length)}. Please use a smaller image.`)
  return base64
}

const handleBrandImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || !input.files[0]) return
  
  const file = input.files[0]
  brandImageFile.value = file
  
  if (file.size > 100 * 1024) {
    alert(t('Image must be less than 100KB for base64 storage. Please use a smaller image.'))
    input.value = ''
    brandImageFile.value = null
    return
  }
  
  const reader = new FileReader()
  reader.onload = (e) => {
    const base64 = e.target?.result as string
    brandImageBase64.value = compressBase64Image(base64, 100)
    imagePreview.value = brandImageBase64.value
    formData.image = brandImageBase64.value
  }
  reader.readAsDataURL(file)
  
  errors.image = ''
}

const removeBrandImage = () => {
  brandImageFile.value = null
  brandImageBase64.value = ''
  imagePreview.value = ''
  formData.image = ''
}

const clearImagePreview = () => {
  imagePreview.value = ''
  formData.image = ''
  brandImageFile.value = null
  brandImageBase64.value = ''
}

const previewImage = (url: string) => {
  if (url && isValidUrl(url)) {
    imagePreview.value = url
    brandImageFile.value = null
    brandImageBase64.value = ''
    errors.image = ''
  } else {
    alert(t('Please enter a valid image URL or upload an image'))
  }
}

const handleImageError = () => {
  alert(t('Failed to load image. Please check the URL or upload a new image.'))
  imagePreview.value = ''
  formData.image = ''
}

const generateSlug = () => {
  if (!formData.name) return
  
  const slug = formData.name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
  
  formData.slug = slug
}

const validateForm = () => {
  let isValid = true
  
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })
  
  productErrors.value = []
  
  if (!formData.name.trim()) {
    errors.name = t('Brand name is required')
    isValid = false
  }
  
  if (!formData.image.trim() && !brandImageBase64.value) {
    errors.image = t('Brand image is required (URL or upload)')
    isValid = false
  } else if (formData.image.trim() && !isValidUrl(formData.image)) {
    errors.image = t('Please enter a valid image URL or upload an image')
    isValid = false
  } else if (brandImageBase64.value && brandImageBase64.value.length > 100 * 1024) {
    errors.image = t('Image too large. Must be less than 100KB')
    isValid = false
  }
  
  if (!formData.slug.trim()) {
    errors.slug = t('URL slug is required')
    isValid = false
  } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
    errors.slug = t('Slug can only contain lowercase letters, numbers, and hyphens')
    isValid = false
  }
  
  if (!formData.category.trim()) {
    errors.category = t('Category is required')
    isValid = false
  }
  
  products.value.forEach((product, index) => {
    const productError: any = {}
    
    const name = product.name || { en: '', ar: '' }
    if (!name.en?.trim()) {
      productError.nameEn = t('Product name (English) is required')
      isValid = false
    }
    
    if (!product.price || product.price <= 0) {
      productError.price = t('Price must be greater than 0')
      isValid = false
    }
    
    if (!product.classification) {
      productError.classification = t('Classification is required')
      isValid = false
    }
    
    if (product.imageBase64 && product.imageBase64.length > 100 * 1024) {
      productError.image = t('Product image too large. Must be less than 100KB')
      isValid = false
    }
    
    if (Object.keys(productError).length > 0) {
      productErrors.value[index] = productError
    }
  })
  
  return isValid
}

const addNewProduct = () => {
  const newProduct: ProductWithTemp = {
    id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: { en: '', ar: '' },
    description: { en: '', ar: '' },
    price: 0,
    size: '100ml',
    concentration: 'Eau de Parfum',
    classification: '',
    imageUrl: '',
    imageBase64: '',
    images: [],
    inStock: true,
    isBestSeller: false,
    isFeatured: false,
    brand: formData.slug || '',
    brandId: '',
    category: formData.category || ''
  }
  
  products.value.push(newProduct)
  productFileInputs.value.push(null)
}

const addProductTemplate = (templateName: keyof typeof productTemplates) => {
  const template = productTemplates[templateName]
  
  const name: Translation = {
    en: template.name?.en ?? '',
    ar: template.name?.ar ?? ''
  }
  const description: Translation = {
    en: template.description?.en ?? '',
    ar: template.description?.ar ?? ''
  }
  
  const newProduct: ProductWithTemp = {
    id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    price: template.price,
    size: template.size,
    concentration: template.concentration,
    classification: template.classification,
    imageUrl: '',
    imageBase64: '',
    images: [],
    inStock: template.inStock,
    isBestSeller: false,
    isFeatured: false,
    brand: formData.slug || '',
    brandId: '',
    category: formData.category || ''
  }
  
  products.value.push(newProduct)
  productFileInputs.value.push(null)
}

const removeProduct = (index: number) => {
  if (products.value.length <= 1) {
    alert(t('At least one product is required'))
    return
  }
  
  if (!confirm(t('Are you sure you want to remove this product?'))) return
  
  products.value.splice(index, 1)
  productFileInputs.value.splice(index, 1)
  productErrors.value.splice(index, 1)
}

const removeProductImage = (index: number) => {
  products.value[index].imageUrl = ''
  products.value[index].imageBase64 = ''
  products.value[index].images = []
}

const setProductFileInputRef = (el: HTMLInputElement | null, index: number) => {
  productFileInputs.value[index] = el
}

const uploadProductImage = (index: number) => {
  const input = productFileInputs.value[index]
  if (input) {
    input.click()
  }
}

const handleProductImageUpload = (event: Event, index: number) => {
  const input = event.target as HTMLInputElement
  if (!input.files || !input.files[0]) return

  const file = input.files[0]
  
  if (file.size > 100 * 1024) {
    alert(t('Product image must be less than 100KB for base64 storage. Please use a smaller image.'))
    input.value = ''
    return
  }
  
  const reader = new FileReader()
  reader.onload = (e) => {
    const base64 = e.target?.result as string
    products.value[index].imageBase64 = compressBase64Image(base64, 100)
    products.value[index].imageUrl = products.value[index].imageBase64
    products.value[index].images = [products.value[index].imageBase64!]
  }
  reader.readAsDataURL(file)
  input.value = ''
}

const handleProductImageError = (index: number) => {
  products.value[index].imageUrl = ''
  products.value[index].imageBase64 = ''
  products.value[index].images = []
}

const generateSkuBatch = (brandName: string): void => {
  const { code: brandAbbr, isFallback } = getBrandAbbreviation(brandName)
  
  const genderGroups: Record<string, ProductWithTemp[]> = { M: [], F: [], U: [] }
  products.value.forEach(product => {
    if (product.classification) {
      genderGroups[product.classification].push(product)
    }
  })
  
  Object.entries(genderGroups).forEach(([gender, group]) => {
    group.forEach((product, idx) => {
      const packageNumber = (idx + 1).toString().padStart(3, '0')
      product.sku = `P.N${brandAbbr}${gender}${packageNumber}`
    })
  })
  
  if (isFallback) {
    console.warn(`Brand "${brandName}" not in official mapping, using fallback code: ${brandAbbr}`)
  }
}

const goToStep = (step: number) => {
  if (step === 2 && !canProceedToProducts.value) {
    alert(t('Please complete all required brand information first'))
    return
  }
  currentStep.value = step
}

const saveBrandAndProducts = async () => {
  if (!authStore.isAuthenticated) {
    alert(t('You must be logged in to perform this action'))
    return
  }
  
  if (!authStore.isAdmin) {
    alert(t('You must be logged in as an admin to perform this action'))
    return
  }
  
  if (!validateForm()) {
    return
  }
  
  if (products.value.length === 0) {
    alert(t('Please add at least one product'))
    return
  }
  
  if (!editing.value) {
    generateSkuBatch(formData.name)
  }
  
  loading.value = true
  
  try {
    let brandImage = formData.image
    if (brandImageBase64.value) {
      brandImage = brandImageBase64.value
    }
    
    const brandData: Partial<Brand> = {
      name: formData.name,
      slug: formData.slug,
      image: brandImage,
      signature: formData.signature || '',
      category: formData.category,
      description: formData.description || '',
      isActive: formData.isActive !== false
    }
    
    const productsData: Partial<Product>[] = products.value.map((product) => {
      const imageUrl = product.imageBase64 || product.imageUrl || ''
      
      const productSlug = product.slug || (product.name?.en || '')
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim()
      
      const name = product.name || { en: '', ar: '' }
      const description = product.description || { en: '', ar: '' }
      
      return {
        name: name,
        description: description,
        price: Number(product.price) || 0,
        size: product.size || '100ml',
        concentration: product.concentration || 'Eau de Parfum',
        classification: product.classification || '',
        imageUrl: imageUrl,
        images: imageUrl ? [imageUrl] : [],
        inStock: product.inStock !== false,
        isBestSeller: product.isBestSeller || false,
        isFeatured: product.isFeatured || false,
        slug: productSlug,
        brand: formData.slug,
        brandId: '',
        category: product.category || formData.category,
        sku: product.sku || ''
      }
    })
    
    let result: string | null = null
    
    if (editing.value && formData.id) {
      const success = await brandsStore.updateBrand(formData.id, brandData)
      if (success) {
        result = formData.id
        alert('Brand updated successfully! Product updates are not yet implemented.')
      }
    } else {
      result = await brandsStore.addBrandWithProducts(brandData, productsData)
    }
    
    if (result) {
      await homepageStore.loadHomepageData()
      await productsStore.fetchProducts()
      
      alert(t('Brand and products saved successfully!'))
      
      emit('save', {
        brand: brandData,
        products: productsData
      })
      
      emit('close')
    } else {
      throw new Error('Failed to save brand - store operation returned null')
    }
    
  } catch (error: any) {
    console.error('Error saving brand and products:', error)
    
    if (error.message?.includes('permission') || error.message?.includes('Missing or insufficient')) {
      alert(t('Permission denied. Please check if you have admin privileges.'))
    } else if (error.message?.includes('longer than 1048487 bytes')) {
      alert(t('Image file is too large. Please use smaller images (under 100KB each).'))
    } else if (error.message?.includes('already exists')) {
      alert(t('Brand slug already exists. Please choose a different slug.'))
    } else if (error.message?.includes('exceeds Firestore 1MB limit')) {
      alert(t('Total data too large. Reduce image sizes or number of products.'))
    } else {
      alert(t('Failed to save: ') + (error.message || t('Unknown error')))
    }
  } finally {
    loading.value = false
  }
}

const close = () => {
  if (loading.value) return
  emit('close')
}

onMounted(() => {
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      close()
    }
  }
  document.addEventListener('keydown', handleKeydown)
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })
})

// Ensure onUnmounted is called properly
let cleanup: (() => void) | undefined

onMounted(() => {
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      close()
    }
  }
  document.addEventListener('keydown', handleKeydown)
  cleanup = () => document.removeEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  if (cleanup) cleanup()
})
</script>

<style scoped>
/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar,
.max-h-\[400px\]::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track,
.max-h-\[400px\]::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb,
.max-h-\[400px\]::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover,
.max-h-\[400px\]::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Responsive modal height */
@media (max-height: 700px) {
  .max-h-\[calc\(100vh-300px\)\] {
    max-height: calc(100vh - 250px);
  }
  
  .max-h-\[400px\] {
    max-height: 300px;
  }
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .modal-panel {
    margin: 0.5rem;
    max-width: calc(100% - 1rem);
  }
  
  .product-card {
    padding: 1rem;
  }
  
  .product-image-container {
    width: 100%;
    max-width: 80px;
  }
}

/* Tablet optimizations */
@media (min-width: 641px) and (max-width: 768px) {
  .modal-panel {
    margin: 1rem;
    max-width: calc(100% - 2rem);
  }
}

/* Better touch targets on mobile */
@media (max-width: 640px) {
  button, 
  input:not([type="checkbox"]):not([type="radio"]), 
  select, 
  textarea {
    min-height: 44px;
  }
  
  .product-field-input {
    padding: 0.75rem;
  }
}

/* Ensure text remains readable on small screens */
@media (max-width: 640px) {
  .text-sm {
    font-size: 0.875rem;
    line-height: 1.25rem;
  }
  
  .text-xs {
    font-size: 0.75rem;
    line-height: 1rem;
  }
}

/* Prevent horizontal overflow */
.break-all {
  word-break: break-all;
}

/* Smooth transitions */
button, input, select, textarea {
  transition: all 0.2s ease;
}

/* Focus styles */
:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Step indicator animation */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.bg-primary-100 {
  animation: pulse 2s infinite;
}

/* Loading spinner animation */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>