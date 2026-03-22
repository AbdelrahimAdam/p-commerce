// stores/products.ts - PRODUCTION READY WITH BRAND SUBCOLLECTIONS
import { defineStore } from 'pinia'
import { ref, computed, watch, watchEffect } from 'vue'
import {
  collection,
  getDocs,
  getDoc,
  doc,
  deleteDoc,                         // ✅ added for product deletion
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryConstraint,
  QueryDocumentSnapshot
} from 'firebase/firestore'
import { ref as storageRef, getDownloadURL, listAll, deleteObject } from 'firebase/storage'  // ✅ added deleteObject
import { db, storage } from '@/firebase/config'
import type { Product, FilterOptions, Brand } from '@/types'
import { useLocalStorage } from '@vueuse/core'
import { productNotification } from '@/utils/notifications'
import { LUXURY_CATEGORIES } from '@/utils/luxuryConstants'
import { useBrandsStore } from './brands'
import { useAuthStore } from './auth'

// Simple debounce implementation
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

  /* =========================
   * STATE
   * ========================= */
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

  // Pagination state
  const lastDoc = ref<QueryDocumentSnapshot | null>(null)
  const hasMore = ref(true)
  const pageSize = 24

  // Search & Filter state
  const filters = useLocalStorage<FilterOptions>('luxury_product_filters', {})
  const searchQuery = ref('')
  const selectedSort = ref<string>('newest')

  // Cache state for performance
  const productCache = ref<Map<string, { product: Product; timestamp: number }>>(new Map())
  const brandProductsCache = ref<Map<string, Product[]>>(new Map())

  // Initialization flag
  const isInitialized = ref(false)

  // Debounced version of fetchProducts
  const debouncedFetchProducts = debounce(async (options: FilterOptions = {}, resetPagination: boolean = true) => {
    await fetchProducts(options, resetPagination)
  }, 300)

  /* =========================
   * GETTERS (computed)
   * ========================= */
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
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    }
  })

  const isFiltered = computed(() => Object.keys(filters.value).length > 0 || searchQuery.value.length > 0)

  /* =========================
   * CORE FETCHING METHODS
   * ========================= */

  /**
   * Fetch products from a specific brand's subcollection
   */
  const fetchProductsFromBrand = async (
    brandId: string,
    brand: Brand,
    options: FilterOptions = {},
    isInitialLoad: boolean = true
  ): Promise<Product[]> => {
    try {
      const productsRef = collection(db, 'brands', brandId, 'products')
      const constraints: QueryConstraint[] = [
        where('inStock', '==', true),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      ]

      // Add filters
      if (options.category) constraints.unshift(where('category', '==', options.category))
      if (options.bestseller === true) constraints.unshift(where('isBestSeller', '==', true))
      if (options.isFeatured === true) constraints.unshift(where('isFeatured', '==', true))
      if (options.minPrice !== undefined) constraints.unshift(where('price', '>=', options.minPrice))
      if (options.maxPrice !== undefined) constraints.unshift(where('price', '<=', options.maxPrice))

      // Add pagination for this specific brand
      if (lastDoc.value && !isInitialLoad) {
        constraints.push(startAfter(lastDoc.value))
      }

      const productsQuery = query(productsRef, ...constraints)
      const snapshot = await getDocs(productsQuery)

      if (!snapshot.empty) {
        lastDoc.value = snapshot.docs[snapshot.docs.length - 1]
      }

      const brandProducts = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const cacheKey = `${brandId}_${docSnap.id}`

          // Check cache first
          const cachedEntry = productCache.value.get(cacheKey)
          if (cachedEntry) return cachedEntry.product

          const data = docSnap.data()

          // Enhanced image handling
          let imageUrl = data.imageUrl || ''
          let images: string[] = []

          try {
            if (data.imagePath) {
              const imageRef = storageRef(storage, data.imagePath)
              imageUrl = await getDownloadURL(imageRef)

              const directoryPath = data.imagePath.substring(0, data.imagePath.lastIndexOf('/'))
              const dirRef = storageRef(storage, directoryPath)
              const imageList = await listAll(dirRef)
              images = await Promise.all(imageList.items.map(item => getDownloadURL(item)))
            }

            if (images.length === 0 && Array.isArray(data.images)) images = data.images
            if (!imageUrl && images.length > 0) imageUrl = images[0]
          } catch (imgError) {
            console.warn(`Image loading issue for product ${docSnap.id}:`, imgError)
          }

          const product = {
            id: docSnap.id,
            slug: data.slug || docSnap.id,
            name: data.name || { en: 'Unnamed Product', ar: 'منتج بدون اسم' },
            description: data.description || { en: '', ar: '' },
            brand: brand.name,
            brandSlug: brand.slug,
            brandId: brand.id,
            category: data.category || brand.category || 'luxury',
            price: Number(data.price) || 0,
            originalPrice: Number(data.originalPrice) || Number(data.price) || 0,
            size: data.size || '100ml',
            concentration: data.concentration || 'Eau de Parfum',
            classification: data.classification || '',
            sku: data.sku || '',
            imageUrl: imageUrl,
            images: images,
            isBestSeller: data.isBestSeller || false,
            isFeatured: data.isFeatured || false,
            rating: data.rating || 0,
            reviewCount: data.reviewCount || 0,
            notes: data.notes || { top: [], heart: [], base: [] },
            inStock: data.inStock !== false,
            stockQuantity: data.stockQuantity || 0,
            tenantId: data.tenantId,
            createdAt: data.createdAt || { seconds: Date.now() / 1000, nanoseconds: 0 },
            updatedAt: data.updatedAt || { seconds: Date.now() / 1000, nanoseconds: 0 },
            meta: {
              weight: data.meta?.weight || '250g',
              dimensions: data.meta?.dimensions || '8x4x12 cm',
              origin: data.meta?.origin || brand.name,
              ...data.meta
            }
          } as Product

          // Cache the product
          productCache.value.set(cacheKey, { product, timestamp: Date.now() })
          return product
        })
      )

      // Cache brand products
      brandProductsCache.value.set(brandId, [
        ...(brandProductsCache.value.get(brandId) || []),
        ...brandProducts
      ])

      return brandProducts
    } catch (err: any) {
      console.error(`Error fetching products for brand ${brandId}:`, err)
      return []
    }
  }

  /**
   * Smart product fetching with intelligent brand selection
   */
  const fetchProducts = async (options: FilterOptions = {}, resetPagination: boolean = true) => {
    if (!authStore.currentTenant) {
      console.warn('No tenant ID – cannot fetch products')
      products.value = []
      featuredProducts.value = []
      newArrivals.value = []
      luxuryCollections.value = []
      bestSellerProducts.value = []
      hasMore.value = false
      return
    }

    if (isLoading.value) return

    isLoading.value = true
    isFetchingMore.value = !resetPagination
    error.value = null

    try {
      if (resetPagination) {
        products.value = []
        lastDoc.value = null
        hasMore.value = true
        productCache.value.clear()
        brandProductsCache.value.clear()
      }

      // Load brands if not already loaded
      if (brandsStore.brands.length === 0) {
        await brandsStore.loadBrands()
      }

      // Determine which brands to fetch from – only those belonging to current tenant
      let brandsToFetch = brandsStore.activeBrands.filter(
        brand => brand.tenantId === authStore.currentTenant
      )

      // Filter by brand if specified
      if (options.brand) {
        const brand = brandsToFetch.find(
          b => b.slug === options.brand || b.name === options.brand
        )
        brandsToFetch = brand ? [brand] : []
      }

      // If no brands to fetch, we are done
      if (brandsToFetch.length === 0) {
        products.value = []
        hasMore.value = false
        lastUpdated.value = new Date()
        return
      }

      // Process brands in batches to limit concurrency
      const MAX_CONCURRENT_BRAND_FETCHES = 5
      const allProducts: Product[] = []
      for (let i = 0; i < brandsToFetch.length; i += MAX_CONCURRENT_BRAND_FETCHES) {
        const batch = brandsToFetch.slice(i, i + MAX_CONCURRENT_BRAND_FETCHES)
        const batchPromises = batch.map(brand =>
          fetchProductsFromBrand(brand.id, brand, options, resetPagination)
        )
        const batchResults = await Promise.allSettled(batchPromises)
        batchResults.forEach(result => {
          if (result.status === 'fulfilled') {
            allProducts.push(...result.value)
          }
        })
      }

      // Apply post-fetch filtering and sorting
      let filteredProducts = applyPostFetchFilters(allProducts, options)
      filteredProducts = applySorting(filteredProducts, options.sortBy || selectedSort.value)

      // Deduplicate products
      const uniqueProducts = removeDuplicates(filteredProducts)

      // Update products state
      if (resetPagination) {
        products.value = uniqueProducts
      } else {
        products.value = [...products.value, ...uniqueProducts]
      }

      // Update pagination state
      hasMore.value = allProducts.length >= pageSize
      lastUpdated.value = new Date()

      // Cache to localStorage for offline support
      cacheProducts(uniqueProducts)

      // Derive special collections from loaded products
      if (resetPagination && authStore.currentTenant) {
        deriveSpecialCollections()
      }

      console.log(`✅ Loaded ${uniqueProducts.length} products from ${brandsToFetch.length} brands`)
    } catch (err: any) {
      error.value = err.message || 'Failed to load products'
      productNotification.error('Failed to load luxury products')
      loadFromCache()
    } finally {
      isLoading.value = false
      isFetchingMore.value = false
    }
  }

  /* =========================
   * SPECIAL COLLECTIONS (derived)
   * ========================= */
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

  // Keep these methods for compatibility (they now just call deriveSpecialCollections)
  const fetchFeaturedProducts = async () => deriveSpecialCollections()
  const fetchNewArrivals = async () => deriveSpecialCollections()
  const fetchBestSellers = async () => deriveSpecialCollections()
  const fetchLuxuryCollections = async () => deriveSpecialCollections()

  /* =========================
   * PRODUCT OPERATIONS
   * ========================= */

  const fetchProductBySlug = async (slug: string) => {
    if (!authStore.currentTenant) {
      error.value = 'No tenant context'
      return null
    }
    if (isLoading.value) return null

    isLoading.value = true
    error.value = null

    try {
      // Check cache first
      const cachedProduct = Array.from(productCache.value.values())
        .find(entry => entry.product.slug === slug)?.product

      if (cachedProduct) {
        currentProduct.value = cachedProduct
        return cachedProduct
      }

      // Check loaded products
      let product = products.value.find(p => p.slug === slug)

      if (!product) {
        // Search across all brands of current tenant
        const tenantFilteredBrands = brandsStore.brands.filter(
          brand => brand.tenantId === authStore.currentTenant
        )

        for (const brand of tenantFilteredBrands) {
          try {
            const productsRef = collection(db, 'brands', brand.id, 'products')
            const productQuery = query(
              productsRef,
              where('slug', '==', slug),
              limit(1)
            )

            const snapshot = await getDocs(productQuery)

            if (!snapshot.empty) {
              const docSnap = snapshot.docs[0]
              const data = docSnap.data()

              product = await transformProductData(docSnap, brand, data)
              break
            }
          } catch (err) {
            console.warn(`Product search warning for ${brand.name}:`, err)
            continue
          }
        }

        if (!product) {
          throw new Error(`Product "${slug}" not found`)
        }
      }

      currentProduct.value = product

      // Pre-fetch related products in background
      setTimeout(() => {
        getRelatedProducts(product!).catch(() => {})
      }, 100)

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
      if (!brand) return []
      if (brand.tenantId !== authStore.currentTenant) return []

      // Check cache
      const cached = brandProductsCache.value.get(brand.id)
      if (cached && cached.length > 0) {
        return cached
      }

      const productsRef = collection(db, 'brands', brand.id, 'products')
      const productsQuery = query(
        productsRef,
        where('inStock', '==', true),
        orderBy('createdAt', 'desc')
      )

      const snapshot = await getDocs(productsQuery)

      const brandProducts = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data()
          return await transformProductData(docSnap, brand, data)
        })
      )

      brandProductsCache.value.set(brand.id, brandProducts)
      return brandProducts
    } catch (err: any) {
      console.error(`Error fetching products for brand ${brandSlug}:`, err)
      return []
    }
  }

  const getProductById = async (id: string): Promise<Product | undefined> => {
    // Check cache first
    const cachedProduct = Array.from(productCache.value.values())
      .find(entry => entry.product.id === id)?.product

    if (cachedProduct) return cachedProduct

    // Check loaded products
    let product = products.value.find(p => p.id === id)

    if (!product) {
      // Search across all brands of current tenant
      const tenantFilteredBrands = brandsStore.brands.filter(
        brand => brand.tenantId === authStore.currentTenant
      )

      for (const brand of tenantFilteredBrands) {
        try {
          const productDoc = await getDoc(doc(db, 'brands', brand.id, 'products', id))
          if (productDoc.exists()) {
            const data = productDoc.data()
            product = await transformProductData(productDoc, brand, data)
            break
          }
        } catch (err) {
          console.warn(`Product by ID search warning for ${brand.name}:`, err)
          continue
        }
      }
    }

    return product
  }

  /* =========================
   * DELETE PRODUCT
   * ========================= */
  const deleteProduct = async (productId: string, brandId: string): Promise<boolean> => {
    if (!authStore.isAdmin) {
      productNotification.error('You do not have permission to delete products')
      return false
    }

    try {
      // Reference to the product document in the brand's subcollection
      const productRef = doc(db, 'brands', brandId, 'products', productId)

      // Get product data to check if it has an image stored in Storage
      const productSnap = await getDoc(productRef)
      if (productSnap.exists()) {
        const productData = productSnap.data()
        const imageUrl = productData.imageUrl

        // If the image is stored in Firebase Storage, delete it
        if (imageUrl && imageUrl.includes('firebasestorage.googleapis.com')) {
          try {
            const decodedUrl = decodeURIComponent(imageUrl)
            const match = decodedUrl.match(/\/o\/(.+?)\?/)
            if (match && match[1]) {
              const path = decodeURIComponent(match[1])
              const imageRef = storageRef(storage, path)
              await deleteObject(imageRef)
            }
          } catch (err) {
            console.warn('Failed to delete product image from Storage:', err)
            // Non‑critical, continue
          }
        }
      }

      // Delete the Firestore document
      await deleteDoc(productRef)

      // Remove from local cache and state
      productCache.value.delete(`${brandId}_${productId}`)

      const brandCache = brandProductsCache.value.get(brandId)
      if (brandCache) {
        brandProductsCache.value.set(
          brandId,
          brandCache.filter(p => p.id !== productId)
        )
      }

      // Remove from main products list
      products.value = products.value.filter(p => p.id !== productId)

      // Refresh special collections
      deriveSpecialCollections()

      console.log(`✅ Product ${productId} deleted successfully`)
      return true
    } catch (err: any) {
      console.error('Error deleting product:', err)
      productNotification.error(err.message || 'Failed to delete product')
      return false
    }
  }

  /* =========================
   * FILTERING & SEARCH
   * ========================= */

  const filterProducts = (options: FilterOptions): Product[] => {
    let filtered = [...products.value]

    // Text search
    if (searchQuery.value) {
      const term = searchQuery.value.toLowerCase()
      filtered = filtered.filter(product =>
        product.name.en.toLowerCase().includes(term) ||
        product.name.ar.toLowerCase().includes(term) ||
        product.description.en.toLowerCase().includes(term) ||
        product.description.ar.toLowerCase().includes(term) ||
        product.brand.toLowerCase().includes(term) ||
        product.concentration.toLowerCase().includes(term)
      )
    }

    // Filter by category
    if (options.category) filtered = filtered.filter(p => p.category === options.category)

    // Filter by brand
    if (options.brand) filtered = filtered.filter(p => p.brand === options.brand || p.brandSlug === options.brand)

    // Filter by price range
    if (options.minPrice !== undefined) filtered = filtered.filter(p => p.price >= options.minPrice!)
    if (options.maxPrice !== undefined) filtered = filtered.filter(p => p.price <= options.maxPrice!)

    // Filter by rating
    if (options.minRating !== undefined) filtered = filtered.filter(p => (p.rating ?? 0) >= options.minRating!)

    // Filter by bestseller
    if (options.bestseller !== undefined) filtered = filtered.filter(p => p.isBestSeller === options.bestseller)

    // Filter by featured
    if (options.isFeatured !== undefined) filtered = filtered.filter(p => p.isFeatured === options.isFeatured)

    // Filter by new arrival
    if (options.newArrival !== undefined) {
      const oneMonthAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60)
      filtered = filtered.filter(p => (p.createdAt?.seconds || 0) > oneMonthAgo)
    }

    // Filter by concentration
    if (options.concentration) filtered = filtered.filter(p => p.concentration === options.concentration)

    // Filter by size
    if (options.size) filtered = filtered.filter(p => p.size === options.size)

    // Filter by classification (gender)
    const opts = options as any
    if (opts.classification) filtered = filtered.filter(p => p.classification === opts.classification)

    // Apply sorting
    return applySorting(filtered, options.sortBy || selectedSort.value)
  }

  const searchProducts = (searchTerm: string): Product[] => {
    if (!searchTerm.trim()) return []
    const term = searchTerm.toLowerCase()
    return products.value.filter(product =>
      product.name.en.toLowerCase().includes(term) ||
      product.name.ar.toLowerCase().includes(term) ||
      product.description.en.toLowerCase().includes(term) ||
      product.description.ar.toLowerCase().includes(term) ||
      product.brand.toLowerCase().includes(term) ||
      product.notes.top.some((note: string) => note.toLowerCase().includes(term)) ||
      product.notes.heart.some((note: string) => note.toLowerCase().includes(term)) ||
      product.notes.base.some((note: string) => note.toLowerCase().includes(term)) ||
      product.concentration.toLowerCase().includes(term) ||
      product.size.toLowerCase().includes(term)
    )
  }

  const getRelatedProducts = async (product: Product, limitNum: number = 4): Promise<Product[]> => {
    try {
      // First try to find in loaded products
      let related = products.value
        .filter(p =>
          p.id !== product.id &&
          (p.category === product.category || p.brand === product.brand)
        )
        .slice(0, limitNum)

      // If not enough related products, fetch from the same brand
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

  /* =========================
   * PAGINATION & LOADING
   * ========================= */

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

  /* =========================
   * UTILITY METHODS
   * ========================= */

  const applyPostFetchFilters = (productsArr: Product[], options: FilterOptions): Product[] => {
    let filtered = [...productsArr]
    if (options.categories && Array.isArray(options.categories)) {
      filtered = filtered.filter(p => options.categories!.includes(p.category))
    }
    if (options.brands && Array.isArray(options.brands)) {
      filtered = filtered.filter(p => options.brands!.includes(p.brand))
    }
    return filtered
  }

  const applySorting = (productsArr: Product[], sortBy: string): Product[] => {
    const sorted = [...productsArr]
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

  const removeDuplicates = (productsArr: Product[]): Product[] => {
    const seen = new Set()
    return productsArr.filter(product => {
      const key = `${product.brandId}_${product.slug}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  const transformProductData = async (
    docSnap: any,
    brand: Brand,
    data: any
  ): Promise<Product> => {
    const cacheKey = `${brand.id}_${docSnap.id}`
    const cachedEntry = productCache.value.get(cacheKey)
    if (cachedEntry) return cachedEntry.product

    let imageUrl = data.imageUrl || ''
    let images: string[] = []

    try {
      if (data.imagePath) {
        const imageRef = storageRef(storage, data.imagePath)
        imageUrl = await getDownloadURL(imageRef)
        const directoryPath = data.imagePath.substring(0, data.imagePath.lastIndexOf('/'))
        const dirRef = storageRef(storage, directoryPath)
        const imageList = await listAll(dirRef)
        images = await Promise.all(imageList.items.map(item => getDownloadURL(item)))
      }
      if (images.length === 0 && Array.isArray(data.images)) images = data.images
      if (!imageUrl && images.length > 0) imageUrl = images[0]
    } catch (imgError) {
      console.warn(`Image transform issue for ${docSnap.id}:`, imgError)
    }

    const product = {
      id: docSnap.id,
      slug: data.slug || docSnap.id,
      name: data.name || { en: 'Unnamed Product', ar: 'منتج بدون اسم' },
      description: data.description || { en: '', ar: '' },
      brand: brand.name,
      brandSlug: brand.slug,
      brandId: brand.id,
      category: data.category || brand.category || 'luxury',
      price: Number(data.price) || 0,
      originalPrice: Number(data.originalPrice) || Number(data.price) || 0,
      size: data.size || '100ml',
      concentration: data.concentration || 'Eau de Parfum',
      classification: data.classification || '',
      sku: data.sku || '',
      imageUrl: imageUrl,
      images: images,
      isBestSeller: data.isBestSeller || false,
      isFeatured: data.isFeatured || false,
      rating: data.rating || 0,
      reviewCount: data.reviewCount || 0,
      notes: data.notes || { top: [], heart: [], base: [] },
      inStock: data.inStock !== false,
      stockQuantity: data.stockQuantity || 0,
      tenantId: data.tenantId,
      createdAt: data.createdAt || { seconds: Date.now() / 1000, nanoseconds: 0 },
      updatedAt: data.updatedAt || { seconds: Date.now() / 1000, nanoseconds: 0 },
      meta: {
        weight: data.meta?.weight || '250g',
        dimensions: data.meta?.dimensions || '8x4x12 cm',
        origin: data.meta?.origin || brand.name,
        ...data.meta
      }
    } as Product

    productCache.value.set(cacheKey, { product, timestamp: Date.now() })
    return product
  }

  const cacheProducts = (prods: Product[]) => {
    try {
      const cacheData = {
        products: prods.slice(0, 100),
        timestamp: Date.now(),
        version: '1.0'
      }
      localStorage.setItem('luxury_products_cache', JSON.stringify(cacheData))
    } catch (err) {
      console.warn('Failed to cache products:', err)
    }
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
    } catch (err) {
      console.warn('Cache load failed:', err)
    }
  }

  /* =========================
   * STORE MANAGEMENT
   * ========================= */

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

  // Watch for filter changes to auto-refresh
  watch(
    () => ({ ...filters.value, sort: selectedSort.value }),
    () => {
      if (Object.keys(filters.value).length > 0) {
        debouncedFetchProducts(filters.value, true)
      }
    },
    { deep: true }
  )

  // Watch search query with debounce
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

  /* =========================
   * REACTIVE INITIALIZATION
   * ========================= */
  watchEffect(async () => {
    const tenantId = authStore.currentTenant
    const brandsLoaded = brandsStore.brands.length > 0
    if (tenantId && brandsLoaded && !isInitialized.value) {
      await fetchProducts({}, true)
      isInitialized.value = true
    }
  })

  /* =========================
   * INITIALIZATION
   * ========================= */
  const initialize = async () => {
    isInitialized.value = false
    if (authStore.currentTenant && brandsStore.brands.length > 0) {
      await fetchProducts({}, true)
      isInitialized.value = true
    }
  }

  // Auto-initialize on store creation
  initialize()

  return {
    // State
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

    // Filter state
    filters,
    searchQuery,
    selectedSort,

    // Getters (computed)
    categories,
    luxuryBrands,
    byCategory,
    getCategoryById,
    totalProducts,
    priceRange,
    isFiltered,

    // Actions
    fetchProducts,
    fetchFeaturedProducts,
    fetchNewArrivals,
    fetchBestSellers,
    fetchLuxuryCollections,
    fetchProductBySlug,
    getProductsByBrand,
    getProductById,
    deleteProduct,                      // ✅ added

    // Filtering & Search
    filterProducts,
    searchProducts,
    getRelatedProducts,

    // Pagination
    loadMoreProducts,
    refreshProducts,

    // Store Management
    setFilters,
    resetFilters,
    setSearchQuery,
    setSort,
    clearError,

    // Initialization
    initialize
  }
})