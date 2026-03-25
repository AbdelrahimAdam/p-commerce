<!-- src/pages/Admin/HomepagePreviewPage.vue -->
<template>
  <div class="homepage-preview-page">
    <div class="preview-header bg-white border-b p-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-semibold">Homepage Preview</h1>
          <p class="text-gray-600 text-sm">Preview changes before publishing</p>
        </div>
        <div class="flex gap-2">
          <button
            @click="$router.back()"
            class="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Back to Editor
          </button>
          <button
            @click="saveChanges"
            class="px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600"
          >
            Publish Changes
          </button>
        </div>
      </div>
    </div>

    <!-- Preview Container -->
    <div class="preview-container">
      <HomePage :isPreview="true" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHomepageStore } from '@/stores/homepage'
import { useAuthStore } from '@/stores/auth'
import HomePage from '@/pages/HomePage.vue'

const router = useRouter()
const homepageStore = useHomepageStore()
const authStore = useAuthStore()

// ✅ Admin guard
if (!authStore.isAdmin) {
  router.push('/admin')
}

onMounted(async () => {
  await homepageStore.loadHomepageData()
})

const saveChanges = async () => {
  try {
    // Save logic here
    router.push('/admin/homepage')
  } catch (error) {
    console.error('Error saving changes:', error)
  }
}
</script>

<style scoped>
.homepage-preview-page {
  min-height: 100vh;
  background-color: #f9fafb;
}

.preview-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: white;
}

.preview-container {
  padding: 20px;
  background-color: #f9fafb;
}
</style>