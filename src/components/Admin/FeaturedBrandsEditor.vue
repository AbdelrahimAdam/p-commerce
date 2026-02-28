<!-- src/components/Admin/FeaturedBrandsEditor.vue -->
<template>
  <div class="featured-brands-editor space-y-6">
    <!-- Debug Banner (temporary) -->
    <div v-if="showDebug" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-medium text-yellow-800">Debug Mode</h3>
        <button @click="showDebug = false" class="text-yellow-600 hover:text-yellow-800">
          ✕
        </button>
      </div>
      <div class="mt-2 text-xs text-yellow-700">
        <div>Brands count: {{ localBrands.length }}</div>
        <div>Upload function available: Yes (Firebase Storage)</div>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold text-gray-800">Featured Brands</h2>
      <div class="flex items-center gap-2">
        <!-- Debug Button -->
        <button
          @click="toggleDebug"
          class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Debug
        </button>
        <button
          @click="addBrand"
          class="px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600"
        >
          + Add Brand
        </button>
      </div>
    </div>

    <!-- Brands Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="(brand, index) in localBrands"
        :key="brand.id"
        class="border border-gray-200 rounded-lg p-4 space-y-4 hover:shadow-md transition-shadow"
      >
        <!-- Brand Image -->
        <div class="relative">
          <div class="w-full h-48 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
            <img
              v-if="brand.image"
              :src="brand.image"
              :alt="brand.name"
              class="w-full h-full object-cover"
              @error="() => handleImageError(brand)"
            />
            <div v-else class="text-gray-400 text-center p-4">
              <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <p class="text-sm">No image</p>
            </div>
          </div>
          
          <!-- Image Upload Button -->
          <button
            @click="uploadBrandImage(index)"
            class="absolute top-2 right-2 bg-white p-2 rounded-full shadow hover:bg-gray-50 transition-colors"
            :title="brand.image ? 'Change Image' : 'Upload Image'"
          >
            📷
          </button>
          <input
            type="file"
            :ref="(el) => setFileInputRef(el, index)"
            @change="(event) => handleBrandImageUpload(event, index)"
            accept="image/*"
            class="hidden"
          />
        </div>

        <!-- Brand Details -->
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
            <input
              v-model="brand.name"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
              placeholder="e.g., Chanel"
              @input="emitUpdate"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Signature Scent</label>
            <input
              v-model="brand.signature"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
              placeholder="e.g., Coco Mademoiselle"
              @input="emitUpdate"
            />
          </div>
          
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Price (EGP)</label>
              <input
                v-model.number="brand.price"
                type="number"
                min="0"
                step="10"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                placeholder="600"
                @input="emitUpdate"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
              <input
                v-model="brand.slug"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                placeholder="chanel"
                @input="emitUpdate"
              />
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-between items-center pt-3 border-t">
          <button
            @click="removeBrand(index)"
            class="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            Remove
          </button>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">#{{ index + 1 }}</span>
            <span v-if="brand.image" class="text-xs text-green-600 px-2 py-1 bg-green-100 rounded">
              Image ✓
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Messages -->
    <div v-if="uploadStatus" class="p-4 rounded-lg" :class="uploadStatus.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'">
      <div class="flex items-center gap-2">
        <svg v-if="uploadStatus.type === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span>{{ uploadStatus.message }}</span>
      </div>
    </div>

    <!-- Instructions -->
    <div class="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h3 class="text-sm font-medium text-blue-700 mb-2 flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        Tips for Best Results
      </h3>
      <ul class="text-sm text-blue-600 space-y-1.5">
        <li class="flex items-start gap-2">
          <span class="text-blue-500 mt-0.5">•</span>
          <span>Upload high-quality brand images (400×300px recommended)</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-500 mt-0.5">•</span>
          <span>Keep slugs URL-friendly: lowercase, hyphens, no spaces (e.g., "tom-ford")</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-500 mt-0.5">•</span>
          <span>Maximum 6 brands recommended for optimal homepage layout</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-500 mt-0.5">•</span>
          <span>Images should be in JPG or PNG format, max 5MB</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage' // removed unused getStorage
import { storage } from '@/firebase/config' // assuming you have this configured

interface Brand {
  id: string
  name: string
  image: string
  signature: string
  price: number
  slug: string
}

interface UploadStatus {
  type: 'success' | 'error'
  message: string
}

const props = defineProps<{
  brands: Brand[]
}>()

const emit = defineEmits<{
  update: [brands: Brand[]]
  changeDetected: []
}>()

// State
const localBrands = ref<Brand[]>([...props.brands])
const fileInputs = ref<(HTMLInputElement | null)[]>([])
const showDebug = ref(false)
const uploadStatus = ref<UploadStatus | null>(null)

// Helper: set file input ref – accept any to avoid type mismatch
const setFileInputRef = (el: any, index: number) => {
  if (el instanceof HTMLInputElement) {
    fileInputs.value[index] = el
  } else {
    fileInputs.value[index] = null
  }
}

// Show status message
const showStatus = (type: 'success' | 'error', message: string) => {
  uploadStatus.value = { type, message }
  setTimeout(() => {
    uploadStatus.value = null
  }, 5000)
}

// Emit update function
const emitUpdate = () => {
  emit('update', localBrands.value)
  emit('changeDetected')
}

// Toggle debug mode
const toggleDebug = () => {
  showDebug.value = !showDebug.value
  if (showDebug.value) {
    console.log('🐛 Debug Mode Activated')
    console.log('📋 Current brands:', localBrands.value)
  }
}

// Add brand
const addBrand = () => {
  const newId = Date.now().toString()
  localBrands.value.push({
    id: newId,
    name: '',
    image: '',
    signature: '',
    price: 0,
    slug: ''
  })
  fileInputs.value.push(null)
  emitUpdate()
  showStatus('success', 'New brand added')
}

// Remove brand
const removeBrand = (index: number) => {
  if (localBrands.value.length > 1) {
    const brandName = localBrands.value[index].name || `Brand #${index + 1}`
    localBrands.value.splice(index, 1)
    fileInputs.value.splice(index, 1)
    emitUpdate()
    showStatus('success', `"${brandName}" removed`)
  } else {
    alert('At least one brand must remain')
  }
}

// Trigger file input
const uploadBrandImage = (index: number) => {
  const input = fileInputs.value[index]
  if (input) {
    console.log(`📸 Triggering file input for brand ${index}`)
    input.click()
  } else {
    console.error(`❌ File input not found for brand ${index}`)
  }
}

// Handle image upload to Firebase Storage
const handleBrandImageUpload = async (event: Event, index: number) => {
  console.log('🔄 handleBrandImageUpload called')
  
  const input = event.target as HTMLInputElement
  if (!input.files || !input.files[0]) {
    console.log('❌ No file selected')
    return
  }

  const file = input.files[0]
  console.log('📄 Selected file:', {
    name: file.name,
    type: file.type,
    size: `${(file.size / 1024).toFixed(2)} KB`
  })
  
  // Validate file size
  if (file.size > 5 * 1024 * 1024) {
    showStatus('error', 'Image must be less than 5MB')
    return
  }
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    showStatus('error', 'Please select an image file (JPG, PNG, etc.)')
    return
  }
  
  try {
    showStatus('success', 'Uploading image...')
    
    // Create a unique filename
    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_')
    const filePath = `brands/${timestamp}_${safeName}`
    const fileRef = storageRef(storage, filePath)
    
    // Upload file
    await uploadBytes(fileRef, file)
    
    // Get download URL
    const downloadURL = await getDownloadURL(fileRef)
    
    console.log('✅ Image uploaded successfully:', downloadURL)
    
    // Update the brand image
    localBrands.value[index].image = downloadURL
    emitUpdate()
    
    showStatus('success', 'Image uploaded successfully!')
    
    // Reset the file input
    input.value = ''
    
  } catch (error: any) {
    console.error('❌ Error uploading brand image:', error)
    showStatus('error', `Failed to upload image: ${error.message || 'Unknown error'}`)
  }
}

// Handle image load error
const handleImageError = (brand: Brand) => {
  console.warn(`⚠️ Image failed to load: ${brand.image}`)
  brand.image = '' // Clear invalid image URL
  emitUpdate()
}

// Initialize file inputs array
onMounted(() => {
  fileInputs.value = new Array(localBrands.value.length).fill(null)
  console.log(`✅ FeaturedBrandsEditor mounted with ${localBrands.value.length} brands`)
})
</script>

<style scoped>
.featured-brands-editor {
  min-height: 500px;
}

/* Custom scrollbar for better UX */
.featured-brands-editor *::-webkit-scrollbar {
  width: 6px;
}

.featured-brands-editor *::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.featured-brands-editor *::-webkit-scrollbar-thumb {
  background: #d4af37;
  border-radius: 3px;
}

.featured-brands-editor *::-webkit-scrollbar-thumb:hover {
  background: #b8941f;
}

/* Smooth transitions */
.featured-brands-editor * {
  transition: all 0.2s ease;
}

/* Focus styles */
.featured-brands-editor input:focus,
.featured-brands-editor button:focus {
  outline: none;
  ring: 2px;
  ring-color: #d4af37;
}

/* Image hover effect */
.featured-brands-editor img {
  transition: transform 0.3s ease;
}

.featured-brands-editor img:hover {
  transform: scale(1.02);
}
</style>