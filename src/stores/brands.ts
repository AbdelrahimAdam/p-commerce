import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { Brand, BrandWithProducts } from '@/types'
import type { Product } from '@/types'
import { useProductsStore } from '@/stores/products'
import { useAuthStore } from './auth'
import { useTenantStore } from '@/stores/tenant' // ✅ إضافة

export const useBrandsStore = defineStore('brands', () => {
  const productsStore = useProductsStore()
  const authStore = useAuthStore()
  const tenantStore = useTenantStore() // ✅ إضافة

  /* =========================
   * STATE (SAFE DEFAULTS)
   * ========================= */
  const brands = ref<Brand[]>([])
  const currentBrand = ref<BrandWithProducts | null>(null)
  const isLoading = ref(false)
  const error = ref<string>('')

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
  const transformBrandData = (docData: any, docId: string): Brand => {
    return {
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
    }
  }

  /* =========================
   * LOAD ALL BRANDS
   * ========================= */
  const loadBrands = async (): Promise<void> => {
    isLoading.value = true
    error.value = ''

    try {
      const tenantId = tenantStore.tenantId // ✅ تعديل
      if (!tenantId) {
        console.warn('No tenant ID – skipping brand load')
        brands.value = []
        return
      }

      const brandsRef = collection(db, 'brands')
      const q = query(
        brandsRef,
        where('tenantId', '==', tenantId),
        orderBy('name')
      )
      const snapshot = await getDocs(q)

      brands.value = snapshot.docs.map(d =>
        transformBrandData(d.data(), d.id)
      )

      console.log(`✅ Loaded ${brands.value.length} brands for tenant ${tenantId}`)
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
  const getBrandBySlug = async (
    slug: string
  ): Promise<BrandWithProducts | null> => {
    isLoading.value = true
    error.value = ''
    currentBrand.value = null

    try {
      const tenantId = tenantStore.tenantId // ✅ تعديل
      if (!tenantId) return null

      const brandsRef = collection(db, 'brands')
      const q = query(
        brandsRef,
        where('slug', '==', slug),
        where('tenantId', '==', tenantId)
      )
      const snapshot = await getDocs(q)

      if (snapshot.empty) return null

      const brandDoc = snapshot.docs[0]
      const brand = transformBrandData(brandDoc.data(), brandDoc.id)

      // ✅ FIX مهم جدًا
      const productsRef = collection(db, 'brands', brand.id, 'products')
      const ps = await getDocs(
        query(productsRef, where('tenantId', '==', tenantId))
      )

      const products: Product[] = ps.docs.map(d => {
        const data = d.data()

        let name = { en: '', ar: '' }
        if (data.name) {
          if (typeof data.name === 'object') {
            name = { en: data.name.en || '', ar: data.name.ar || '' }
          } else {
            name = { en: String(data.name), ar: String(data.name) }
          }
        }

        let description = { en: '', ar: '' }
        if (data.description) {
          if (typeof data.description === 'object') {
            description = { en: data.description.en || '', ar: data.description.ar || '' }
          } else {
            description = { en: String(data.description), ar: String(data.description) }
          }
        }

        let notes = { top: [], heart: [], base: [] }
        if (data.notes && typeof data.notes === 'object') {
          notes = {
            top: Array.isArray(data.notes.top) ? data.notes.top : [],
            heart: Array.isArray(data.notes.heart) ? data.notes.heart : [],
            base: Array.isArray(data.notes.base) ? data.notes.base : []
          }
        }

        return {
          id: d.id,
          slug: data.slug || '',
          name,
          description,
          brand: data.brand || '',
          brandSlug: data.brandSlug || '',
          brandId: data.brandId || '',
          price: Number(data.price || 0),
          size: data.size || '100ml',
          concentration: data.concentration || 'Eau de Parfum',
          notes,
          imageUrl: data.imageUrl || '',
          images: Array.isArray(data.images) ? data.images : [],
          category: data.category || '',
          isBestSeller: data.isBestSeller || false,
          isFeatured: data.isFeatured || false,
          isActive: data.isActive !== false,
          inStock: data.inStock !== false,
          stockQuantity: Number(data.stockQuantity || 0),
          tenantId: data.tenantId,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
          meta: data.meta || {}
        } as Product
      })

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
   * ADD BRAND + PRODUCTS
   * ========================= */
  const addBrandWithProducts = async (
    brandData: Partial<Brand>,
    productsData: Partial<Product>[]
  ): Promise<string | null> => {
    isLoading.value = true
    error.value = ''

    const batch = writeBatch(db)

    try {
      const tenantId = tenantStore.tenantId // ✅ تعديل
      if (!tenantId) throw new Error('No tenant ID')

      const brandsRef = collection(db, 'brands')
      const slugCheck = await getDocs(
        query(
          brandsRef,
          where('slug', '==', brandData.slug),
          where('tenantId', '==', tenantId)
        )
      )
      if (!slugCheck.empty) throw new Error('Slug exists')

      const brandDocRef = doc(collection(db, 'brands'))
      const brandId = brandDocRef.id

      batch.set(brandDocRef, {
        ...brandData,
        tenantId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      for (const product of productsData) {
        const productDocRef = doc(collection(db, 'brands', brandId, 'products'))
        batch.set(productDocRef, {
          ...product,
          tenantId,
          brandId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      }

      await batch.commit()

      await Promise.all([loadBrands(), productsStore.fetchProducts()])

      return brandId
    } catch (err: any) {
      error.value = err?.message || 'Failed'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /* =========================
   * INIT
   * ========================= */
  const initialize = async () => {
    if (brands.value.length === 0) await loadBrands()
  }

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
    addBrandWithProducts
  }
})