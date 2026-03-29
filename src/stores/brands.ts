// src/stores/brands.ts
import { defineStore } from 'pinia'
import { ref, computed, watchEffect } from 'vue'
import { supabaseSafe, getTable } from '@/supabase/client'
import type { Brand, BrandWithProducts, Product } from '@/types'
import { useProductsStore } from '@/stores/products'
import { useAuthStore } from './auth'

export const useBrandsStore = defineStore('brands', () => {
  const productsStore = useProductsStore()
  const authStore = useAuthStore()

  const brands = ref<Brand[]>([])
  const currentBrand = ref<BrandWithProducts | null>(null)
  const isLoading = ref(false)
  const error = ref<string>('')
  const isInitialized = ref(false)

  const activeBrands = computed(() =>
    brands.value.filter(b => b.isActive === true)
  )
  const brandCount = computed(() => brands.value.length)

  const transformBrandData = (row: any): Brand => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    image: row.logo || row.image,
    signature: row.signature || '',
    description: row.description || '',
    category: row.category || '',
    isActive: row.is_active !== false,
    productIds: row.product_ids || [],
    tenantId: row.tenant_id,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  })

  const getClient = () => supabaseSafe.client

  const isFile = (value: unknown): value is File => value instanceof File

  const uploadBrandImage = async (file: File, brandId: string): Promise<string> => {
    const client = getClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${brandId}-${Date.now()}.${fileExt}`
    const filePath = `brands/${fileName}`
    
    const { error: uploadError } = await client.storage
      .from('images')
      .upload(filePath, file, { upsert: true })
    if (uploadError) throw uploadError
    
    const { data: urlData } = client.storage.from('images').getPublicUrl(filePath)
    return urlData.publicUrl
  }

  const deleteBrandImageFromStorage = async (imageUrl: string) => {
    if (!imageUrl) return
    try {
      const client = getClient()
      const url = new URL(imageUrl)
      const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/images\/(.+)$/)
      if (pathMatch && pathMatch[1]) {
        const path = decodeURIComponent(pathMatch[1])
        await client.storage.from('images').remove([path])
      }
    } catch (err) {
      console.warn('Failed to delete brand image from Storage:', err)
    }
  }

  const loadBrands = async (): Promise<void> => {
    isLoading.value = true
    error.value = ''

    try {
      const tenantId = authStore.currentTenant
      if (!tenantId) {
        brands.value = []
        return
      }

      const client = getClient()
      const { data, error: fetchError } = await client
        .from('brands')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('name', { ascending: true })

      if (fetchError) throw fetchError

      brands.value = ((data as any[]) || []).map(row => transformBrandData(row))
      isInitialized.value = true
    } catch (err: any) {
      brands.value = []
      error.value = err?.message || 'Failed to load brands'
    } finally {
      isLoading.value = false
    }
  }

  const getBrandBySlug = async (slug: string): Promise<BrandWithProducts | null> => {
    isLoading.value = true
    error.value = ''
    currentBrand.value = null

    try {
      const tenantId = authStore.currentTenant
      if (!tenantId) return null

      const client = getClient()
      const { data: brandRow, error: brandError } = await client
        .from('brands')
        .select('*')
        .eq('slug', slug)
        .eq('tenant_id', tenantId)
        .single()

      if (brandError || !brandRow) return null

      const brand = transformBrandData(brandRow)

      const { data: productsData, error: productsError } = await client
        .from('products')
        .select('*')
        .eq('brand_id', brand.id)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })

      if (productsError) throw productsError

      const products: Product[] = await Promise.all(((productsData as any[]) || []).map(async (row: any) => {
        let imageUrl = row.image_url || ''
        let images: string[] = []
        
        if (row.images && Array.isArray(row.images)) {
          images = await Promise.all(row.images.map(async (path: string) => {
            const { data: urlData } = client.storage.from('images').getPublicUrl(path)
            return urlData.publicUrl
          }))
          if (!imageUrl && images.length > 0) {
            imageUrl = images[0]
          }
        }

        let categoryName = row.category
        if (!categoryName && row.category_id) {
          const { data: catRow } = await client
            .from('categories')
            .select('name')
            .eq('id', row.category_id)
            .single()
          if (catRow) categoryName = (catRow as any).name
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
          createdAt: row.created_at ? { seconds: Math.floor(new Date(row.created_at).getTime() / 1000), nanoseconds: 0 } : null,
          updatedAt: row.updated_at ? { seconds: Math.floor(new Date(row.updated_at).getTime() / 1000), nanoseconds: 0 } : null,
          meta: row.meta || { weight: '250g', dimensions: '8x4x12 cm', origin: brand.name }
        } as Product
      }))

      currentBrand.value = { ...brand, products }
      return currentBrand.value
    } catch (err: any) {
      error.value = err?.message || 'Failed to load brand'
      return null
    } finally {
      isLoading.value = false
    }
  }

  const addBrandWithProducts = async (
    brandData: Partial<Brand> & { image?: string | File },
    productsData: any[]
  ): Promise<string | null> => {
    isLoading.value = true
    error.value = ''

    try {
      const tenantId = authStore.currentTenant
      if (!tenantId) throw new Error('No tenant ID')

      let imageUrl = ''
      if (typeof brandData.image === 'string') {
        imageUrl = brandData.image
      }

      const client = getClient()
      
      const formattedProducts = productsData.map(p => ({
        name: p.name || { en: 'Product', ar: 'منتج' },
        description: p.description || { en: '', ar: '' },
        notes: p.notes || { top: [], heart: [], base: [] },
        price: p.price || 0,
        size: p.size || '100ml',
        concentration: p.concentration || 'Eau de Parfum',
        classification: p.classification || 'U',
        slug: p.slug || '',
        category: p.category || brandData.category || 'luxury',
        is_best_seller: p.is_best_seller || false,
        is_featured: p.is_featured || false,
        stock_quantity: p.stock_quantity || 0,
        sku: p.sku || '',
        is_active: p.is_active !== false,
        image_url: p.image_url || ''
      }))

      const { data: brandId, error: rpcError } = await client.rpc('create_brand_with_products', {
        _tenant_id: tenantId,
        _name: brandData.name,
        _slug: brandData.slug,
        _category: brandData.category,
        _description: brandData.description || '',
        _signature: brandData.signature || '',
        _is_active: brandData.isActive !== false,
        _image: imageUrl,
        _products: formattedProducts
      })

      if (rpcError) {
        console.error('RPC Error:', rpcError)
        throw rpcError
      }
      if (!brandId) throw new Error('Failed to create brand')

      if (isFile(brandData.image)) {
        const uploadedUrl = await uploadBrandImage(brandData.image, brandId)
        const updatePayload = { image: uploadedUrl, updated_at: new Date().toISOString() }
        const { error: updateError } = await getTable('brands')
          .update(updatePayload)
          .eq('id', brandId)
        if (updateError) {
          console.warn('Brand created but image update failed:', updateError)
        }
      }

      await loadBrands()
      await productsStore.fetchProducts()

      return brandId
    } catch (err: any) {
      console.error('Error in addBrandWithProducts:', err)
      error.value = err?.message || 'Failed to add brand'
      return null
    } finally {
      isLoading.value = false
    }
  }

  const updateBrand = async (
    brandId: string,
    updates: Partial<Brand> & { image?: string | File }
  ): Promise<boolean> => {
    isLoading.value = true
    error.value = ''

    try {
      const client = getClient()
      const updatePayload: Record<string, any> = { updated_at: new Date().toISOString() }

      if (updates.image) {
        if (isFile(updates.image)) {
          const { data: oldBrand, error: fetchError } = await client
            .from('brands')
            .select('image')
            .eq('id', brandId)
            .single()
          if (!fetchError && oldBrand && (oldBrand as any).image) {
            await deleteBrandImageFromStorage((oldBrand as any).image)
          }
          const newImageUrl = await uploadBrandImage(updates.image, brandId)
          updatePayload.image = newImageUrl
        } else if (typeof updates.image === 'string') {
          updatePayload.image = updates.image
        }
      }

      if (updates.name !== undefined) updatePayload.name = updates.name
      if (updates.slug !== undefined) updatePayload.slug = updates.slug
      if (updates.category !== undefined) updatePayload.category = updates.category
      if (updates.description !== undefined) updatePayload.description = updates.description
      if (updates.signature !== undefined) updatePayload.signature = updates.signature
      if (updates.isActive !== undefined) updatePayload.is_active = updates.isActive

      const { error: updateError } = await getTable('brands')
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

  const deleteBrand = async (brandId: string): Promise<boolean> => {
    isLoading.value = true
    error.value = ''

    try {
      const client = getClient()
      const { data: brandRow, error: fetchError } = await client
        .from('brands')
        .select('image')
        .eq('id', brandId)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError

      const { error: deleteError } = await getTable('brands')
        .delete()
        .eq('id', brandId)

      if (deleteError) throw deleteError

      if (brandRow && (brandRow as any).image) {
        await deleteBrandImageFromStorage((brandRow as any).image)
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

  const initialize = async () => {
    if (!brands.value.length && authStore.currentTenant) {
      await loadBrands()
    }
  }

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