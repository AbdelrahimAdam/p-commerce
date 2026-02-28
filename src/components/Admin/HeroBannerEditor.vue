<!-- src/components/Admin/HeroBannerEditor.vue -->
<template>
  <div class="hero-banner-editor space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold text-gray-800">Hero Banner</h2>
      <button
        @click="previewBanner"
        class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
      >
        Preview
      </button>
    </div>

    <!-- Status Messages -->
    <div v-if="uploadStatus" class="p-3 rounded-lg" :class="uploadStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'">
      <div class="flex items-center gap-2">
        <svg v-if="uploadStatus.type === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
        <span>{{ uploadStatus.message }}</span>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Image Upload -->
      <div class="space-y-4">
        <label class="block text-sm font-medium text-gray-700">
          Banner Image
        </label>
        
        <!-- Current Image Preview -->
        <div v-if="localData.imageUrl && isBase64Image(localData.imageUrl)" class="mb-4">
          <div class="relative">
            <img 
              :src="localData.imageUrl" 
              alt="Banner preview" 
              class="max-h-48 mx-auto rounded border"
            />
            <div class="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
              Base64 Image
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-2 text-center">
            Size: {{ getImageSize(localData.imageUrl) }}
          </p>
        </div>
        
        <div v-else-if="localData.imageUrl" class="mb-4">
          <img 
            :src="localData.imageUrl" 
            alt="Banner preview" 
            class="max-h-48 mx-auto rounded border"
          />
          <p class="text-xs text-gray-500 mt-2 text-center">
            URL Image
          </p>
        </div>

        <!-- Upload Area -->
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gold-500 transition-colors">
          <input
            type="file"
            ref="fileInput"
            @change="handleImageUpload"
            accept="image/jpeg,image/png,image/webp"
            class="hidden"
            :disabled="isUploading"
          />
          
          <div v-if="isUploading" class="py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
            <p class="mt-2 text-sm text-gray-600">Uploading image...</p>
          </div>
          
          <div v-else>
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            
            <button
              @click="fileInput?.click()"
              class="mt-4 px-4 py-2 bg-gold-500 text-white hover:bg-gold-600 rounded-lg transition-colors"
              :disabled="isUploading"
            >
              {{ localData.imageUrl ? 'Change Image' : 'Upload Image' }}
            </button>
            
            <p class="mt-2 text-sm text-gray-500">
              Max size: 500KB. JPG, PNG, or WebP
            </p>
            <p class="text-xs text-gray-400 mt-1">
              Images are stored as base64 for Spark plan compatibility
            </p>
          </div>
        </div>

        <!-- Clear Image Button -->
        <button
          v-if="localData.imageUrl && !localData.imageUrl.includes('/images/banner.jpg')"
          @click="clearImage"
          class="w-full px-4 py-2 text-sm border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          Remove Custom Image
        </button>
      </div>

      <!-- Text Content -->
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            v-model="localData.title"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors"
            placeholder="Enter banner title"
            @input="emitUpdate"
          />
          <p class="text-xs text-gray-500 mt-1">This appears as the main headline</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Subtitle
          </label>
          <input
            v-model="localData.subtitle"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors"
            placeholder="Enter banner subtitle"
            @input="emitUpdate"
          />
          <p class="text-xs text-gray-500 mt-1">This appears below the title</p>
        </div>

        <!-- Preview Section -->
        <div class="mt-6 p-4 bg-gray-50 rounded-lg border">
          <h3 class="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            Live Preview
          </h3>
          <div class="text-center p-4 bg-white rounded border">
            <h3 class="text-2xl font-bold text-gray-800 mb-2">{{ localData.title || 'Your Title Here' }}</h3>
            <p class="text-gray-600">{{ localData.subtitle || 'Your subtitle here' }}</p>
          </div>
          
          <!-- Quick Tips -->
          <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 class="text-xs font-medium text-blue-800 mb-1">💡 Tips:</h4>
            <ul class="text-xs text-blue-700 space-y-1">
              <li>• Keep titles short and impactful</li>
              <li>• Use compelling action words</li>
              <li>• Test different images for best conversion</li>
              <li>• Changes appear on homepage immediately after saving</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
// homepageStore not used – removed import
import { useLanguageStore } from '@/stores/language'

const props = defineProps<{
  heroBanner: {
    imageUrl: string
    title: string
    subtitle: string
  }
}>()

const emit = defineEmits<{
  update: [data: any]
  changeDetected: []
}>()

const languageStore = useLanguageStore()
const { t } = languageStore

const fileInput = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)
const uploadStatus = ref<{type: 'success' | 'error', message: string} | null>(null)

// Initialize with prop data
const localData = ref({ 
  imageUrl: props.heroBanner?.imageUrl || '/images/banner.jpg',
  title: props.heroBanner?.title || 'Luxury Perfumes',
  subtitle: props.heroBanner?.subtitle || 'Premium Collection'
})

// Check if image is base64
const isBase64Image = (url: string): boolean => {
  return url.startsWith('data:image/')
}

// Get image size in KB
const getImageSize = (base64String: string): string => {
  if (!isBase64Image(base64String)) return 'External URL'
  
  // Base64 string size calculation
  const stringLength = base64String.length - 'data:image/jpeg;base64,'.length
  const sizeInBytes = 4 * Math.ceil(stringLength / 3) * 0.5624896334383812
  const sizeInKB = Math.round(sizeInBytes / 1024)
  return `${sizeInKB}KB`
}

// Emit update immediately
const emitUpdate = () => {
  emit('update', localData.value)
  emit('changeDetected')
}

// Watch for changes and emit updates
watch(localData, (newValue) => {
  emit('update', newValue)
  emit('changeDetected')
}, { deep: true })

const handleImageUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || !input.files[0]) return

  const file = input.files[0]
  
  // Validate file size (500KB max for Spark plan)
  if (file.size > 500 * 1024) {
    uploadStatus.value = {
      type: 'error',
      message: 'Image too large! Maximum size is 500KB for Spark plan.'
    }
    setTimeout(() => { uploadStatus.value = null }, 5000)
    return
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
    uploadStatus.value = {
      type: 'error',
      message: 'Invalid file type. Please upload JPG, PNG, or WebP image.'
    }
    setTimeout(() => { uploadStatus.value = null }, 5000)
    return
  }

  isUploading.value = true
  uploadStatus.value = null

  try {
    console.log('📤 Uploading image...', file.name, (file.size / 1024).toFixed(2) + 'KB')
    
    // Convert to base64 (for Spark plan compatibility)
    const base64String = await convertToBase64(file)
    
    console.log('✅ Image converted to base64, size:', getImageSize(base64String))
    
    // Update local data with base64 string
    localData.value.imageUrl = base64String
    
    // Emit update immediately
    emitUpdate()
    
    uploadStatus.value = {
      type: 'success',
      message: 'Image uploaded successfully! Click "Save Changes" to apply.'
    }
    
    console.log('🎉 Image updated locally')
    
    // Clear status after 5 seconds
    setTimeout(() => { uploadStatus.value = null }, 5000)
    
  } catch (error: any) {
    console.error('❌ Error uploading image:', error)
    
    uploadStatus.value = {
      type: 'error',
      message: `Failed to upload image: ${error.message}`
    }
    
    setTimeout(() => { uploadStatus.value = null }, 5000)
  } finally {
    isUploading.value = false
    // Clear file input
    if (input) input.value = ''
  }
}

// Convert file to base64
const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const base64String = e.target?.result as string
      resolve(base64String)
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read image file'))
    }
    
    reader.readAsDataURL(file)
  })
}

const clearImage = () => {
  localData.value.imageUrl = '/images/banner.jpg'
  emitUpdate()
  
  uploadStatus.value = {
    type: 'success',
    message: 'Image reset to default'
  }
  
  setTimeout(() => { uploadStatus.value = null }, 3000)
}

const previewBanner = () => {
  const previewData = {
    title: localData.value.title,
    subtitle: localData.value.subtitle,
    imageUrl: localData.value.imageUrl
  }
  
  console.log('🔍 Preview data:', previewData)
  alert('Preview would open in new tab. Check console for data.')
}
</script>

<style scoped>
.hero-banner-editor {
  min-height: 400px;
}

/* Smooth transitions */
input, button {
  transition: all 0.2s ease-in-out;
}

/* Custom file upload hover effect */
.border-dashed:hover {
  border-color: #d4af37;
  background-color: rgba(212, 175, 55, 0.02);
}

/* Loading animation */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .hero-banner-editor {
    padding: 1rem;
  }
  
  .grid {
    gap: 1rem;
  }
}
</style>