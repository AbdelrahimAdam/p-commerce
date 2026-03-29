// src/stores/wishlist.ts – SUPABASE VERSION with proper type handling
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { showNotification } from '@/utils/notifications'
import { showConfirmation } from '@/utils/confirmation'
import { supabaseSafe, getTable } from '@/supabase/client'
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

// Helper to get Supabase client (throws if null)
const getClient = () => supabaseSafe.client

export const useWishlistStore = defineStore('wishlist', () => {
  const authStore = useAuthStore()

  // State – use localStorage for guest users
  const items = useLocalStorage<WishlistItem[]>('luxury_wishlist', [])
  const isLoading = ref(false)
  const selectedItems = ref<string[]>([])
  const privacySetting = ref<'private' | 'shared' | 'public'>('private')
  const shareableId = useLocalStorage('wishlist_shareable_id', '')
  const guestWishlist = ref<WishlistItem[]>([])

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

  // Helper to save current wishlist to Supabase (using getTable to bypass type issues)
  const saveToSupabase = async () => {
    if (!authStore.isAuthenticated) return
    try {
      const userId = authStore.user?.uid || authStore.customer?.uid
      if (!userId) return

      const tenantId = authStore.currentTenant
      if (!tenantId) {
        console.warn('No tenant ID – cannot save wishlist')
        return
      }

      // Use getTable to bypass strict typing
      const { data: existing, error: fetchError } = await getTable('wishlists')
        .select('id')
        .eq('user_id', userId)
        .eq('tenant_id', tenantId)
        .maybeSingle()

      if (fetchError) throw fetchError

      if (existing) {
        // Update existing record
        const { error: updateError } = await getTable('wishlists')
          .update({
            items: items.value,
            privacy: privacySetting.value,
            shareable_id: shareableId.value || null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('tenant_id', tenantId)

        if (updateError) throw updateError
      } else {
        // Insert new record
        const { error: insertError } = await getTable('wishlists')
          .insert({
            user_id: userId,
            items: items.value,
            privacy: privacySetting.value,
            shareable_id: shareableId.value || null,
            tenant_id: tenantId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (insertError) throw insertError
      }
    } catch (error) {
      console.error('Error saving wishlist to Supabase:', error)
      showNotification({
        title: 'Error',
        message: 'Failed to sync wishlist',
        type: 'error'
      })
    }
  }

  // Helper to load wishlist from Supabase and merge with local
  const loadFromSupabase = async () => {
    if (!authStore.isAuthenticated) return
    try {
      const userId = authStore.user?.uid || authStore.customer?.uid
      if (!userId) return

      const tenantId = authStore.currentTenant
      if (!tenantId) {
        console.warn('No tenant ID – cannot load wishlist')
        return
      }

      // Use getTable to bypass strict typing
      const { data, error } = await getTable('wishlists')
        .select('*')
        .eq('user_id', userId)
        .eq('tenant_id', tenantId)
        .maybeSingle()

      if (error) throw error

      if (data) {
        const row = data as any
        const serverItems = row.items || []
        // Merge: server items take precedence, but keep local items not on server
        const localMap = new Map(items.value.map(i => [i.id, i]))
        const merged: WishlistItem[] = []

        serverItems.forEach((si: WishlistItem) => {
          merged.push(si)
          localMap.delete(si.id)
        })
        merged.push(...localMap.values())

        items.value = merged
        privacySetting.value = row.privacy || 'private'
        shareableId.value = row.shareable_id || ''

        await saveToSupabase()
      } else {
        await saveToSupabase()
      }
    } catch (error) {
      console.error('Error loading wishlist from Supabase:', error)
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
    if (authStore.isAuthenticated) await saveToSupabase()

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

      if (authStore.isAuthenticated) await saveToSupabase()

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
      if (authStore.isAuthenticated) await saveToSupabase()
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
    if (authStore.isAuthenticated) await saveToSupabase()
    showNotification({
      title: 'Items Removed',
      message: 'Selected items removed from wishlist',
      type: 'success'
    })
  }

  const generateShareableLink = () => {
    const userId = authStore.user?.uid || authStore.customer?.uid
    if (userId) {
      const id = Math.random().toString(36).substring(2, 15)
      shareableId.value = id
      if (authStore.isAuthenticated) saveToSupabase()
      return `${window.location.origin}/wishlist/shared/${id}?user=${userId}`
    }

    const sessionId = localStorage.getItem('session_id') || Math.random().toString(36).substring(2, 15)
    localStorage.setItem('session_id', sessionId)
    return `${window.location.origin}/wishlist/shared/session/${sessionId}`
  }

  const updatePrivacySetting = async (setting: 'private' | 'shared' | 'public') => {
    privacySetting.value = setting
    if (setting !== 'private' && !shareableId.value) generateShareableLink()
    if (authStore.isAuthenticated) await saveToSupabase()

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
        await loadFromSupabase()
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
    if (authStore.isAuthenticated) saveToSupabase()
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
