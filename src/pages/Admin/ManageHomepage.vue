<!-- src/pages/Admin/ManageHomepage.vue -->
<template>
  <div class="admin-homepage-management">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-2xl lg:text-3xl font-display-en font-bold text-gray-900 mb-2">
        {{ safeTranslate('Homepage Management') }}
      </h1>
      <p class="text-gray-600">
        {{ safeTranslate('Manage homepage content, featured brands, and exclusive offers') }}
      </p>
    </div>

    <!-- Loading -->
    <div v-if="homepageStore.isLoading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">
        {{ safeTranslate('Loading homepage data...') }}
      </p>
    </div>

    <!-- Error -->
    <div v-else-if="homepageStore.error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-700">{{ homepageStore.error }}</p>
      <button
        @click="loadHomepageData"
        class="mt-2 text-primary-600 hover:text-primary-700"
      >
        {{ safeTranslate('Retry') }}
      </button>
    </div>

    <!-- Main Content -->
    <div v-else class="space-y-8">

      <!-- HERO BANNER -->
      <div class="bg-white rounded-xl border p-6">
        <div class="flex justify-between mb-4">
          <h2 class="font-bold">{{ safeTranslate('Hero Banner') }}</h2>
          <button @click="editingHeroBanner = !editingHeroBanner">
            {{ editingHeroBanner ? safeTranslate('Cancel') : safeTranslate('Edit') }}
          </button>
        </div>

        <div v-if="!editingHeroBanner">
          <img
            :src="(homepageStore.homepageData as any)?.heroBanner?.imageUrl || '/images/banner.jpg'"
            class="w-full h-48 object-cover rounded"
          />
          <h3 class="mt-2 font-bold">
            {{ (homepageStore.homepageData as any)?.heroBanner?.title || 'Luxury Perfumes' }}
          </h3>
          <p class="text-sm text-gray-600">
            {{ (homepageStore.homepageData as any)?.heroBanner?.subtitle || 'Premium Collection' }}
          </p>
        </div>

        <form v-else @submit.prevent="updateHeroBanner" class="space-y-3">
          <input v-model="heroBannerForm.imageUrl" placeholder="Image URL" class="w-full px-3 py-2 border rounded" />
          <input v-model="heroBannerForm.title" placeholder="Title" class="w-full px-3 py-2 border rounded" />
          <input v-model="heroBannerForm.subtitle" placeholder="Subtitle" class="w-full px-3 py-2 border rounded" />
          <button type="submit" :disabled="saving" class="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50">
            {{ safeTranslate('Save Changes') }}
          </button>
        </form>
      </div>

      <!-- FEATURED BRANDS -->
      <div class="bg-white rounded-xl border p-6">
        <div class="flex justify-between mb-4">
          <h2 class="font-bold">
            {{ safeTranslate('Featured Brands') }}
            <span class="text-sm text-gray-500">
              ({{ (homepageStore.homepageData as any)?.featuredBrands?.length || 0 }})
            </span>
          </h2>
          <button @click="showAddBrandModal = true" class="text-primary-600 hover:text-primary-700">
            {{ safeTranslate('Add Brand') }}
          </button>
        </div>

        <div
          v-if="((homepageStore.homepageData as any)?.featuredBrands || []).length === 0"
          class="text-gray-500 text-center py-6"
        >
          {{ safeTranslate('No featured brands added yet') }}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            v-for="(brand, index) in (homepageStore.homepageData as any)?.featuredBrands || []"
            :key="brand.id"
            class="border rounded p-3"
          >
            <img :src="brand.image" class="h-24 w-full object-cover rounded" />
            <h3 class="font-bold mt-2">{{ brand.name }}</h3>
            <p class="text-sm">{{ brand.signature }}</p>
            <p class="text-primary-600">
              {{ brand.price }} {{ safeTranslate('currencyLE') }}
            </p>

            <div class="flex gap-2 mt-2">
              <button @click="editBrand(index)" class="text-blue-600 hover:text-blue-800">{{ safeTranslate('Edit') }}</button>
              <button @click="deleteBrand(index)" class="text-red-600 hover:text-red-800">{{ safeTranslate('Delete') }}</button>
            </div>
          </div>
        </div>
      </div>

      <!-- EXCLUSIVE OFFER -->
      <div class="bg-white rounded-xl border p-6">
        <h2 class="font-bold mb-4">
          {{ safeTranslate("Today's Exclusive Offer") }}
        </h2>

        <div
          v-if="((homepageStore.homepageData as any)?.activeOffers || []).length === 0"
          class="text-gray-500 text-center py-6"
        >
          {{ safeTranslate('No active offer') }}
        </div>

        <div
          v-else
          class="flex gap-4 items-center"
        >
          <img
            :src="(homepageStore.homepageData as any)?.activeOffers?.[0]?.imageUrl"
            class="w-32 h-40 object-cover rounded"
          />
          <div>
            <h3 class="font-bold">
              {{ (homepageStore.homepageData as any)?.activeOffers?.[0]?.title }}
            </h3>
            <p>
              {{ (homepageStore.homepageData as any)?.activeOffers?.[0]?.subtitle }}
            </p>
          </div>
        </div>
      </div>

      <!-- MARQUEE BRANDS -->
      <div class="bg-white rounded-xl border p-6">
        <h2 class="font-bold mb-4">
          {{ safeTranslate('Marquee Brands') }}
          ({{ (homepageStore.homepageData as any)?.marqueeBrands?.length || 0 }})
        </h2>

        <div
          v-if="((homepageStore.homepageData as any)?.marqueeBrands || []).length === 0"
          class="text-gray-500 text-center py-6"
        >
          {{ safeTranslate('No marquee brands added') }}
        </div>

        <div class="flex gap-4">
          <div
            v-for="(brand, index) in (homepageStore.homepageData as any)?.marqueeBrands || []"
            :key="brand.id"
          >
            <img :src="brand.logo" class="h-12" />
            <button @click="deleteMarqueeBrand(index)" class="text-red-600 ml-2">✕</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useHomepageStore } from '@/stores/homepage'
import { useLanguageStore } from '@/stores/language'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const homepageStore = useHomepageStore()
const languageStore = useLanguageStore()
const authStore = useAuthStore()
const router = useRouter()

// Check if user is super admin
if (authStore.user?.role !== 'super-admin') {
  router.push('/admin')
}

// Editing states
const editingHeroBanner = ref(false)
const showAddBrandModal = ref(false)
const showAddOfferModal = ref(false)
const showAddMarqueeBrandModal = ref(false)
const editingBrandIndex = ref<number | null>(null)
const editingOfferIndex = ref<number | null>(null)

// Loading states
const saving = ref(false)
// Removed unused savingBrand and savingOffer

// Form data
const heroBannerForm = reactive({
  imageUrl: '',
  title: '',
  subtitle: ''
})

const brandForm = reactive({
  name: '',
  signature: '',
  image: '',
  slug: '',
  price: 0
})

const offerForm = reactive({
  title: '',
  subtitle: '',
  imageUrl: '',
  oldPrice: 0,
  newPrice: 0
})

const marqueeBrandForm = reactive({
  name: '',
  logo: ''
})

// Translations
const appTranslations = {
  'Homepage Management': { en: 'Homepage Management', ar: 'إدارة الصفحة الرئيسية' },
  'Manage homepage content, featured brands, and exclusive offers': { en: 'Manage homepage content, featured brands, and exclusive offers', ar: 'إدارة محتوى الصفحة الرئيسية، العلامات التجارية المميزة، والعروض الحصرية' },
  'Loading homepage data...': { en: 'Loading homepage data...', ar: 'جاري تحميل بيانات الصفحة الرئيسية...' },
  'Retry': { en: 'Retry', ar: 'إعادة المحاولة' },
  'Hero Banner': { en: 'Hero Banner', ar: 'بانر الرئيسية' },
  'Edit': { en: 'Edit', ar: 'تعديل' },
  'Cancel': { en: 'Cancel', ar: 'إلغاء' },
  'Banner Image URL': { en: 'Banner Image URL', ar: 'رابط صورة البانر' },
  'Recommended size: 1600×900px': { en: 'Recommended size: 1600×900px', ar: 'الحجم الموصى به: 1600×900 بكسل' },
  'Banner Title': { en: 'Banner Title', ar: 'عنوان البانر' },
  'Banner Subtitle': { en: 'Banner Subtitle', ar: 'العنوان الفرعي للبانر' },
  'Saving...': { en: 'Saving...', ar: 'جاري الحفظ...' },
  'Save Changes': { en: 'Save Changes', ar: 'حفظ التغييرات' },
  'Featured Brands': { en: 'Featured Brands', ar: 'العلامات التجارية المميزة' },
  'Add Brand': { en: 'Add Brand', ar: 'إضافة علامة تجارية' },
  'currencyLE': { en: 'EGP', ar: 'ج.م' },
  'Delete': { en: 'Delete', ar: 'حذف' },
  'Move Up': { en: 'Move Up', ar: 'تحريك لأعلى' },
  'Move Down': { en: 'Move Down', ar: 'تحريك لأسفل' },
  'No featured brands added yet': { en: 'No featured brands added yet', ar: 'لم تتم إضافة علامات تجارية مميزة بعد' },
  'Today\'s Exclusive Offer': { en: 'Today\'s Exclusive Offer', ar: 'العرض الحصري اليوم' },
  'Edit Offer': { en: 'Edit Offer', ar: 'تعديل العرض' },
  'Add Offer': { en: 'Add Offer', ar: 'إضافة عرض' },
  'Remove Offer': { en: 'Remove Offer', ar: 'إزالة العرض' },
  'No active offer': { en: 'No active offer', ar: 'لا يوجد عرض نشط' },
  'Add an exclusive offer to showcase on the homepage': { en: 'Add an exclusive offer to showcase on the homepage', ar: 'أضف عرضًا حصريًا لعرضه على الصفحة الرئيسية' },
  'Marquee Brands': { en: 'Marquee Brands', ar: 'علامات الشريط المتحرك' },
  'Add Brand Logo': { en: 'Add Brand Logo', ar: 'إضافة شعار علامة تجارية' },
  'No marquee brands added': { en: 'No marquee brands added', ar: 'لم تتم إضافة علامات للشريط المتحرك' },
  'Edit Brand': { en: 'Edit Brand', ar: 'تعديل العلامة التجارية' },
  'Add New Brand': { en: 'Add New Brand', ar: 'إضافة علامة تجارية جديدة' },
  'Brand Name': { en: 'Brand Name', ar: 'اسم العلامة التجارية' },
  'Signature/Description': { en: 'Signature/Description', ar: 'التوقيع/الوصف' },
  'Image URL': { en: 'Image URL', ar: 'رابط الصورة' },
  'Slug': { en: 'Slug', ar: 'المعرف' },
  'Price': { en: 'Price', ar: 'السعر' },
  'Update Brand': { en: 'Update Brand', ar: 'تحديث العلامة التجارية' },
  'Add New Offer': { en: 'Add New Offer', ar: 'إضافة عرض جديد' },
  'Product Title': { en: 'Product Title', ar: 'عنوان المنتج' },
  'Subtitle/Description': { en: 'Subtitle/Description', ar: 'العنوان الفرعي/الوصف' },
  'Original Price': { en: 'Original Price', ar: 'السعر الأصلي' },
  'Discounted Price': { en: 'Discounted Price', ar: 'السعر بعد الخصم' },
  'Update Offer': { en: 'Update Offer', ar: 'تحديث العرض' },
  'Add Brand Logo for Marquee': { en: 'Add Brand Logo for Marquee', ar: 'إضافة شعار علامة تجارية للشريط المتحرك' },
  'Logo URL': { en: 'Logo URL', ar: 'رابط الشعار' },
  'Recommended: White or transparent background, PNG format': { en: 'Recommended: White or transparent background, PNG format', ar: 'مُستحسن: خلفية بيضاء أو شفافة، بصيغة PNG' },
  'Adding...': { en: 'Adding...', ar: 'جاري الإضافة...' }
}

const safeTranslate = (key: string) => {
  const translations = appTranslations[key as keyof typeof appTranslations]
  if (!translations) return key
  // Fixed: currentLanguage is a string, not an object with value property
  const lang = languageStore.currentLanguage as 'en' | 'ar'
  return translations[lang] || translations.en || key
}

// Load homepage data
const loadHomepageData = async () => {
  await homepageStore.loadHomepageData()
  
  // Initialize form with current data
  const hero = (homepageStore.homepageData as any)?.heroBanner || {}
  Object.assign(heroBannerForm, hero)
}

// Update hero banner using updateHomepageData (which exists)
const updateHeroBanner = async () => {
  saving.value = true
  try {
    await homepageStore.updateHomepageData({ heroBanner: heroBannerForm })
    editingHeroBanner.value = false
    showNotification('success', safeTranslate('Hero banner updated successfully'))
  } catch (error) {
    showNotification('error', safeTranslate('Failed to update hero banner'))
  } finally {
    saving.value = false
  }
}

// Brand management
const editBrand = (index: number) => {
  const brand = (homepageStore.homepageData as any).featuredBrands[index]
  Object.assign(brandForm, brand)
  editingBrandIndex.value = index
  showAddBrandModal.value = true
}

const deleteBrand = async (index: number) => {
  if (!confirm(safeTranslate('Are you sure you want to delete this brand?'))) return
  
  const brands = [...(homepageStore.homepageData as any).featuredBrands]
  brands.splice(index, 1)
  
  try {
    // Fixed: use 'as any' to bypass type checking for dynamic property
    await homepageStore.updateHomepageData({ featuredBrands: brands } as any)
    showNotification('success', safeTranslate('Brand deleted successfully'))
  } catch (error) {
    showNotification('error', safeTranslate('Failed to delete brand'))
  }
}

// Removed unused moveBrandUp, moveBrandDown, saveBrand, cancelBrandEdit, saveOffer, cancelOfferEdit

// Marquee brand management
const deleteMarqueeBrand = async (index: number) => {
  if (!confirm(safeTranslate('Are you sure you want to delete this brand logo?'))) return
  
  const brands = [...(homepageStore.homepageData as any).marqueeBrands]
  brands.splice(index, 1)
  
  try {
    await homepageStore.updateHomepageData({ marqueeBrands: brands })
    showNotification('success', safeTranslate('Marquee brand deleted successfully'))
  } catch (error) {
    showNotification('error', safeTranslate('Failed to delete marquee brand'))
  }
}

const showNotification = (type: 'success' | 'error', message: string) => {
  window.dispatchEvent(new CustomEvent('luxury-notification', {
    detail: {
      type,
      title: type === 'success' ? safeTranslate('Success') : safeTranslate('Error'),
      message,
      duration: 3000
    }
  }))
}

// Initialize
onMounted(() => {
  loadHomepageData()
})
</script>

<style scoped>
.admin-homepage-management {
  min-height: calc(100vh - 12rem);
}

/* Form styles */
input, select, textarea {
  transition: all 0.2s ease;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  ring-width: 2px;
}

/* Button styles */
button {
  transition: all 0.2s ease-in-out;
}

/* Modal animations */
.fixed {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Grid item hover effects */
.border-gray-200:hover {
  border-color: var(--color-primary-500);
  transform: translateY(-2px);
}

/* Image preview styles */
img {
  transition: transform 0.3s ease;
}

img:hover {
  transform: scale(1.05);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .admin-homepage-management :deep(.bg-white) {
    background-color: #1e293b !important;
  }
  
  .admin-homepage-management :deep(.text-gray-900) {
    color: #f1f5f9 !important;
  }
  
  .admin-homepage-management :deep(.text-gray-700) {
    color: #cbd5e1 !important;
  }
  
  .admin-homepage-management :deep(.text-gray-600) {
    color: #94a3b8 !important;
  }
  
  .admin-homepage-management :deep(.border-gray-200) {
    border-color: #334155 !important;
  }
  
  .admin-homepage-management :deep(.bg-gray-50) {
    background-color: #1e293b !important;
  }
}
</style>