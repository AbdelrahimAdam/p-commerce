// src/stores/wishlist.ts
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { showNotification } from '@/utils/notifications'
import { showConfirmation } from '@/utils/confirmation'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { Product } from '@/types'
import { useAuthStore } from './auth'

export interface WishlistItem {
  id: string
  slug: string
  name: {
    en: string
    ar: string
  }
  brand: string
  brandSlug?: string
  size: string
  concentration: string
  price: number
  originalPrice?: number
  imageUrl: string
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock'
  notes?: {
    top: string[]
    heart: string[]
    base: string[]
  }
  tenantId?: string
  dateAdded: string
}

export const useWishlistStore = defineStore('wishlist', () => {
  const authStore = useAuthStore()

  // State - Use localStorage for guest users
  const items = useLocalStorage<WishlistItem[]>('luxury_wishlist', [])
  const isLoading = ref(false)
  const selectedItems = ref<string[]>([])
  const privacySetting = ref<'private' | 'shared' | 'public'>('private')
  const shareableId = useLocalStorage('wishlist_shareable_id', '')
  const guestWishlist = ref<WishlistItem[]>([]) // holds a copy of the guest wishlist before login

  // Getters
  const totalItems = computed(() => items.value.length)
  const totalValue = computed(() => items.value.reduce((sum, item) => sum + item.price, 0))
  const inStockCount = computed(() => items.value.filter(item => item.stockStatus === 'in_stock').length)
  const lowStockCount = computed(() => items.value.filter(item => item.stockStatus === 'low_stock').length)
  const hasItem = (productId: string) => items.value.some(item => item.id === productId)

  const determineStockStatus = (product: Product): 'in_stock' | 'low_stock' | 'out_of_stock' => {
    if (!product.inStock) return 'out_of_stock'
    if (product.stockQuantity && product.stockQuantity < 10) return 'low_stock'
    return 'in_stock'
  }

  const saveToFirestore = async () => {
    if (!authStore.isAuthenticated) return
    try {
      const wishlistRef = doc(db, 'wishlists', authStore.currentUser!.uid)
      await setDoc(wishlistRef, {
        items: items.value,
        privacy: privacySetting.value,
        shareableId: shareableId.value || null,
        tenantId: authStore.currentTenant,
        updatedAt: serverTimestamp()
      }, { merge: true })
    } catch (error) {
      console.error('Error saving wishlist to Firestore:', error)
      showNotification({
        title: 'Error',
        message: 'Failed to sync wishlist',
        type: 'error'
      })
    }
  }

  const loadFromFirestore = async () => {
    if (!authStore.isAuthenticated) return
    try {
      const wishlistRef = doc(db, 'wishlists', authStore.currentUser!.uid)
      const snap = await getDoc(wishlistRef)
      if (snap.exists()) {
        const data = snap.data()
        const firestoreItems = data.items || []

        // Merge: Firestore items take precedence, but keep local items not in Firestore
        const localMap = new Map(items.value.map(i => [i.id, i]))
        const merged: WishlistItem[] = []

        firestoreItems.forEach((fsItem: WishlistItem) => {
          merged.push(fsItem)
          localMap.delete(fsItem.id)
        })
        merged.push(...localMap.values())

        items.value = merged
        privacySetting.value = data.privacy || 'private'
        shareableId.value = data.shareableId || ''

        await saveToFirestore() // persist merged list
      } else {
        await saveToFirestore()
      }
    } catch (error) {
      console.error('Error loading wishlist from Firestore:', error)
      showNotification({
        title: 'Error',
        message: 'Failed to load wishlist',
        type: 'error'
      })
    }
  }

  // Actions
  const addToWishlist = async (product: Product) => {
    if (hasItem(product.id)) {
      showNotification({
        title: 'Already in Wishlist',
        message: 'This item is already in your wishlist',
        type: 'info'
      })
      return false
    }

    const newItem: WishlistItem = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      brandSlug: product.brandSlug,
      size: product.size,
      concentration: product.concentration,
      price: product.price,
      originalPrice: product.originalPrice,
      imageUrl: product.imageUrl,
      notes: product.notes,
      tenantId: authStore.currentTenant ?? undefined,
      stockStatus: determineStockStatus(product),
      dateAdded: new Date().toISOString()
    }

    items.value.push(newItem)
    if (authStore.isAuthenticated) await saveToFirestore()

    showNotification({
      title: 'Added to Wishlist',
      message: `${product.name.en} added to your wishlist`,
      type: 'success'
    })
    return true
  }

  const removeFromWishlist = async (productId: string) => {
    const index = items.value.findIndex(item => item.id === productId)
    if (index !== -1) {
      const item = items.value[index]
      items.value.splice(index, 1)

      const selectedIndex = selectedItems.value.indexOf(productId)
      if (selectedIndex > -1) selectedItems.value.splice(selectedIndex, 1)

      if (authStore.isAuthenticated) await saveToFirestore()

      showNotification({
        title: 'Removed from Wishlist',
        message: `${item.name.en} removed from your wishlist`,
        type: 'info'
      })
      return true
    }
    return false
  }

  const toggleWishlist = (product: Product) => {
    if (hasItem(product.id)) {
      return removeFromWishlist(product.id)
    } else {
      return addToWishlist(product)
    }
  }

  const clearWishlist = async () => {
    const confirmed = await showConfirmation({
      title: 'Clear Wishlist',
      message: 'Are you sure you want to clear your entire wishlist?',
      confirmText: 'Clear All',
      cancelText: 'Keep Items',
      type: 'warning'
    })

    if (confirmed) {
      items.value = []
      selectedItems.value = []
      if (authStore.isAuthenticated) await saveToFirestore()
      showNotification({
        title: 'Wishlist Cleared',
        message: 'Your wishlist has been cleared',
        type: 'success'
      })
      return true
    }
    return false
  }

  const removeSelected = async () => {
    items.value = items.value.filter(item => !selectedItems.value.includes(item.id))
    selectedItems.value = []
    if (authStore.isAuthenticated) await saveToFirestore()
    showNotification({
      title: 'Items Removed',
      message: 'Selected items removed from wishlist',
      type: 'success'
    })
  }

  const generateShareableLink = () => {
    const userId = authStore.currentUser?.uid
    if (userId) {
      const id = Math.random().toString(36).substring(2, 15)
      shareableId.value = id
      if (authStore.isAuthenticated) saveToFirestore()
      return `${window.location.origin}/wishlist/shared/${id}?user=${userId}`
    }

    const sessionId = localStorage.getItem('session_id') || Math.random().toString(36).substring(2, 15)
    localStorage.setItem('session_id', sessionId)
    return `${window.location.origin}/wishlist/shared/session/${sessionId}`
  }

  const updatePrivacySetting = async (setting: 'private' | 'shared' | 'public') => {
    privacySetting.value = setting
    if (setting !== 'private' && !shareableId.value) generateShareableLink()
    if (authStore.isAuthenticated) await saveToFirestore()

    showNotification({
      title: 'Privacy Updated',
      message: 'Your wishlist privacy settings have been updated',
      type: 'success'
    })
  }

  const loadWishlist = async () => {
    isLoading.value = true
    try {
      if (authStore.isAuthenticated) {
        guestWishlist.value = [...items.value]
        await loadFromFirestore()
      } else {
        if (guestWishlist.value.length > 0) {
          items.value = guestWishlist.value
          guestWishlist.value = []
        }
      }
    } catch (error) {
      console.error('Error loading wishlist:', error)
      showNotification({
        title: 'Error',
        message: 'Failed to load wishlist',
        type: 'error'
      })
    } finally {
      isLoading.value = false
    }
  }

  const updateStockStatus = (products: Product[]) => {
    items.value = items.value.map(item => {
      const product = products.find(p => p.id === item.id)
      if (product) {
        return { ...item, stockStatus: determineStockStatus(product) }
      }
      return item
    })
    if (authStore.isAuthenticated) saveToFirestore()
  }

  // Watch for auth changes to reload wishlist
  watch(() => authStore.isAuthenticated, async (isAuth) => {
    if (isAuth) {
      await loadWishlist()
    } else {
      if (guestWishlist.value.length > 0) {
        items.value = guestWishlist.value
        guestWishlist.value = []
      } else {
        items.value = []
      }
    }
  }, { immediate: true })

  return {
    items,
    isLoading,
    selectedItems,
    privacySetting,
    shareableId,

    totalItems,
    totalValue,
    inStockCount,
    lowStockCount,
    hasItem,

    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    removeSelected,
    generateShareableLink,
    updatePrivacySetting,
    loadWishlist,
    updateStockStatus
  }
})