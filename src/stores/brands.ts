// stores/brands.ts
import { defineStore } from 'pinia'
import { ref, computed, watchEffect } from 'vue'
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '@/firebase/config'
import type { Brand, BrandWithProducts } from '@/types'
import type { Product } from '@/types'
import { useProductsStore } from '@/stores/products'
import { useAuthStore } from './auth'

export const useBrandsStore = defineStore('brands', () => {
  const productsStore = useProductsStore()
  const authStore = useAuthStore()

  /* =========================
   * STATE
   * ========================= */
  const brands = ref<Brand[]>([])
  const currentBrand = ref<BrandWithProducts | null>(null)
  const isLoading = ref(false)
  const error = ref<string>('')
  const isInitialized = ref(false)

  /* =========================
   * GETTERS
   * ========================= */
  const activeBrands = computed(() =>
    brands.value.filter(b => b.isActive === true)
  )

  const brandCount = computed(() => brands.value.length)

  /* =========================
   * HELPERS
   * ========================= */
  const transformBrandData = (docData: any, docId: string): Brand => ({
    id: docId,
    name: docData?.name ?? '',
    slug: docData?.slug ?? '',
    image: docData?.image ?? '',
    signature: docData?.signature ?? '',
    description: docData?.description ?? '',
    category: docData?.category ?? '',
    isActive: docData?.isActive !== false,
    price: Number(docData?.price ?? 0),
    productIds: Array.isArray(docData?.productIds) ? docData.productIds : [],
    tenantId: docData?.tenantId,
    createdAt: docData?.createdAt?.toDate?.() ?? new Date(),
    updatedAt: docData?.updatedAt?.toDate?.() ?? new Date()
  })

  // Upload brand image to Firebase Storage
  const uploadBrandImage = async (file: File, brandId: string): Promise<string> => {
    const path = `brands/${brandId}/logo.jpg`
    const imageRef = storageRef(storage, path)
    await uploadBytes(imageRef, file)
    return await getDownloadURL(imageRef)
  }

  // Delete brand image from Storage if it belongs to our storage path
  const deleteBrandImageFromStorage = async (imageUrl: string) => {
    if (!imageUrl || !imageUrl.includes('firebasestorage.googleapis.com')) return
    try {
      const decodedUrl = decodeURIComponent(imageUrl)
      const match = decodedUrl.match(/\/o\/(.+?)\?/)
      if (match && match[1]) {
        const path = decodeURIComponent(match[1])
        const imageRef = storageRef(storage, path)
        await deleteObject(imageRef)
      }
    } catch (err) {
      console.warn('Failed to delete brand image from Storage:', err)
    }
  }

  /* =========================
   * LOAD BRANDS (FIXED TENANT SOURCE)
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

      const q = query(
        collection(db, 'brands'),
        where('tenantId', '==', tenantId),
        orderBy('name')
      )

      const snapshot = await getDocs(q)

      brands.value = snapshot.docs.map(d =>
        transformBrandData(d.data(), d.id)
      )

      isInitialized.value = true
    } catch (err: any) {
      brands.value = []
      error.value = err?.message || 'Failed to load brands'
    } finally {
      isLoading.value = false
    }
  }

  /* =========================
   * GET BRAND BY SLUG (FIXED TENANT)
   * ========================= */
  const getBrandBySlug = async (
    slug: string
  ): Promise<BrandWithProducts | null> => {
    isLoading.value = true
    error.value = ''
    currentBrand.value = null

    try {
      const tenantId = authStore.currentTenant
      if (!tenantId) return null

      const q = query(
        collection(db, 'brands'),
        where('slug', '==', slug),
        where('tenantId', '==', tenantId)
      )

      const snapshot = await getDocs(q)

      if (snapshot.empty) return null

      const brandDoc = snapshot.docs[0]
      const brand = transformBrandData(brandDoc.data(), brandDoc.id)

      // 🔥 IMPORTANT FIX: filter products by tenant
      const productsRef = collection(db, 'brands', brand.id, 'products')
      const ps = await getDocs(productsRef)

      const products: Product[] = ps.docs
        .map(d => ({ id: d.id, ...d.data() } as Product))
        .filter(p => p.tenantId === tenantId)

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
   * ADD BRAND + PRODUCTS (UPDATED: SUPPORTS FILE UPLOAD)
   * ========================= */
  const addBrandWithProducts = async (
    brandData: Partial<Brand>,
    productsData: Partial<Product>[]
  ): Promise<string | null> => {
    isLoading.value = true
    error.value = ''

    const batch = writeBatch(db)

    try {
      const tenantId = authStore.currentTenant
      if (!tenantId) throw new Error('No tenant ID')

      const brandRef = doc(collection(db, 'brands'))
      const brandId = brandRef.id

      // Prepare brand data: if brandData.image is a File, upload it first
      let imageUrl = ''
      if (brandData.image instanceof File) {
        imageUrl = await uploadBrandImage(brandData.image, brandId)
      } else if (typeof brandData.image === 'string') {
        imageUrl = brandData.image // could be base64 or existing URL
      }

      const brandPayload = {
        name: brandData.name,
        slug: brandData.slug,
        category: brandData.category,
        description: brandData.description || '',
        signature: brandData.signature || '',
        isActive: brandData.isActive !== false,
        image: imageUrl,
        tenantId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      batch.set(brandRef, brandPayload)

      const productIds: string[] = []

      for (const product of productsData) {
        const productRef = doc(collection(db, 'brands', brandId, 'products'))

        // If product has an image file, we would need to upload it, but the product form now handles that separately.
        // Here we assume product.image is already a URL (from product form upload or base64).
        const productPayload = {
          ...product,
          tenantId,
          brandId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }

        batch.set(productRef, productPayload)

        productIds.push(productRef.id)
      }

      batch.update(brandRef, { productIds })

      await batch.commit()

      await Promise.all([
        loadBrands(),
        productsStore.fetchProducts()
      ])

      return brandId
    } catch (err: any) {
      error.value = err?.message || 'Failed to add brand'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /* =========================
   * UPDATE BRAND (FIX RETURN)
   * ========================= */
  const updateBrand = async (
    brandId: string,
    updates: Partial<Brand>
  ): Promise<boolean> => {
    try {
      const refDoc = doc(db, 'brands', brandId)
      const updatePayload: any = { ...updates, updatedAt: serverTimestamp() }

      // If a new image file is provided, upload it and replace the URL
      if (updates.image instanceof File) {
        // Fetch current brand to get old image URL for deletion later
        const currentBrandDoc = await getDoc(refDoc)
        const oldImageUrl = currentBrandDoc.data()?.image

        // Upload new image
        const newImageUrl = await uploadBrandImage(updates.image, brandId)
        updatePayload.image = newImageUrl

        // Delete old image if it was stored in Storage
        if (oldImageUrl && typeof oldImageUrl === 'string') {
          await deleteBrandImageFromStorage(oldImageUrl)
        }
      } else if (typeof updates.image === 'string') {
        updatePayload.image = updates.image
      }

      await updateDoc(refDoc, updatePayload)

      await loadBrands()
      return true
    } catch (err: any) {
      error.value = err?.message || 'Failed to update'
      return false
    }
  }

  /* =========================
   * DELETE BRAND (FIX RETURN)
   * ========================= */
  const deleteBrand = async (brandId: string): Promise<boolean> => {
    try {
      const brandRef = doc(db, 'brands', brandId)
      const brandSnap = await getDoc(brandRef)
      const brandImage = brandSnap.exists() ? brandSnap.data().image : null

      const batch = writeBatch(db)
      batch.delete(brandRef)

      const productsRef = collection(db, 'brands', brandId, 'products')
      const productsSnap = await getDocs(productsRef)

      productsSnap.docs.forEach(d => batch.delete(d.ref))

      await batch.commit()

      // Delete brand image from Storage if it was stored there
      if (brandImage && typeof brandImage === 'string') {
        await deleteBrandImageFromStorage(brandImage)
      }

      await loadBrands()
      return true
    } catch (err: any) {
      error.value = err?.message || 'Failed to delete'
      return false
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