<template>
  <div class="space-y-6">
    <!-- Categories -->
    <div>
      <h3 class="text-lg font-display-en font-bold mb-4">
        {{ currentLanguage === 'en' ? 'Categories' : 'الفئات' }}
      </h3>
      <div class="space-y-2">
        <button
          v-for="category in categories"
          :key="category.id"
          @click="updateFilter('category', category.id)"
          :class="[
            'w-full text-left px-4 py-3 rounded-lg transition-all duration-200',
            filters.category === category.id
              ? 'bg-primary-500 text-white shadow-gold'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          ]"
          :style="{ direction: isRTL ? 'rtl' : 'ltr' }"
        >
          <div class="flex items-center justify-between">
            <span>{{ getCategoryName(category) }}</span>
            <span v-if="categoryCounts[category.id]" class="text-sm opacity-75">
              {{ categoryCounts[category.id] }}
            </span>
          </div>
        </button>
      </div>
    </div>

    <!-- Gender (Classification) Filter -->
    <div>
      <h3 class="text-lg font-display-en font-bold mb-4">
        {{ currentLanguage === 'en' ? 'Gender' : 'الجنس' }}
      </h3>
      <div class="space-y-2">
        <button
          @click="updateFilter('classification', undefined)"
          :class="[
            'w-full text-left px-4 py-3 rounded-lg transition-all duration-200',
            !filters.classification
              ? 'bg-primary-500 text-white shadow-gold'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          ]"
        >
          {{ currentLanguage === 'en' ? 'All' : 'الكل' }}
        </button>
        <button
          @click="updateFilter('classification', 'M')"
          :class="[
            'w-full text-left px-4 py-3 rounded-lg transition-all duration-200',
            filters.classification === 'M'
              ? 'bg-primary-500 text-white shadow-gold'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          ]"
        >
          {{ currentLanguage === 'en' ? 'Men' : 'رجال' }}
        </button>
        <button
          @click="updateFilter('classification', 'F')"
          :class="[
            'w-full text-left px-4 py-3 rounded-lg transition-all duration-200',
            filters.classification === 'F'
              ? 'bg-primary-500 text-white shadow-gold'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          ]"
        >
          {{ currentLanguage === 'en' ? 'Women' : 'نساء' }}
        </button>
        <button
          @click="updateFilter('classification', 'U')"
          :class="[
            'w-full text-left px-4 py-3 rounded-lg transition-all duration-200',
            filters.classification === 'U'
              ? 'bg-primary-500 text-white shadow-gold'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          ]"
        >
          {{ currentLanguage === 'en' ? 'Unisex' : 'للجنسين' }}
        </button>
      </div>
    </div>

    <!-- Price Range -->
    <div>
      <h3 class="text-lg font-display-en font-bold mb-4">
        {{ currentLanguage === 'en' ? 'Price Range' : 'نطاق السعر' }}
      </h3>
      <div class="space-y-2">
        <button
          v-for="range in priceRanges"
          :key="`${range.min}-${range.max}`"
          @click="updatePriceRange(range)"
          :class="[
            'w-full text-left px-4 py-3 rounded-lg transition-all duration-200',
            isPriceRangeSelected(range)
              ? 'bg-primary-500 text-white shadow-gold'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          ]"
        >
          {{ getRangeLabel(range) }}
        </button>
      </div>
    </div>

    <!-- Concentration -->
    <div>
      <h3 class="text-lg font-display-en font-bold mb-4">
        {{ currentLanguage === 'en' ? 'Concentration' : 'التركيز' }}
      </h3>
      <div class="space-y-2">
        <button
          v-for="concentration in concentrations"
          :key="concentration.value"
          @click="updateFilter('concentration', concentration.value)"
          :class="[
            'w-full text-left px-4 py-3 rounded-lg transition-all duration-200',
            filters.concentration === concentration.value
              ? 'bg-primary-500 text-white shadow-gold'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          ]"
        >
          {{ getConcentrationLabel(concentration) }}
        </button>
      </div>
    </div>

    <!-- Sort By -->
    <div>
      <h3 class="text-lg font-display-en font-bold mb-4">
        {{ currentLanguage === 'en' ? 'Sort By' : 'ترتيب حسب' }}
      </h3>
      <div class="space-y-2">
        <button
          v-for="option in sortOptions"
          :key="option.value"
          @click="updateFilter('sortBy', option.value)"
          :class="[
            'w-full text-left px-4 py-3 rounded-lg transition-all duration-200',
            filters.sortBy === option.value
              ? 'bg-primary-500 text-white shadow-gold'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          ]"
        >
          {{ getSortOptionLabel(option) }}
        </button>
      </div>
    </div>

    <!-- Clear Filters -->
    <div>
      <button
        @click="clearFilters"
        class="w-full px-4 py-3 text-gray-600 hover:text-primary-600 
               border border-gray-300 rounded-lg hover:border-primary-500 
               transition-all duration-200"
      >
        {{ currentLanguage === 'en' ? 'Clear All Filters' : 'مسح جميع الفلاتر' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import type { FilterOptions } from '@/types'
import { useLanguageStore } from '@/stores/language'
import { useProductsStore } from '@/stores/products'

// Import constants directly with explicit path to avoid circular dependencies
import LUXURY_PRICE_RANGES from '@/utils/luxuryConstants?raw'
import LUXURY_SORT_OPTIONS from '@/utils/luxuryConstants?raw'
import LUXURY_CONCENTRATIONS from '@/utils/luxuryConstants?raw'

// Better approach: use dynamic import to break circular dependencies
const constants = ref<any>({})

onMounted(async () => {
  try {
    const module = await import('@/utils/luxuryConstants')
    constants.value = module
  } catch (error) {
    console.error('Failed to load constants:', error)
    // Fallback values if import fails
    constants.value = {
      LUXURY_PRICE_RANGES: [
        { min: 0, max: 100, label: { en: 'Under $100', ar: 'أقل من ١٠٠ دولار' } },
        { min: 100, max: 200, label: { en: '$100 - $200', ar: '١٠٠ - ٢٠٠ دولار' } },
        { min: 200, max: 300, label: { en: '$200 - $300', ar: '٢٠٠ - ٣٠٠ دولار' } },
        { min: 300, max: 500, label: { en: '$300 - $500', ar: '٣٠٠ - ٥٠٠ دولار' } },
        { min: 500, max: 1000, label: { en: '$500+', ar: '٥٠٠ دولار فأكثر' } }
      ],
      LUXURY_SORT_OPTIONS: [
        { value: 'newest', label: { en: 'Newest', ar: 'الأحدث' } },
        { value: 'price-low', label: { en: 'Price: Low to High', ar: 'السعر: منخفض إلى مرتفع' } },
        { value: 'price-high', label: { en: 'Price: High to Low', ar: 'السعر: مرتفع إلى منخفض' } }
      ],
      LUXURY_CONCENTRATIONS: [
        { value: 'eau-de-parfum', label: { en: 'Eau de Parfum', ar: 'أو دو بارفيوم' } },
        { value: 'eau-de-toilette', label: { en: 'Eau de Toilette', ar: 'أو دو تواليت' } },
        { value: 'parfum', label: { en: 'Parfum', ar: 'بارفيوم' } }
      ]
    }
  }
})

interface Props {
  filters: FilterOptions
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:filters': [filters: FilterOptions]
}>()

const languageStore = useLanguageStore()
const productsStore = useProductsStore()

// currentLanguage is a string, not a ref
const { currentLanguage, isRTL } = languageStore
const { categories, products } = productsStore

// Safe language for indexing (only 'en' or 'ar')
const safeLang = computed(() => {
  const lang = currentLanguage
  return lang === 'en' || lang === 'ar' ? lang : 'en'
})

// Use constants from loaded module
const concentrations = computed(() => constants.value.LUXURY_CONCENTRATIONS || [])
const priceRanges = computed(() => constants.value.LUXURY_PRICE_RANGES || [])
const sortOptions = computed(() => constants.value.LUXURY_SORT_OPTIONS || [])

// Category counts
const categoryCounts = computed(() => {
  const counts: Record<string, number> = {}
  products.forEach(product => {
    counts[product.category] = (counts[product.category] || 0) + 1
  })
  return counts
})

// Helper methods for localized labels
const getCategoryName = (category: any) => {
  return category[safeLang.value] || category.en || category.id
}

const getRangeLabel = (range: any) => {
  return range?.label?.[safeLang.value] || range?.label?.en || ''
}

const getConcentrationLabel = (concentration: any) => {
  return concentration?.label?.[safeLang.value] || concentration?.label?.en || concentration?.value || ''
}

const getSortOptionLabel = (option: any) => {
  return option?.label?.[safeLang.value] || option?.label?.en || option?.value || ''
}

// Methods
const updateFilter = (key: keyof FilterOptions, value: any) => {
  const newFilters = { ...props.filters }
  
  if (newFilters[key] === value) {
    delete newFilters[key]
  } else {
    newFilters[key] = value
  }
  
  emit('update:filters', newFilters)
}

const updatePriceRange = (range: any) => {
  const newFilters = { ...props.filters }
  
  if (isPriceRangeSelected(range)) {
    delete newFilters.minPrice
    delete newFilters.maxPrice
  } else {
    newFilters.minPrice = range.min
    newFilters.maxPrice = range.max === 1000 ? undefined : range.max
  }
  
  emit('update:filters', newFilters)
}

const clearFilters = () => {
  emit('update:filters', {})
}

const isPriceRangeSelected = (range: any) => {
  return (
    props.filters.minPrice === range.min &&
    (props.filters.maxPrice === range.max || 
     (range.max === 1000 && props.filters.maxPrice === undefined))
  )
}
</script>
