// src/composables/useSupabaseProducts.ts
import { ref, computed, onUnmounted } from 'vue'
import { supabase } from '@/supabase/client'
import type { Product, FilterOptions } from '@/types'

export const useSupabaseProducts = () => {
  const products = ref<Product[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  let subscription: ReturnType<typeof supabase.channel> | null = null

  // Fetch products with real-time updates
  const fetchProducts = async (options: FilterOptions = {}) => {
    loading.value = true
    error.value = null

    try {
      let query = supabase
        .from('products')
        .select('*, brands(name, slug)')
        .eq('in_stock', true)

      // Apply filters
      if (options.category) {
        query = query.eq('category', options.category)
      }

      if (options.minPrice !== undefined) {
        query = query.gte('price', options.minPrice)
      }

      if (options.maxPrice !== undefined) {
        query = query.lte('price', options.maxPrice)
      }

      // Apply sorting
      switch (options.sortBy) {
        case 'price-low':
          query = query.order('price', { ascending: true })
          break
        case 'price-high':
          query = query.order('price', { ascending: false })
          break
        case 'popular':
          query = query.order('is_best_seller', { ascending: false })
          break
        default:
          query = query.order('created_at', { ascending: false })
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      products.value = (data || []).map((item: any) => ({
        id: item.id,
        slug: item.slug,
        name: item.name,
        description: item.description,
        brand: item.brands?.name,
        brandSlug: item.brands?.slug,
        brandId: item.brand_id,
        category: item.category,
        price: item.price,
        originalPrice: item.original_price,
        size: item.size,
        concentration: item.concentration,
        classification: item.classification,
        imageUrl: item.image_url,
        images: item.images || [],
        isBestSeller: item.is_best_seller,
        isFeatured: item.is_featured,
        rating: item.rating,
        reviewCount: item.review_count,
        notes: item.notes || { top: [], heart: [], base: [] },
        inStock: item.in_stock,
        stockQuantity: item.stock_quantity,
        sku: item.sku,
        tenantId: item.tenant_id,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        meta: item.meta
      })) as Product[]

      // Set up real-time listener for updates
      if (subscription) {
        supabase.removeChannel(subscription)
      }

      subscription = supabase
        .channel('products-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'products'
          },
          (payload) => {
            // Handle real-time updates
            if (payload.eventType === 'INSERT') {
              // Add new product to list
              const newProduct = payload.new as any
              products.value = [{
                id: newProduct.id,
                slug: newProduct.slug,
                name: newProduct.name,
                description: newProduct.description,
                brand: newProduct.brands?.name,
                brandSlug: newProduct.brands?.slug,
                brandId: newProduct.brand_id,
                category: newProduct.category,
                price: newProduct.price,
                originalPrice: newProduct.original_price,
                size: newProduct.size,
                concentration: newProduct.concentration,
                classification: newProduct.classification,
                imageUrl: newProduct.image_url,
                images: newProduct.images || [],
                isBestSeller: newProduct.is_best_seller,
                isFeatured: newProduct.is_featured,
                rating: newProduct.rating,
                reviewCount: newProduct.review_count,
                notes: newProduct.notes || { top: [], heart: [], base: [] },
                inStock: newProduct.in_stock,
                stockQuantity: newProduct.stock_quantity,
                sku: newProduct.sku,
                tenantId: newProduct.tenant_id,
                createdAt: newProduct.created_at,
                updatedAt: newProduct.updated_at,
                meta: newProduct.meta
              } as Product, ...products.value]
            } else if (payload.eventType === 'UPDATE') {
              // Update existing product
              const updatedProduct = payload.new as any
              const index = products.value.findIndex(p => p.id === updatedProduct.id)
              if (index !== -1) {
                products.value[index] = {
                  ...products.value[index],
                  ...updatedProduct
                }
              }
            } else if (payload.eventType === 'DELETE') {
              // Remove deleted product
              const deletedId = payload.old.id
              products.value = products.value.filter(p => p.id !== deletedId)
            }
          }
        )
        .subscribe()

    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching products:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch single product
  const fetchProduct = async (id: string): Promise<Product | null> => {
    loading.value = true
    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*, brands(name, slug)')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError
      if (!data) return null

      return {
        id: data.id,
        slug: data.slug,
        name: data.name,
        description: data.description,
        brand: data.brands?.name,
        brandSlug: data.brands?.slug,
        brandId: data.brand_id,
        category: data.category,
        price: data.price,
        originalPrice: data.original_price,
        size: data.size,
        concentration: data.concentration,
        classification: data.classification,
        imageUrl: data.image_url,
        images: data.images || [],
        isBestSeller: data.is_best_seller,
        isFeatured: data.is_featured,
        rating: data.rating,
        reviewCount: data.review_count,
        notes: data.notes || { top: [], heart: [], base: [] },
        inStock: data.in_stock,
        stockQuantity: data.stock_quantity,
        sku: data.sku,
        tenantId: data.tenant_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        meta: data.meta
      } as Product
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching product:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Search products
  const searchProducts = async (searchTerm: string): Promise<Product[]> => {
    loading.value = true
    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*, brands(name, slug)')
        .or(`name->>en.ilike.%${searchTerm}%,name->>ar.ilike.%${searchTerm}%,description->>en.ilike.%${searchTerm}%,description->>ar.ilike.%${searchTerm}%`)
        .limit(50)

      if (fetchError) throw fetchError

      return (data || []).map((item: any) => ({
        id: item.id,
        slug: item.slug,
        name: item.name,
        description: item.description,
        brand: item.brands?.name,
        brandSlug: item.brands?.slug,
        brandId: item.brand_id,
        category: item.category,
        price: item.price,
        originalPrice: item.original_price,
        size: item.size,
        concentration: item.concentration,
        classification: item.classification,
        imageUrl: item.image_url,
        images: item.images || [],
        isBestSeller: item.is_best_seller,
        isFeatured: item.is_featured,
        rating: item.rating,
        reviewCount: item.review_count,
        notes: item.notes || { top: [], heart: [], base: [] },
        inStock: item.in_stock,
        stockQuantity: item.stock_quantity,
        sku: item.sku,
        tenantId: item.tenant_id,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        meta: item.meta
      })) as Product[]
    } catch (err: any) {
      error.value = err.message
      console.error('Error searching products:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // Get best sellers
  const bestSellers = computed(() => 
    products.value.filter(p => p.isBestSeller).slice(0, 8)
  )

  // Get new arrivals
  const newArrivals = computed(() => 
    [...products.value]
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return dateB - dateA
      })
      .slice(0, 8)
  )

  // Get by category
  const getProductsByCategory = (categoryId: string) => 
    computed(() => products.value.filter(p => p.category === categoryId))

  // Cleanup on unmount
  onUnmounted(() => {
    if (subscription) {
      supabase.removeChannel(subscription)
    }
  })

  return {
    products,
    loading,
    error,
    bestSellers,
    newArrivals,
    fetchProducts,
    fetchProduct,
    searchProducts,
    getProductsByCategory
  }
}

// Auth composable for Supabase
export const useSupabaseAuth = () => {
  const user = ref<any>(null)
  const loading = ref(true)

  onMounted(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    user.value = authUser
    loading.value = false
  })

  return {
    user,
    loading
  }
}