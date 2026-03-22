// stores/brands.ts – SUPABASE VERSION
import { defineStore } from 'pinia'
import { ref, computed, watchEffect } from 'vue'
import { supabase } from '@/supabase/client'
import type { Brand, BrandWithProducts, Product } from '@/types'
import { useProductsStore } from '@/stores/products'
import { useAuthStore } from './auth'

export const useBrandsStore = defineStore('brands', () => {
  const productsStore = useProductsStore()
  const authStore = useAuthStore()

  // State
  const brands = ref<Brand[]>([])
  const currentBrand = ref<BrandWithProducts | null>(null)
  const isLoading = ref(false)
  const error = ref<string>('')
  const isInitialized = ref(false)

  // Getters
  const activeBrands = computed(() =>
    brands.value.filter(b => b.isActive === true)
  )
  const brandCount = computed(() => brands.value.length)

  // Helper: transform Supabase brand row to Brand type
  const transformBrandData = (row: any): Brand => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    image: row.image,
    signature: row.signature || '',
    description: row.description || '',
    category: row.category || '',
    isActive: row.is_active !== false,
    productIds: row.product_ids || [],
    tenantId: row.tenant_id,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  })

  // Upload brand image to Supabase Storage
  const uploadBrandImage = async (file: File, brandId: string): Promise<string> => {
    const path = `brands/${brandId}/logo.jpg`
    const { data, error: uploadError } = await supabase.storage
      .from('images')
      .upload(path, file, { upsert: true })
    if (uploadError) throw uploadError

    // Get public URL
    const { data: urlData } = supabase.storage.from('images').getPublicUrl(path)
    return urlData.publicUrl
  }

  // Delete brand image from Storage
  const deleteBrandImageFromStorage = async (imageUrl: string) => {
    if (!imageUrl) return
    // Extract path from public URL
    try {
      const url = new URL(imageUrl)
      const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/images\/(.+)$/)
      if (pathMatch && pathMatch[1]) {
        const path = decodeURIComponent(pathMatch[1])
        await supabase.storage.from('images').remove([path])
      }
    } catch (err) {
      console.warn('Failed to delete brand image from Storage:', err)
    }
  }

  // Type guard to check if a value is a File
  const isFile = (value: unknown): value is File => {
    return value instanceof File
  }

  /* =========================
   * LOAD BRANDS
   * ========================= */
  const loadBrands = async (): Promise<void> => {
    isLoading.value = true
    error.value = ''

    try {
      const tenantId = authStore.currentTenant
      if (!tenantId) {
        brands.value = []
        return
      }

      const { data, error: fetchError } = await supabase
        .from('brands')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('name', { ascending: true })

      if (fetchError) throw fetchError

      brands.value = (data || []).map(row => transformBrandData(row))
      isInitialized.value = true
    } catch (err: any) {
      brands.value = []
      error.value = err?.message || 'Failed to load brands'
    } finally {
      isLoading.value = false
    }
  }

  /* =========================
   * GET BRAND BY SLUG
   * ========================= */
  const getBrandBySlug = async (slug: string): Promise<BrandWithProducts | null> => {
    isLoading.value = true
    error.value = ''
    currentBrand.value = null

    try {
      const tenantId = authStore.currentTenant
      if (!tenantId) return null

      // Fetch brand
      const { data: brandRow, error: brandError } = await supabase
        .from('brands')
        .select('*')
        .eq('slug', slug)
        .eq('tenant_id', tenantId)
        .single()

      if (brandError || !brandRow) return null

      const brand = transformBrandData(brandRow)

      // Fetch products for this brand (from products table)
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('brand_id', brand.id)
        .eq('tenant_id', tenantId)

      if (productsError) throw productsError

      // Transform each product to match the Product type used in the frontend.
      // We reuse the transformation from products store, but we'll do a minimal version here.
      const products: Product[] = await Promise.all((productsData || []).map(async (row: any) => {
        // Build image URLs from the images array
        let imageUrl = ''
        let images: string[] = []
        if (row.images && Array.isArray(row.images)) {
          images = await Promise.all(row.images.map(async (path: string) => {
            const { data: urlData } = supabase.storage.from('images').getPublicUrl(path)
            return urlData.publicUrl
          }))
          imageUrl = images[0] || ''
        }

        // Get category name (if needed)
        let categoryName = row.category
        if (!categoryName && row.category_id) {
          const { data: catRow } = await supabase
            .from('categories')
            .select('name')
            .eq('id', row.category_id)
            .single()
          if (catRow) categoryName = catRow.name
        }

        return {
          id: row.id,
          slug: row.slug,
          name: row.name,
          description: row.description,
          brand: brand.name,
          brandSlug: brand.slug,
          brandId: brand.id,
          category: categoryName || brand.category || 'luxury',
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
          createdAt: row.created_at ? { seconds: Math.floor(new Date(row.created_at).getTime() / 1000), 
nanoseconds: 0 } : null,
          updatedAt: row.updated_at ? { seconds: Math.floor(new Date(row.updated_at).getTime() / 1000), 
nanoseconds: 0 } : null,
          meta: row.meta || { weight: '250g', dimensions: '8x4x12 cm', origin: brand.name }
        } as Product
      }))

      currentBrand.value = {
        ...brand,
        products
      }

      return currentBrand.value
    } catch (err: any) {
      error.value = err?.message || 'Failed to load brand'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /* =========================
   * ADD BRAND + PRODUCTS (using a database function for atomicity)
   * ========================= */
  const addBrandWithProducts = async (
    brandData: Partial<Brand> & { image?: string | File },
    productsData: Partial<Product>[]
  ): Promise<string | null> => {
    isLoading.value = true
    error.value = ''

    try {
      const tenantId = authStore.currentTenant
      if (!tenantId) throw new Error('No tenant ID')

      // Prepare brand data
      let imageUrl = ''
      if (brandData.image) {
        if (isFile(brandData.image)) {
          // We'll upload after we have the brand ID, so we need to generate a temporary ID
          // or use a transaction with a placeholder. We'll call the RPC with a placeholder,
          // then upload and update. Simpler: create brand first, then upload, then update.
          // To keep atomicity, we can do all in a transaction using the RPC and then upload
          // afterwards (non‑critical). But the original used batch, which was atomic.
          // We'll follow a similar approach: first create brand (without image) via RPC,
          // then upload image and update brand with image URL. If upload fails, we could rollback,
          // but we'll keep it simple and accept the risk.
        }
      }

      // If image is a string (existing URL), use it directly
      if (typeof brandData.image === 'string') {
        imageUrl = brandData.image
      }

      // Call the RPC function that creates brand and products in a single transaction
      const { data: brandId, error: rpcError } = await supabase.rpc('create_brand_with_products', {
        _tenant_id: tenantId,
        _name: brandData.name,
        _slug: brandData.slug,
        _category: brandData.category,
        _description: brandData.description || '',
        _signature: brandData.signature || '',
        _is_active: brandData.isActive !== false,
        _image: imageUrl, // might be empty if we need to upload later
        _products: productsData.map(p => ({
          name: p.name,
          slug: p.slug,
          description: p.description,
          price: p.price,
          original_price: p.originalPrice,
          category: p.category,
          size: p.size,
          concentration: p.concentration,
          classification: p.classification,
          sku: p.sku,
          images: p.images || [],
          is_best_seller: p.isBestSeller || false,
          is_featured: p.isFeatured || false,
          rating: p.rating || 0,
          review_count: p.reviewCount || 0,
          notes: p.notes || { top: [], heart: [], base: [] },
          in_stock: p.inStock !== false,
          stock_quantity: p.stockQuantity || 0,
          meta: p.meta || {}
        }))
      })

      if (rpcError) throw rpcError
      if (!brandId) throw new Error('Failed to create brand')

      // If we had a File to upload, upload it now and update the brand image
      if (isFile(brandData.image)) {
        const uploadedUrl = await uploadBrandImage(brandData.image, brandId)
        const { error: updateError } = await supabase
          .from('brands')
          .update({ image: uploadedUrl, updated_at: new Date().toISOString() })
          .eq('id', brandId)
        if (updateError) {
          console.warn('Brand created but image update failed:', updateError)
          // Not critical, the brand exists without image.
        }
      }

      // Refresh brands list and products store
      await loadBrands()
      await productsStore.fetchProducts()

      return brandId
    } catch (err: any) {
      error.value = err?.message || 'Failed to add brand'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /* =========================
   * UPDATE BRAND
   * ========================= */
  const updateBrand = async (
    brandId: string,
    updates: Partial<Brand> & { image?: string | File }
  ): Promise<boolean> => {
    isLoading.value = true
    error.value = ''

    try {
      const updatePayload: any = { updated_at: new Date().toISOString() }

      // Handle image
      if (updates.image) {
        if (isFile(updates.image)) {
          // Fetch current brand to get old image URL for deletion
          const { data: oldBrand, error: fetchError } = await supabase
            .from('brands')
            .select('image')
            .eq('id', brandId)
            .single()
          if (!fetchError && oldBrand?.image) {
            await deleteBrandImageFromStorage(oldBrand.image)
          }

          // Upload new image
          const newImageUrl = await uploadBrandImage(updates.image, brandId)
          updatePayload.image = newImageUrl
        } else if (typeof updates.image === 'string') {
          updatePayload.image = updates.image
        }
      }

      // Map other fields (convert camelCase to snake_case)
      if (updates.name !== undefined) updatePayload.name = updates.name
      if (updates.slug !== undefined) updatePayload.slug = updates.slug
      if (updates.category !== undefined) updatePayload.category = updates.category
      if (updates.description !== undefined) updatePayload.description = updates.description
      if (updates.signature !== undefined) updatePayload.signature = updates.signature
      if (updates.isActive !== undefined) updatePayload.is_active = updates.isActive

      const { error: updateError } = await supabase
        .from('brands')
        .update(updatePayload)
        .eq('id', brandId)

      if (updateError) throw updateError

      await loadBrands()
      return true
    } catch (err: any) {
      error.value = err?.message || 'Failed to update'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /* =========================
   * DELETE BRAND
   * ========================= */
  const deleteBrand = async (brandId: string): Promise<boolean> => {
    isLoading.value = true
    error.value = ''

    try {
      // Get brand image to delete later
      const { data: brandRow, error: fetchError } = await supabase
        .from('brands')
        .select('image')
        .eq('id', brandId)
        .single()
      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError

      // Delete brand – products will be cascaded (foreign key ON DELETE CASCADE)
      const { error: deleteError } = await supabase
        .from('brands')
        .delete()
        .eq('id', brandId)

      if (deleteError) throw deleteError

      // Delete image from storage if it exists
      if (brandRow?.image) {
        await deleteBrandImageFromStorage(brandRow.image)
      }

      await loadBrands()
      return true
    } catch (err: any) {
      error.value = err?.message || 'Failed to delete'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /* =========================
   * INIT (manual, kept for compatibility)
   * ========================= */
  const initialize = async () => {
    if (!brands.value.length && authStore.currentTenant) {
      await loadBrands()
    }
  }

  /* =========================
   * REACTIVE TENANT HANDLER
   * ========================= */
  watchEffect(async () => {
    const tenantId = authStore.currentTenant
    if (tenantId) {
      await loadBrands()
    } else {
      brands.value = []
    }
  })

  return {
    brands,
    currentBrand,
    isLoading,
    error,
    activeBrands,
    brandCount,
    initialize,
    loadBrands,
    getBrandBySlug,
    addBrandWithProducts,
    updateBrand,
    deleteBrand
  }
})
