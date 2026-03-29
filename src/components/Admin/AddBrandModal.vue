 <!-- src/components/Admin/AddBrandModal.vue -->
<template>
  <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="fixed inset-0 bg-black bg-opacity-75 transition-opacity" @click="close"></div>

    <div class="flex min-h-screen items-end justify-center p-4 text-center sm:items-center sm:p-0">
      <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full mx-auto max-w-4xl">
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

        <div class="px-4 pb-3 sm:px-6 overflow-y-auto max-h-[calc(100vh-300px)]">
          <div v-if="currentStep === 1" class="space-y-4">
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

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('Brand Logo/Image') }} *
              </label>

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
                  {{ t('Images will be stored in Supabase Storage. JPG, PNG, GIF recommended.') }}
                </p>
              </div>

              <p v-if="errors.image" class="mt-1 text-sm text-red-600">{{ errors.image }}</p>

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
              </div>
            </div>

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

          <div v-else-if="currentStep === 2" class="space-y-4">
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

              <div class="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                <div v-if="products.length === 0" class="text-center py-8 text-gray-500">
                  <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" 
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                  <p class="text-sm">{{ t('No products added yet') }}</p>
                  <p class="text-xs mt-1">{{ t('Add at least one product to complete brand creation') }}</p>
                </div>

                <div
                  v-for="(product, index) in products"
                  :key="index"
                  class="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div class="flex flex-col sm:flex-row items-start gap-4">
                    <div class="relative flex-shrink-0">
                      <div class="w-20 h-20 sm:w-16 sm:h-16 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          v-if="product.imagePreview"
                          :src="product.imagePreview"
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
                          v-if="product.imagePreview"
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
                    </div>

                    <div class="flex-1 min-w-0">
                      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                        <div class="flex-1">
                          <input
                            v-model="product.name.en"
                            type="text"
                            :placeholder="t('Product Name (English)')"
                            class="w-full px-2 py-1 text-sm font-medium text-gray-900 border-0 bg-transparent focus:outline-none focus:ring-0 border-b border-transparent focus:border-gray-300"
                            :class="{ '!border-red-300': productErrors[index]?.nameEn }"
                          />
                          <input
                            v-model="product.name.ar"
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

                      <div class="mt-3">
                        <label class="block text-xs text-gray-500 mb-1">{{ t('Description') }}</label>
                        <textarea
                          v-model="product.description.en"
                          rows="2"
                          :placeholder="t('Brief description (English)')"
                          class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500 resize-none"
                        ></textarea>
                        <textarea
                          v-model="product.description.ar"
                          rows="2"
                          :placeholder="t('وصف مختصر (العربية)')"
                          class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500 resize-none rtl:text-right mt-2"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

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

        <div class="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-200">
          <div class="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3">
            <button
              type="button"
              @click="close"
              :disabled="loading"
              class="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {{ t('Cancel') }}
            </button>

            <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
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
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useLanguageStore } from '@/stores/language'
import { useProductsStore } from '@/stores/products'
import { useBrandsStore } from '@/stores/brands'
import { useHomepageStore } from '@/stores/homepage'
import { useAuthStore } from '@/stores/auth'
import { supabaseSafe } from '@/supabase/client'
import type { Brand, Product, Translation } from '@/types'

const languageStore = useLanguageStore()
const productsStore = useProductsStore()
const brandsStore = useBrandsStore()
const homepageStore = useHomepageStore()
const authStore = useAuthStore()
const { t } = languageStore

const props = defineProps<{ brand?: Brand }>()
const emit = defineEmits<{
  close: []
  save: [data: { brand: Partial<Brand>, products: Partial<Product>[] }]
}>()

const currentStep = ref(1)
const formData = reactive({
  id: '', name: '', image: '', signature: '', slug: '', category: '', description: '', isActive: true
})
const brandImageFile = ref<File | null>(null)
const brandImagePreview = ref('')
const loading = ref(false)
const imagePreview = ref('')
const productFileInputs = ref<(HTMLInputElement | null)[]>([])
const editing = computed(() => !!props.brand?.id)

interface ProductWithTemp {
  id?: string
  name: Translation
  description: Translation
  price: number
  size: string
  concentration: string
  classification: string
  imageFile: File | null
  imagePreview: string
  imageUrl: string
  inStock: boolean
}

const products = ref<ProductWithTemp[]>([])
const errors = reactive({ name: '', image: '', slug: '', category: '' })
const productErrors = ref<any[]>([])

const productTemplates: Record<string, Partial<ProductWithTemp>> = {
  noirExtreme: {
    name: { en: 'Noir Extreme', ar: 'نوار إكستريم' },
    description: { en: 'A luxurious oriental fragrance with notes of vanilla, amber, and spices.', ar: 'عطر شرقي فاخر بنغمات الفانيليا والعنبر والتوابل.' },
    price: 450, size: '100ml', concentration: 'Eau de Parfum', classification: 'M', inStock: true
  },
  ombreLeather: {
    name: { en: 'Ombré Leather', ar: 'أومبير ليزر' },
    description: { en: 'A sophisticated leather fragrance with floral and woody notes.', ar: 'عطر جلد متطور بنغمات زهرية وخشبية.' },
    price: 520, size: '100ml', concentration: 'Eau de Parfum', classification: 'M', inStock: true
  },
  tobaccoVanille: {
    name: { en: 'Tobacco Vanille', ar: 'تباكو فانيليا' },
    description: { en: 'A warm, spicy fragrance with tobacco leaf and vanilla bean.', ar: 'عطر دافئ وحار بأوراق التبغ وحبوب الفانيليا.' },
    price: 580, size: '100ml', concentration: 'Eau de Parfum', classification: 'U', inStock: true
  },
  oudWood: {
    name: { en: 'Oud Wood', ar: 'عود وود' },
    description: { en: 'A rich, woody fragrance with rare oud and exotic spices.', ar: 'عطر خشبي غني بالعود النادر والتوابل الغريبة.' },
    price: 650, size: '100ml', concentration: 'Eau de Parfum', classification: 'U', inStock: true
  }
}

const canProceedToProducts = computed(() => formData.name.trim() && formData.slug.trim() && formData.category.trim())

const isValidUrl = (url: string): boolean => {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch { return false }
}

const uploadImageToStorage = async (file: File, path: string): Promise<string> => {
  const client = supabaseSafe.client
  const fileExt = file.name.split('.').pop()
  const fileName = `${path}-${Date.now()}.${fileExt}`
  const filePath = `brands/${fileName}`
  
  const { error: uploadError } = await client.storage
    .from('images')
    .upload(filePath, file, { upsert: true })
  
  if (uploadError) throw uploadError
  
  const { data: urlData } = client.storage.from('images').getPublicUrl(filePath)
  return urlData.publicUrl
}

const uploadProductImageToStorage = async (file: File, productId: string): Promise<string> => {
  const client = supabaseSafe.client
  const fileExt = file.name.split('.').pop()
  const fileName = `${productId}-${Date.now()}.${fileExt}`
  const filePath = `products/${fileName}`
  
  const { error: uploadError } = await client.storage
    .from('images')
    .upload(filePath, file, { upsert: true })
  
  if (uploadError) throw uploadError
  
  const { data: urlData } = client.storage.from('images').getPublicUrl(filePath)
  return urlData.publicUrl
}

const handleBrandImageUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return
  const file = input.files[0]
  brandImageFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    brandImagePreview.value = e.target?.result as string
    imagePreview.value = brandImagePreview.value
  }
  reader.readAsDataURL(file)
  errors.image = ''
}

const removeBrandImage = () => {
  brandImageFile.value = null
  brandImagePreview.value = ''
  formData.image = ''
  imagePreview.value = ''
}

const clearImagePreview = () => {
  imagePreview.value = ''
  formData.image = ''
  brandImageFile.value = null
  brandImagePreview.value = ''
}

const previewImage = (url: string) => {
  if (url && isValidUrl(url)) {
    imagePreview.value = url
    brandImageFile.value = null
    brandImagePreview.value = ''
    errors.image = ''
  } else {
    alert(t('Enter a valid image URL'))
  }
}

const handleImageError = () => {
  alert(t('Failed to load image.'))
}

const generateSlug = () => {
  if (!formData.name) return
  formData.slug = formData.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/--+/g, '-').trim()
}

const validateForm = () => {
  let isValid = true
  Object.keys(errors).forEach(k => errors[k as keyof typeof errors] = '')
  productErrors.value = []

  if (!formData.name.trim()) { errors.name = t('Brand name required'); isValid = false }
  if (!formData.image.trim() && !brandImageFile.value) { errors.image = t('Brand image required'); isValid = false }
  if (!formData.slug.trim()) { errors.slug = t('Slug required'); isValid = false }
  if (!formData.category.trim()) { errors.category = t('Category required'); isValid = false }

  products.value.forEach((p, i) => {
    const err: any = {}
    if (!p.name?.en?.trim()) { err.nameEn = t('Product name required'); isValid = false }
    if (!p.price || p.price <= 0) { err.price = t('Price > 0 required'); isValid = false }
    if (!p.classification) { err.classification = t('Classification required'); isValid = false }
    if (Object.keys(err).length) productErrors.value[i] = err
  })
  return isValid
}

const addNewProduct = () => {
  products.value.push({
    id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: { en: '', ar: '' },
    description: { en: '', ar: '' },
    price: 0,
    size: '100ml',
    concentration: 'Eau de Parfum',
    classification: '',
    imageFile: null,
    imagePreview: '',
    imageUrl: '',
    inStock: true
  })
  productFileInputs.value.push(null)
}

const addProductTemplate = (templateName: keyof typeof productTemplates) => {
  const tpl = productTemplates[templateName]
  products.value.push({
    id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: tpl.name as Translation || { en: '', ar: '' },
    description: tpl.description as Translation || { en: '', ar: '' },
    price: tpl.price || 0,
    size: tpl.size || '100ml',
    concentration: tpl.concentration || 'Eau de Parfum',
    classification: tpl.classification || '',
    imageFile: null,
    imagePreview: '',
    imageUrl: '',
    inStock: tpl.inStock !== false
  })
  productFileInputs.value.push(null)
}

const removeProduct = (idx: number) => {
  if (products.value.length <= 1) { alert(t('At least one product required')); return }
  if (!confirm(t('Remove product?'))) return
  products.value.splice(idx, 1)
  productFileInputs.value.splice(idx, 1)
  productErrors.value.splice(idx, 1)
}

const removeProductImage = (idx: number) => {
  products.value[idx].imageFile = null
  products.value[idx].imagePreview = ''
  products.value[idx].imageUrl = ''
}

const setProductFileInputRef = (el: HTMLInputElement | null, idx: number) => {
  productFileInputs.value[idx] = el
}

const uploadProductImage = (idx: number) => {
  productFileInputs.value[idx]?.click()
}

const handleProductImageUpload = (event: Event, idx: number) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return
  const file = input.files[0]
  products.value[idx].imageFile = file
  const reader = new FileReader()
  reader.onload = (e) => {
    products.value[idx].imagePreview = e.target?.result as string
  }
  reader.readAsDataURL(file)
  input.value = ''
}

const handleProductImageError = (idx: number) => {
  products.value[idx].imageFile = null
  products.value[idx].imagePreview = ''
  products.value[idx].imageUrl = ''
}

const goToStep = (step: number) => {
  if (step === 2 && !canProceedToProducts.value) {
    alert(t('Complete brand info first'))
    return
  }
  currentStep.value = step
}

const saveBrandAndProducts = async () => {
  if (!authStore.isAuthenticated || !authStore.isAdmin) {
    alert(t('Admin login required'))
    return
  }
  if (!validateForm()) return
  if (!products.value.length) {
    alert(t('Add at least one product'))
    return
  }

  loading.value = true
  try {
    let brandImageUrl = ''
    
    if (brandImageFile.value) {
      brandImageUrl = await uploadImageToStorage(brandImageFile.value, `brand_${formData.slug}`)
    } else if (formData.image && isValidUrl(formData.image)) {
      brandImageUrl = formData.image
    }

    const brandData: Partial<Brand> = {
      name: formData.name,
      slug: formData.slug,
      image: brandImageUrl,
      signature: formData.signature || '',
      category: formData.category,
      description: formData.description || '',
      isActive: formData.isActive !== false
    }

    const productsData = await Promise.all(products.value.map(async (p, idx) => {
      let productImageUrl = p.imageUrl || ''
      
      if (p.imageFile) {
        const tempId = `temp_${formData.slug}_${idx}_${Date.now()}`
        productImageUrl = await uploadProductImageToStorage(p.imageFile, tempId)
      }

      return {
        name: p.name || { en: '', ar: '' },
        description: p.description || { en: '', ar: '' },
        notes: { top: [], heart: [], base: [] },
        price: Number(p.price) || 0,
        size: p.size || '100ml',
        concentration: p.concentration || 'Eau de Parfum',
        classification: p.classification || '',
        slug: (p.name?.en || '').toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
        category: formData.category,
        is_best_seller: false,
        is_featured: false,
        stock_quantity: 0,
        sku: '',
        is_active: true,
        image_url: productImageUrl
      }
    }))

    let result: string | null = null
    if (editing.value && formData.id) {
      const success = await brandsStore.updateBrand(formData.id, brandData)
      if (success) result = formData.id
    } else {
      result = await brandsStore.addBrandWithProducts(brandData, productsData)
    }

    if (result) {
      await homepageStore.loadHomepageData()
      await productsStore.fetchProducts()
      alert(t('Brand saved successfully'))
      emit('save', { brand: brandData, products: productsData })
      emit('close')
    } else {
      throw new Error('Save failed')
    }
  } catch (err: any) {
    console.error('Save error:', err)
    if (err.message?.includes('permission')) {
      alert(t('Permission denied'))
    } else if (err.message?.includes('already exists')) {
      alert(t('Slug already exists'))
    } else {
      alert(t('Error: ') + err.message)
    }
  } finally {
    loading.value = false
  }
}

const close = () => {
  if (!loading.value) emit('close')
}

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
    if (formData.image) imagePreview.value = formData.image
  } else {
    addNewProduct()
  }

  const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close()
  }
  document.addEventListener('keydown', handleKey)
  onUnmounted(() => document.removeEventListener('keydown', handleKey))
})
</script>

<style scoped>
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

@media (max-height: 700px) {
  .max-h-\[calc\(100vh-300px\)\] {
    max-height: calc(100vh - 250px);
  }
  .max-h-\[400px\] {
    max-height: 300px;
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

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>