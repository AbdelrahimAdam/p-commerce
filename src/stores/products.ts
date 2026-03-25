import { defineStore } from 'pinia'
import { ref, computed, watch, watchEffect } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { supabase } from '@/supabase/client'
import type { Product, FilterOptions, Brand } from '@/types'
import { productNotification } from '@/utils/notifications'
import { useBrandsStore } from './brands'
import { useAuthStore } from './auth'

// Remove this import to break circular dependency
// import { LUXURY_CATEGORIES } from '@/utils/luxuryConstants'

// Define categories locally or import from a separate file
const LUXURY_CATEGORIES = [
  {
    id: 'arabic-oud',
    en: 'Arabic Oud',
    ar: 'عود عربي',
    description: {
      en: 'Exquisite Arabian oud fragrances with deep, woody notes',
      ar: 'عطور العود العربي الفاخرة مع نوتات خشبية عميقة'
    },
    image: '/images/categories/arabic-oud.jpg',
    featured: true
  },
  {
    id: 'floral',
    en: 'Floral Elegance',
    ar: 'أناقة زهرية',
    description: {
      en: 'Delicate floral compositions for timeless elegance',
      ar: 'تركيبات زهرية رقيقة للأناقة الخالدة'
    },
    image: '/images/categories/floral.jpg',
    featured: true
  },
  {
    id: 'woody',
    en: 'Woody Mystique',
    ar: 'غموض خشبي',
    description: {
      en: 'Rich woody scents with mysterious depth',
      ar: 'عطور خشبية غنية بعمق غامض'
    },
    image: '/images/categories/woody.jpg',
    featured: true
  },
  {
    id: 'fresh',
    en: 'Fresh & Citrus',
    ar: 'عطور منعشة وحمضيات',
    description: {
      en: 'Revitalizing citrus and fresh notes',
      ar: 'نوتات حمضيات ومنعشة منعشة'
    },
    image: '/images/categories/fresh.jpg',
    featured: true
  },
  {
    id: 'oriental',
    en: 'Oriental Spice',
    ar: 'توابل شرقية',
    description: {
      en: 'Warm oriental blends with exotic spices',
      ar: 'مزيج شرقي دافئ مع توابل غريبة'
    },
    image: '/images/categories/oriental.jpg',
    featured: true
  },
  {
    id: 'gourmand',
    en: 'Gourmand Delights',
    ar: 'ملذات جورموند',
    description: {
      en: 'Sweet, edible-inspired luxury fragrances',
      ar: 'عطور فاخرة مستوحاة من الأطعمة الحلوة'
    },
    image: '/images/categories/gourmand.jpg',
    featured: false
  }
] as const

function debounce<F extends (...args: any[]) => any>(func: F, wait: number): (...args: Parameters<F>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<F>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export const useProductsStore = defineStore('products', () => {
  const brandsStore = useBrandsStore()
  const authStore = useAuthStore()

  const products = ref<Product[]>([])
  const featuredProducts = ref<Product[]>([])
  const newArrivals = ref<Product[]>([])
  const luxuryCollections = ref<Product[]>([])
  const bestSellerProducts = ref<Product[]>([])
  const currentProduct = ref<Product | null>(null)
  const isLoading = ref(false)
  const isFetchingMore = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)
  const isInitialLoading = ref(false)

  // Pagination state – cursor based on created_at and id
  const lastCursor = ref<{ created_at: string; id: string } | null>(null)
  const hasMore = ref(true)
  const pageSize = 24

  const filters = useLocalStorage<FilterOptions>('luxury_product_filters', {})
  const searchQuery = ref('')
  const selectedSort = ref<string>('newest')

  const productCache = ref<Map<string, { product: Product; timestamp: number }>>(new Map())
  const brandProductsCache = ref<Map<string, Product[]>>(new Map())
  const isInitialized = ref(false)

  const debouncedFetchProducts = debounce(async (options: FilterOptions = {}, resetPagination: boolean = true) => {
    await fetchProducts(options, resetPagination)
  }, 300)

  const categories = computed(() => LUXURY_CATEGORIES)

  const luxuryBrands = computed(() => {
    const brands = new Set(products.value.map(p => p.brand))
    return Array.from(brands).sort()
  })

  const byCategory = computed(() => (categoryId: string) =>
    products.value
      .filter(p => p.category === categoryId)
      .sort((a, b) => {
        const dateA = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(0)
        const dateB = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(0)
        return dateB.getTime() - dateA.getTime()
      })
  )

  const getCategoryById = computed(() => (id: string) => LUXURY_CATEGORIES.find(c => c.id === id))
  const totalProducts = computed(() => products.value.length)

  const priceRange = computed(() => {
    if (products.value.length === 0) return { min: 0, max: 0 }
    const prices = products.value.map(p => p.price)
    return { min: Math.min(...prices), max: Math.max(...prices) }
  })

  const isFiltered = computed(() => Object.keys(filters.value).length > 0 || searchQuery.value.length > 0)

  // Transform Supabase product row to Product object
  const transformProductRow = async (row: any, brand: Brand): Promise<Product> => {
    const cacheKey = `${brand.id}_${row.id}`
    const cached = productCache.value.get(cacheKey)
    if (cached) return cached.product

    let imageUrl = ''
    let images: string[] = []
    if (row.images && Array.isArray(row.images)) {
      images = await Promise.all(row.images.map(async (path: string) => {
        const { data: urlData } = supabase.storage.from('images').getPublicUrl(path)
        return urlData.publicUrl
      }))
      imageUrl = images[0] || ''
    }

    const categoryName = row.category

    const product: Product = {
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      brand: brand.name,
      brandSlug: brand.slug,
      brandId: brand.id,
      category: categoryName || 'luxury',
      price: row.price,
      originalPrice: row.original_price || row.price,
      size: row.size || '100ml',
      concentration: row.concentration || 'Eau de Parfum',
      classification: row.classification || '',
      sku: row.sku || '',
      imageUrl,
      images,
      isBestSeller: row.is_best_seller || false,
      isFeatured: row.is_featured || false,
      rating: row.rating || 0,
      reviewCount: row.review_count || 0,
      notes: row.notes || { top: [], heart: [], base: [] },
      inStock: row.in_stock !== false,
      stockQuantity: row.stock_quantity || 0,
      tenantId: row.tenant_id,
      createdAt: row.created_at ? { seconds: Math.floor(new Date(row.created_at).getTime() / 1000), nanoseconds: 0 } : null,
      updatedAt: row.updated_at ? { seconds: Math.floor(new Date(row.updated_at).getTime() / 1000), nanoseconds: 0 } : null,
      meta: row.meta || { weight: '250g', dimensions: '8x4x12 cm', origin: brand.name }
    }

    productCache.value.set(cacheKey, { product, timestamp: Date.now() })
    return product
  }

  // Fetch products from a specific brand using the products table
  const fetchProductsFromBrand = async (
    brandId: string,
    brand: Brand,
    options: FilterOptions = {},
    isInitialLoad: boolean = true
  ): Promise<Product[]> => {
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('brand_id', brandId)
        .eq('tenant_id', authStore.currentTenant)
        .eq('in_stock', true)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(pageSize)

      // Apply filters
      if (options.category) query = query.eq('category', options.category)
      if (options.bestseller === true) query = query.eq('is_best_seller', true)
      if (options.isFeatured === true) query = query.eq('is_featured', true)
      if (options.minPrice !== undefined) query = query.gte('price', options.minPrice)
      if (options.maxPrice !== undefined) query = query.lte('price', options.maxPrice)

      // Cursor-based pagination
      if (lastCursor.value && !isInitialLoad) {
        query = query
          .lt('created_at', lastCursor.value.created_at)
          .or(`id.lt.${lastCursor.value.id},created_at.eq.${lastCursor.value.created_at}`)
      }

      const { data, error: fetchError } = await query
      if (fetchError) throw fetchError

      if (!data || data.length === 0) return []

      const lastItem = data[data.length - 1]
      lastCursor.value = {
        created_at: lastItem.created_at,
        id: lastItem.id
      }

      const productsFromBatch = await Promise.all(data.map(row => transformProductRow(row, brand)))
      const existing = brandProductsCache.value.get(brandId) || []
      brandProductsCache.value.set(brandId, [...existing, ...productsFromBatch])
      return productsFromBatch
    } catch (err) {
      console.error(`Error fetching products for brand ${brandId}:`, err)
      return []
    }
  }

  const fetchProducts = async (options: FilterOptions = {}, resetPagination: boolean = true) => {
    if (!authStore.currentTenant) {
      products.value = []
      featuredProducts.value = []
      newArrivals.value = []
      luxuryCollections.value = []
      bestSellerProducts.value = []
      hasMore.value = false
      isInitialLoading.value = false
      return
    }

    if (isLoading.value) return

    isLoading.value = true
    isFetchingMore.value = !resetPagination
    error.value = null

    if (resetPagination && products.value.length === 0) {
      isInitialLoading.value = true
    }

    try {
      if (resetPagination) {
        products.value = []
        lastCursor.value = null
        hasMore.value = true
        productCache.value.clear()
        brandProductsCache.value.clear()
      }

      if (brandsStore.brands.length === 0) {
        await brandsStore.loadBrands()
      }

      let brandsToFetch = brandsStore.activeBrands.filter(
        brand => brand.tenantId === authStore.currentTenant
      )

      if (options.brand) {
        const brand = brandsToFetch.find(b => b.slug === options.brand || b.name === options.brand)
        brandsToFetch = brand ? [brand] : []
      }

      if (brandsToFetch.length === 0) {
        products.value = []
        hasMore.value = false
        lastUpdated.value = new Date()
        return
      }

      const MAX_CONCURRENT = 5
      const allProducts: Product[] = []
      for (let i = 0; i < brandsToFetch.length; i += MAX_CONCURRENT) {
        const batch = brandsToFetch.slice(i, i + MAX_CONCURRENT)
        const batchPromises = batch.map(brand =>
          fetchProductsFromBrand(brand.id, brand, options, resetPagination)
        )
        const results = await Promise.allSettled(batchPromises)
        results.forEach(res => {
          if (res.status === 'fulfilled') allProducts.push(...res.value)
        })
      }

      let filtered = applyPostFetchFilters(allProducts, options)
      filtered = applySorting(filtered, options.sortBy || selectedSort.value)
      const unique = removeDuplicates(filtered)

      if (resetPagination) products.value = unique
      else products.value = [...products.value, ...unique]

      hasMore.value = allProducts.length >= pageSize
      lastUpdated.value = new Date()

      cacheProducts(unique)
      if (resetPagination && authStore.currentTenant) deriveSpecialCollections()
      console.log(`✅ Loaded ${unique.length} products from ${brandsToFetch.length} brands`)
    } catch (err: any) {
      error.value = err.message || 'Failed to load products'
      productNotification.error('Failed to load luxury products')
      loadFromCache()
    } finally {
      isLoading.value = false
      isFetchingMore.value = false
      isInitialLoading.value = false
    }
  }

  const deriveSpecialCollections = () => {
    featuredProducts.value = products.value
      .filter(p => p.isFeatured && p.inStock)
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 12)

    const oneMonthAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60)
    newArrivals.value = products.value
      .filter(p => (p.createdAt?.seconds || 0) > oneMonthAgo && p.inStock)
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      .slice(0, 12)

    bestSellerProducts.value = products.value
      .filter(p => p.isBestSeller && p.inStock)
      .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
      .slice(0, 12)

    luxuryCollections.value = products.value
      .filter(p => p.price > 1000 && p.inStock)
      .sort((a, b) => b.price - a.price)
      .slice(0, 10)
  }

  const fetchFeaturedProducts = async () => deriveSpecialCollections()
  const fetchNewArrivals = async () => deriveSpecialCollections()
  const fetchBestSellers = async () => deriveSpecialCollections()
  const fetchLuxuryCollections = async () => deriveSpecialCollections()

  const fetchProductBySlug = async (slug: string) => {
    if (!authStore.currentTenant) {
      error.value = 'No tenant context'
      return null
    }
    if (isLoading.value) return null

    isLoading.value = true
    error.value = null

    try {
      const cached = Array.from(productCache.value.values()).find(e => e.product.slug === slug)?.product
      if (cached) {
        currentProduct.value = cached
        return cached
      }

      let product = products.value.find(p => p.slug === slug)
      if (!product) {
        const tenantBrands = brandsStore.brands.filter(b => b.tenantId === authStore.currentTenant)
        for (const brand of tenantBrands) {
          const { data, error: fetchError } = await supabase
            .from('products')
            .select('*')
            .eq('brand_id', brand.id)
            .eq('slug', slug)
            .maybeSingle()
          if (fetchError) continue
          if (data) {
            product = await transformProductRow(data, brand)
            break
          }
        }
        if (!product) throw new Error(`Product "${slug}" not found`)
      }

      currentProduct.value = product
      setTimeout(() => getRelatedProducts(product!).catch(() => {}), 100)
      return product
    } catch (err: any) {
      error.value = err.message
      productNotification.error(`Failed to load product: ${err.message}`)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const getProductsByBrand = async (brandSlug: string): Promise<Product[]> => {
    try {
      const brand = brandsStore.brands.find(b => b.slug === brandSlug)
      if (!brand || brand.tenantId !== authStore.currentTenant) return []
      const cached = brandProductsCache.value.get(brand.id)
      if (cached && cached.length) return cached

      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('brand_id', brand.id)
        .eq('tenant_id', authStore.currentTenant)
        .eq('in_stock', true)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      const brandProducts = await Promise.all(data.map(row => transformProductRow(row, brand)))
      brandProductsCache.value.set(brand.id, brandProducts)
      return brandProducts
    } catch (err) {
      console.error(`Error fetching products for brand ${brandSlug}:`, err)
      return []
    }
  }

  const getProductById = async (id: string): Promise<Product | undefined> => {
    const cached = Array.from(productCache.value.values()).find(e => e.product.id === id)?.product
    if (cached) return cached
    let product = products.value.find(p => p.id === id)
    if (!product) {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*, brands!inner(tenant_id, name, slug)')
        .eq('id', id)
        .single()
      if (!fetchError && data) {
        const brand = brandsStore.brands.find(b => b.id === data.brand_id)
        if (brand) product = await transformProductRow(data, brand)
      }
    }
    return product
  }

  const deleteProduct = async (productId: string, brandId: string): Promise<boolean> => {
    if (!authStore.isAdmin) {
      productNotification.error('You do not have permission to delete products')
      return false
    }

    try {
      const { data: productData, error: fetchError } = await supabase
        .from('products')
        .select('images')
        .eq('id', productId)
        .single()
      if (fetchError) throw fetchError

      if (productData?.images && Array.isArray(productData.images)) {
        for (const path of productData.images) {
          await supabase.storage.from('images').remove([path]).catch(console.warn)
        }
      }

      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
      if (deleteError) throw deleteError

      productCache.value.delete(`${brandId}_${productId}`)
      const brandCache = brandProductsCache.value.get(brandId)
      if (brandCache) {
        brandProductsCache.value.set(brandId, brandCache.filter(p => p.id !== productId))
      }
      products.value = products.value.filter(p => p.id !== productId)
      deriveSpecialCollections()
      return true
    } catch (err: any) {
      console.error('Error deleting product:', err)
      productNotification.error(err.message || 'Failed to delete product')
      return false
    }
  }

  const filterProducts = (options: FilterOptions): Product[] => {
    let filtered = [...products.value]
    if (searchQuery.value) {
      const term = searchQuery.value.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.en.toLowerCase().includes(term) ||
        p.name.ar.toLowerCase().includes(term) ||
        p.description.en.toLowerCase().includes(term) ||
        p.description.ar.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        p.concentration.toLowerCase().includes(term)
      )
    }
    if (options.category) filtered = filtered.filter(p => p.category === options.category)
    if (options.brand) filtered = filtered.filter(p => p.brand === options.brand || p.brandSlug === options.brand)
    if (options.minPrice !== undefined) filtered = filtered.filter(p => p.price >= options.minPrice!)
    if (options.maxPrice !== undefined) filtered = filtered.filter(p => p.price <= options.maxPrice!)
    if (options.minRating !== undefined) filtered = filtered.filter(p => (p.rating ?? 0) >= options.minRating!)
    if (options.bestseller !== undefined) filtered = filtered.filter(p => p.isBestSeller === options.bestseller)
    if (options.isFeatured !== undefined) filtered = filtered.filter(p => p.isFeatured === options.isFeatured)
    if (options.newArrival !== undefined) {
      const oneMonthAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60
      filtered = filtered.filter(p => (p.createdAt?.seconds || 0) > oneMonthAgo)
    }
    if (options.concentration) filtered = filtered.filter(p => p.concentration === options.concentration)
    if (options.size) filtered = filtered.filter(p => p.size === options.size)
    const opts = options as any
    if (opts.classification) filtered = filtered.filter(p => p.classification === opts.classification)
    return applySorting(filtered, options.sortBy || selectedSort.value)
  }

  const searchProducts = (searchTerm: string): Product[] => {
    if (!searchTerm.trim()) return []
    const term = searchTerm.toLowerCase()
    return products.value.filter(p =>
      p.name.en.toLowerCase().includes(term) ||
      p.name.ar.toLowerCase().includes(term) ||
      p.description.en.toLowerCase().includes(term) ||
      p.description.ar.toLowerCase().includes(term) ||
      p.brand.toLowerCase().includes(term) ||
      p.notes.top.some((n: string) => n.toLowerCase().includes(term)) ||
      p.notes.heart.some((n: string) => n.toLowerCase().includes(term)) ||
      p.notes.base.some((n: string) => n.toLowerCase().includes(term)) ||
      p.concentration.toLowerCase().includes(term) ||
      p.size.toLowerCase().includes(term)
    )
  }

  const getRelatedProducts = async (product: Product, limitNum: number = 4): Promise<Product[]> => {
    try {
      let related = products.value
        .filter(p => p.id !== product.id && (p.category === product.category || p.brand === product.brand))
        .slice(0, limitNum)
      if (related.length < limitNum && product.brandId) {
        const brandProducts = await getProductsByBrand(product.brandSlug!)
        const additional = brandProducts
          .filter(p => p.id !== product.id && p.category === product.category)
          .slice(0, limitNum - related.length)
        related = [...related, ...additional]
      }
      return related
    } catch (err) {
      console.warn('Error fetching related products:', err)
      return []
    }
  }

  const loadMoreProducts = async () => {
    if (!hasMore.value || isLoading.value || isFetchingMore.value) return
    await fetchProducts(filters.value, false)
  }

  const refreshProducts = async () => {
    productCache.value.clear()
    brandProductsCache.value.clear()
    localStorage.removeItem('luxury_products_cache')
    await fetchProducts(filters.value, true)
  }

  const applyPostFetchFilters = (arr: Product[], opts: FilterOptions): Product[] => {
    let filtered = [...arr]
    if (opts.categories?.length) filtered = filtered.filter(p => opts.categories!.includes(p.category))
    if (opts.brands?.length) filtered = filtered.filter(p => opts.brands!.includes(p.brand))
    return filtered
  }

  const applySorting = (arr: Product[], sortBy: string): Product[] => {
    const sorted = [...arr]
    switch (sortBy) {
      case 'price-low': sorted.sort((a, b) => a.price - b.price); break
      case 'price-high': sorted.sort((a, b) => b.price - a.price); break
      case 'rating': sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)); break
      case 'popular': sorted.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0)); break
      case 'best-selling': sorted.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0)); break
      case 'name-asc': sorted.sort((a, b) => a.name.en.localeCompare(b.name.en)); break
      case 'name-desc': sorted.sort((a, b) => b.name.en.localeCompare(a.name.en)); break
      default: sorted.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    }
    return sorted
  }

  const removeDuplicates = (arr: Product[]): Product[] => {
    const seen = new Set()
    return arr.filter(p => {
      const key = `${p.brandId}_${p.slug}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  const cacheProducts = (prods: Product[]) => {
    try {
      localStorage.setItem('luxury_products_cache', JSON.stringify({
        products: prods.slice(0, 100),
        timestamp: Date.now(),
        version: '1.0'
      }))
    } catch (err) { console.warn('Failed to cache products:', err) }
  }

  const loadFromCache = () => {
    try {
      const cached = localStorage.getItem('luxury_products_cache')
      if (cached) {
        const { products: cachedProducts, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp < 60 * 60 * 1000) {
          products.value = cachedProducts
          console.log('📦 Loaded products from cache')
        }
      }
    } catch (err) { console.warn('Cache load failed:', err) }
  }

  const setFilters = (newFilters: FilterOptions) => {
    filters.value = { ...filters.value, ...newFilters }
    debouncedFetchProducts(filters.value, true)
  }

  const resetFilters = () => {
    filters.value = {}
    searchQuery.value = ''
    selectedSort.value = 'newest'
    debouncedFetchProducts({}, true)
  }

  const setSearchQuery = (query: string) => {
    searchQuery.value = query
    debouncedFetchProducts(filters.value, true)
  }

  const setSort = (sort: string) => {
    selectedSort.value = sort
    debouncedFetchProducts(filters.value, true)
  }

  const clearError = () => { error.value = null }

  watch(
    () => ({ ...filters.value, sort: selectedSort.value }),
    () => {
      if (Object.keys(filters.value).length > 0) debouncedFetchProducts(filters.value, true)
    },
    { deep: true }
  )

  let searchTimeout: NodeJS.Timeout
  watch(
    () => searchQuery.value,
    (newQuery) => {
      clearTimeout(searchTimeout)
      if (newQuery.length >= 2 || newQuery.length === 0) {
        searchTimeout = setTimeout(() => {
          debouncedFetchProducts(filters.value, true)
        }, 300)
      }
    }
  )

  watchEffect(async () => {
    const tenantId = authStore.currentTenant
    const brandsLoaded = brandsStore.brands.length > 0
    if (tenantId && brandsLoaded && !isInitialized.value) {
      await fetchProducts({}, true)
      isInitialized.value = true
    }
  })

  const initialize = async () => {
    isInitialized.value = false
    if (authStore.currentTenant && brandsStore.brands.length > 0) {
      await fetchProducts({}, true)
      isInitialized.value = true
    }
  }

  initialize()

  return {
    products,
    featuredProducts,
    newArrivals,
    luxuryCollections,
    bestSellerProducts,
    currentProduct,
    isLoading,
    isFetchingMore,
    error,
    lastUpdated,
    hasMore,
    isInitialLoading,
    filters,
    searchQuery,
    selectedSort,
    categories,
    luxuryBrands,
    byCategory,
    getCategoryById,
    totalProducts,
    priceRange,
    isFiltered,
    fetchProducts,
    fetchFeaturedProducts,
    fetchNewArrivals,
    fetchBestSellers,
    fetchLuxuryCollections,
    fetchProductBySlug,
    getProductsByBrand,
    getProductById,
    deleteProduct,
    filterProducts,
    searchProducts,
    getRelatedProducts,
    loadMoreProducts,
    refreshProducts,
    setFilters,
    resetFilters,
    setSearchQuery,
    setSort,
    clearError,
    initialize
  }
})