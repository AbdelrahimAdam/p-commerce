import { defineStore } from 'pinia' import { ref, computed } from 'vue' import { collection, doc, getDoc, getDocs, updateDoc, query, where, orderBy, writeBatch, serverTimestamp } from 'firebase/firestore' import { db } from '@/firebase/config' import type { Brand, BrandWithProducts } from '@/types' import type { Product } from '@/types' import { useProductsStore } from '@/stores/products' import { useAuthStore } from './auth'

export const useBrandsStore = defineStore('brands', () => { const productsStore = useProductsStore() const authStore = useAuthStore()

/* =========================

STATE (SAFE DEFAULTS)

========================= */ const brands = ref<Brand[]>([]) const currentBrand = ref<BrandWithProducts | null>(null) const isLoading = ref(false) const error = ref('')


/* =========================

GETTERS

========================= */ const activeBrands = computed(() => brands.value.filter(b => b.isActive === true) )


const brandCount = computed(() => brands.value.length)

/* =========================

HELPERS

========================= */ const transformBrandData = (docData: any, docId: string): Brand => { return { id: docId, name: docData?.name ?? '', slug: docData?.slug ?? '', image: docData?.image ?? '', signature: docData?.signature ?? '', description: docData?.description ?? '', category: docData?.category ?? '', isActive: docData?.isActive !== false, price: Number(docData?.price ?? 0), productIds: Array.isArray(docData?.productIds) ? docData.productIds : [], tenantId: docData?.tenantId, createdAt: docData?.createdAt?.toDate?.() ?? new Date(), updatedAt: docData?.updatedAt?.toDate?.() ?? new Date() } }


/* =========================

LOAD ALL BRANDS (tenant‑isolated)

========================= */ const loadBrands = async (): Promise => { isLoading.value = true error.value = ''


try {     const tenantId = authStore.currentTenant     if (!tenantId) {       console.warn('No tenant ID – skipping brand load')       brands.value = []       return     }      const brandsRef = collection(db, 'brands')     const q = query(       brandsRef,       where('tenantId', '==', tenantId),       orderBy('name')     )     const snapshot = await getDocs(q)      brands.value = snapshot.docs.map(d =>       transformBrandData(d.data(), d.id)     )      console.log(✅ Loaded ${brands.value.length} brands for tenant ${tenantId})   } catch (err: any) {     brands.value = []     error.value = err?.message || 'Failed to load brands'     console.error('❌ loadBrands error:', err)   } finally {     isLoading.value = false   }   
}

/* =========================

GET BRAND BY SLUG (tenant‑isolated)

========================= */ const getBrandBySlug = async ( slug: string ): Promise<BrandWithProducts | null> => { isLoading.value = true error.value = '' currentBrand.value = null


try {     const tenantId = authStore.currentTenant     if (!tenantId) {       console.warn('No tenant ID – cannot get brand by slug')       return null     }      const brandsRef = collection(db, 'brands')     const q = query(       brandsRef,       where('slug', '==', slug),       where('tenantId', '==', tenantId)     )     const snapshot = await getDocs(q)      if (snapshot.empty) return null      const brandDoc = snapshot.docs[0]     const brand = transformBrandData(brandDoc.data(), brandDoc.id)      // Fetch products from brand subcollection     const productsRef = collection(db, 'brands', brand.id, 'products')     const ps = await getDocs(productsRef)      const products: Product[] = ps.docs.map(d => {       const data = d.data()       // Safely transform name – handle both string and object       let name = { en: '', ar: '' };       if (data.name) {         if (typeof data.name === 'object') {           name = { en: data.name.en || '', ar: data.name.ar || '' };         } else {           // If it's a string, use it for both languages (or fallback)           name = { en: String(data.name), ar: String(data.name) };         }       }       // Safely transform description       let description = { en: '', ar: '' };       if (data.description) {         if (typeof data.description === 'object') {           description = { en: data.description.en || '', ar: data.description.ar || '' };         } else {           description = { en: String(data.description), ar: String(data.description) };         }       }       // Safely transform notes       let notes = { top: [], heart: [], base: [] };       if (data.notes && typeof data.notes === 'object') {         notes = {           top: Array.isArray(data.notes.top) ? data.notes.top : [],           heart: Array.isArray(data.notes.heart) ? data.notes.heart : [],           base: Array.isArray(data.notes.base) ? data.notes.base : []         };       }       return {         id: d.id,         slug: data.slug || '',         name: name,         description: description,         brand: data.brand || '',         brandSlug: data.brandSlug || '',         brandId: data.brandId || '',         price: Number(data.price || 0),         originalPrice: Number(data.originalPrice) || undefined,         size: data.size || '100ml',         concentration: data.concentration || 'Eau de Parfum',         classification: data.classification || '',         notes: notes,         imageUrl: data.imageUrl || '',         images: Array.isArray(data.images) ? data.images : [],         category: data.category || '',         isBestSeller: data.isBestSeller || false,         isFeatured: data.isFeatured || false,         isNew: data.isNew || false,         isActive: data.isActive !== false,         inStock: data.inStock !== false,         stockQuantity: Number(data.stockQuantity || data.stock || 0),         rating: Number(data.rating) || undefined,         reviewCount: Number(data.reviewCount) || undefined,         sku: data.sku || '',         tenantId: data.tenantId,         createdAt: data.createdAt?.toDate?.() || new Date(),         updatedAt: data.updatedAt?.toDate?.() || new Date(),         meta: data.meta || {}       } as Product     })      currentBrand.value = {       ...brand,       products     }      return currentBrand.value   } catch (err: any) {     error.value = err?.message || 'Failed to load brand'     console.error('❌ getBrandBySlug error:', err)     return null   } finally {     isLoading.value = false   }   
}

/* =========================

ADD BRAND + PRODUCTS (with tenantId)

========================= */ const addBrandWithProducts = async ( brandData: Partial, productsData: Partial[] ): Promise<string | null> => { isLoading.value = true error.value = ''


const batch = writeBatch(db)    try {     console.log('Starting addBrandWithProducts:', { brandData, productsData })      // Ensure tenantId is present     const tenantId = authStore.currentTenant     if (!tenantId) {       throw new Error('No tenant ID – cannot add brand')     }     console.log('✅ Tenant ID resolved:', tenantId);      // Validate required fields     if (!brandData.name || !brandData.slug) {       throw new Error('Brand name and slug are required')     }      if (!brandData.category) {       throw new Error('Brand category is required')     }      // Check slug uniqueness within tenant     const brandsRef = collection(db, 'brands')     const slugCheck = await getDocs(       query(         brandsRef,         where('slug', '==', brandData.slug),         where('tenantId', '==', tenantId)       )     )     if (!slugCheck.empty) {       throw new Error(Brand slug "${brandData.slug}" already exists in this tenant)     }      // Brand document     const brandDocRef = doc(collection(db, 'brands'))     const brandId = brandDocRef.id      const brandPayload = {       name: brandData.name.trim(),       slug: brandData.slug.toLowerCase().trim(),       image: brandData.image?.trim() || '',       signature: brandData.signature?.trim() || '',       description: brandData.description?.trim() || '',       category: brandData.category.trim(),       isActive: brandData.isActive !== false,       price: Number(brandData.price) || 0,       productIds: [], // Will be updated after products are added       tenantId: tenantId,       createdAt: serverTimestamp(),       updatedAt: serverTimestamp()     }      batch.set(brandDocRef, brandPayload)      const productIds: string[] = []     const productSlugs = new Set<string>()      if (!productsData || productsData.length === 0) {       throw new Error('At least one product is required')     }      for (let i = 0; i < productsData.length; i++) {       const product = productsData[i]        if (!product.name?.en) {         throw new Error(Product ${i + 1} must have an English name)       }        let productSlug = product.slug       if (!productSlug) {         productSlug = product.name.en.toLowerCase()           .replace(/[^\w\s-]/g, '')           .replace(/\s+/g, '-')           .replace(/--+/g, '-')           .trim()       }        let counter = 1       const originalSlug = productSlug       while (productSlugs.has(productSlug)) {         productSlug = ${originalSlug}-${counter}         counter++       }       productSlugs.add(productSlug)        const productDocRef = doc(collection(db, 'brands', brandId, 'products'))        const productPayload: any = {         name: {            en: product.name.en?.trim() || '',            ar: product.name.ar?.trim() || product.name.en?.trim() || ''          },         description: {            en: product.description?.en?.trim() || '',            ar: product.description?.ar?.trim() || ''          },         price: Number(product.price) || 0,         size: product.size || '100ml',         concentration: product.concentration || 'Eau de Parfum',         imageUrl: product.imageUrl || '',         images: product.imageUrl ? [product.imageUrl] : [],         inStock: product.inStock !== false,         isBestSeller: product.isBestSeller || false,         isFeatured: product.isFeatured || false,         slug: productSlug,         brand: brandData.slug?.toLowerCase().trim() || '',         brandId: brandId,         category: product.category || brandData.category || '',         stockQuantity: Number(product.stockQuantity || 0),         sku: product.sku || '',         notes: product.notes || { top: [], heart: [], base: [] },         tenantId: tenantId,         createdAt: serverTimestamp(),         updatedAt: serverTimestamp()       }        if (product.rating !== undefined) productPayload.rating = Number(product.rating)       if (product.reviewCount !== undefined) productPayload.reviewCount = Number(product.reviewCount)       if (product.ratings !== undefined) productPayload.ratings = Number(product.ratings)       if (product.ratingCount !== undefined) productPayload.ratingCount = Number(product.ratingCount)        batch.set(productDocRef, productPayload)       productIds.push(productDocRef.id)     }      batch.update(brandDocRef, {        productIds,        updatedAt: serverTimestamp()      })      console.log('Committing batch with', productIds.length + 1, 'documents')      await batch.commit()      await Promise.all([loadBrands(), productsStore.fetchProducts()])      console.log(✅ Created brand ${brandId} with ${productIds.length} products)     return brandId   } catch (err: any) {     error.value = err?.message || 'Failed to add brand with products'     console.error('❌ addBrandWithProducts error:', err)     console.error('Failed data:', { brandData, productsData })     return null   } finally {     isLoading.value = false   }   
}

/* =========================

UPDATE / DELETE

========================= */ const updateBrand = async ( brandId: string, updates: Partial ): Promise => { isLoading.value = true error.value = ''


try {     const brandRef = doc(db, 'brands', brandId)     const updatePayload: any = { updatedAt: serverTimestamp() }      if (updates.name !== undefined) updatePayload.name = updates.name.trim()     if (updates.slug !== undefined) updatePayload.slug = updates.slug.toLowerCase().trim()     if (updates.image !== undefined) updatePayload.image = updates.image.trim()     if (updates.signature !== undefined) updatePayload.signature = updates.signature.trim()     if (updates.description !== undefined) updatePayload.description = updates.description.trim()     if (updates.category !== undefined) updatePayload.category = updates.category.trim()     if (updates.isActive !== undefined) updatePayload.isActive = updates.isActive     if (updates.price !== undefined) updatePayload.price = Number(updates.price)     if (updates.productIds !== undefined) updatePayload.productIds = updates.productIds      await updateDoc(brandRef, updatePayload)     await loadBrands()     return true   } catch (err: any) {     error.value = err?.message || 'Failed to update brand'     return false   } finally {     isLoading.value = false   }   
}

const deleteBrand = async (brandId: string): Promise => { isLoading.value = true error.value = ''
try {     const brandRef = doc(db, 'brands', brandId)     const brandSnap = await getDoc(brandRef)     if (!brandSnap.exists()) throw new Error('Brand not found')      // Delete brand + products batch     const batch = writeBatch(db)     batch.delete(brandRef)      const productsRef = collection(db, 'brands', brandId, 'products')     const productsSnap = await getDocs(productsRef)     productsSnap.docs.forEach(d => batch.delete(d.ref))      await batch.commit()     await Promise.all([loadBrands(), productsStore.fetchProducts()])     return true   } catch (err: any) {     error.value = err?.message || 'Failed to delete brand'     return false   } finally {     isLoading.value = false   }   
}

/* =========================

GET BRAND BY ID

========================= */ const getBrandById = async (brandId: string): Promise<Brand | null> => { try { const brandDoc = await getDoc(doc(db, 'brands', brandId)) if (brandDoc.exists()) return transformBrandData(brandDoc.data(), brandDoc.id) return null } catch (err: any) { return null } }


/* =========================


GET BRANDS BY CATEGORY (tenant‑isolated)


========================= */ const getBrandsByCategory = async (category: string): Promise<Brand[]> => { try { const tenantId = authStore.currentTenant if (!tenantId) { console.warn('No tenant ID – cannot get brands by category') return [] }

const brandsRef = collection(db, 'brands') const q = query( brandsRef, where('category', '==', category), where('isActive', '==', true), where('tenantId', '==', tenantId), orderBy('name') ) const snapshot = await getDocs(q) return snapshot.docs.map(d => transformBrandData(d.data(), d.id)) } catch (err: any) { return [] } }

/* =========================

INIT

========================= */ const initialize = async () => { if (brands.value.length === 0) await loadBrands() }


return { brands, currentBrand, isLoading, error,
activeBrands,   brandCount,    initialize,   loadBrands,   getBrandBySlug,   getBrandById,   getBrandsByCategory,   addBrandWithProducts,   updateBrand,   deleteBrand   
} })