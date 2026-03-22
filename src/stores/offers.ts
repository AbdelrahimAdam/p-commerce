// stores/offers.ts – SUPABASE VERSION (corrected with start_date/end_date)
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useHomepageStore } from './homepage'
import { useAuthStore } from './auth'
import { supabase } from '@/supabase/client'

export interface Offer {
  id: string
  slug: string
  title: string
  subtitle: string
  description: string
  imageUrl: string
  oldPrice: number
  newPrice: number
  linkUrl?: string
  startDate?: string
  endDate?: string
  offerType: string
  terms?: string
  active: boolean
  tenantId: string
  createdAt: Date
  updatedAt: Date
}

export interface OfferInput {
  slug: string
  title: string
  subtitle: string
  description: string
  imageUrl: string
  oldPrice: number
  newPrice: number
  linkUrl?: string
  startDate?: string
  endDate?: string
  offerType?: string
  terms?: string
  active?: boolean
}

export const useOffersStore = defineStore('offers', () => {
  const homepageStore = useHomepageStore()
  const authStore = useAuthStore()

  // State
  const offers = ref<Offer[]>([])
  const currentOffer = ref<Offer | null>(null)
  const isLoading = ref(false)
  const error = ref<string>('')
  const dataSource = ref<'homepage' | 'supabase' | 'none'>('none')

  // Getters
  const activeOffers = computed(() =>
    offers.value.filter(o => o.active === true)
  )

  // Helper to transform Supabase row to Offer (snake_case → camelCase)
  const transformOffer = (row: any): Offer => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle || '',
    description: row.description || '',
    imageUrl: row.image_url || '',
    oldPrice: row.old_price || 0,
    newPrice: row.new_price || 0,
    linkUrl: row.link_url,
    startDate: row.start_date,
    endDate: row.end_date,
    offerType: row.offer_type || 'percentage',
    terms: row.terms,
    active: row.active !== false,
    tenantId: row.tenant_id,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  })

  // Helper to transform homepage offer (from homepage.sections) to Offer format
  const transformHomepageOffer = (offer: any, index: number): Offer => {
    const tenantId = authStore.currentTenant
    if (!tenantId) {
      throw new Error('Tenant not resolved – cannot load offers')
    }
    return {
      id: offer.id || `homepage-offer-${index}`,
      slug: offer.slug || '',
      title: offer.title || '',
      subtitle: offer.subtitle || '',
      description: offer.description || '',
      imageUrl: offer.imageUrl || '',
      oldPrice: offer.oldPrice || 0,
      newPrice: offer.newPrice || 0,
      linkUrl: offer.linkUrl,
      startDate: offer.startDate,
      endDate: offer.endDate,
      offerType: offer.offerType || 'percentage',
      terms: offer.terms,
      active: offer.active !== false,
      tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  // ========== Actions ==========

  // Load offers from homepage store first, then fallback to Supabase
  const loadOffers = async (onlyActive: boolean = false) => {
    isLoading.value = true
    error.value = ''

    try {
      console.log('📦 Loading offers...')

      // First, try to load from homepage store
      if (homepageStore.homepageData?.activeOffers?.length > 0) {
        console.log('📋 Loading offers from homepage store')
        const homepageOffers = homepageStore.homepageData.activeOffers
        offers.value = homepageOffers.map((offer, index) => 
          transformHomepageOffer(offer, index)
        )
        dataSource.value = 'homepage'
        console.log(`✅ Loaded ${offers.value.length} offers from homepage store`)
        return
      }

      // If no offers in homepage, ensure homepage data is loaded
      console.log('🔄 No offers in homepage store, loading homepage data...')
      await homepageStore.loadHomepageData()

      if (homepageStore.homepageData?.activeOffers?.length > 0) {
        const homepageOffers = homepageStore.homepageData.activeOffers
        offers.value = homepageOffers.map((offer, index) => 
          transformHomepageOffer(offer, index)
        )
        dataSource.value = 'homepage'
        console.log(`✅ Loaded ${offers.value.length} offers from homepage store after loading`)
        return
      }

      // Finally, fallback to Supabase offers table
      console.log('🔄 No offers in homepage, loading from Supabase offers table...')
      const tenantId = authStore.currentTenant
      if (!tenantId) {
        console.warn('No tenant ID – cannot fetch offers from offers table')
        offers.value = []
        return
      }

      let query = supabase
        .from('offers')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })

      if (onlyActive) {
        query = query.eq('active', true)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      offers.value = (data || []).map(transformOffer)
      dataSource.value = 'supabase'
      console.log(`✅ Loaded ${offers.value.length} offers from Supabase offers table`)

    } catch (err: any) {
      error.value = err.message || 'Failed to load offers'
      console.error('loadOffers error:', err)

      // If Supabase fails, try to get from homepage as fallback
      if (homepageStore.homepageData?.activeOffers?.length > 0) {
        console.log('⚠️ Supabase failed, using homepage offers as fallback')
        const homepageOffers = homepageStore.homepageData.activeOffers
        offers.value = homepageOffers.map((offer, index) => 
          transformHomepageOffer(offer, index)
        )
        dataSource.value = 'homepage'
      }
    } finally {
      isLoading.value = false
    }
  }

  // Get a single offer by slug
  const getOfferBySlug = async (slug: string): Promise<Offer | null> => {
    isLoading.value = true
    error.value = ''
    currentOffer.value = null

    try {
      console.log('🔍 Looking for offer by slug:', slug)

      // First, check in homepage store
      if (homepageStore.homepageData?.activeOffers?.length > 0) {
        const found = homepageStore.homepageData.activeOffers.find(o => o.slug === slug)
        if (found) {
          console.log('✅ Offer found in homepage store by slug')
          currentOffer.value = transformHomepageOffer(found, 0)
          return currentOffer.value
        }
      }

      // If not found, try Supabase offers table
      const tenantId = authStore.currentTenant
      if (!tenantId) {
        throw new Error('Tenant not resolved – cannot fetch offer')
      }

      const { data, error: fetchError } = await supabase
        .from('offers')
        .select('*')
        .eq('slug', slug)
        .eq('tenant_id', tenantId)
        .maybeSingle()

      if (fetchError) throw fetchError

      if (data) {
        currentOffer.value = transformOffer(data)
        console.log('✅ Offer found in Supabase by slug:', currentOffer.value.title)
        return currentOffer.value
      }

      console.log('❌ No offer found with slug:', slug)
      return null
    } catch (err: any) {
      error.value = err.message || 'Failed to load offer'
      console.error('getOfferBySlug error:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Get a single offer by ID
  const getOfferById = async (id: string): Promise<Offer | null> => {
    isLoading.value = true
    error.value = ''
    currentOffer.value = null

    try {
      console.log('🔍 Looking for offer by ID:', id)

      // First, check in homepage store
      if (homepageStore.homepageData?.activeOffers?.length > 0) {
        const found = homepageStore.homepageData.activeOffers.find(o => o.id === id)
        if (found) {
          console.log('✅ Offer found in homepage store by ID')
          currentOffer.value = transformHomepageOffer(found, 0)
          return currentOffer.value
        }
      }

      // If not found, try Supabase
      const { data, error: fetchError } = await supabase
        .from('offers')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (fetchError) throw fetchError

      if (!data) {
        console.log('❌ No offer found with ID:', id)
        return null
      }

      // Verify tenant matches
      if (data.tenant_id !== authStore.currentTenant) {
        console.log('❌ Offer belongs to another tenant')
        return null
      }

      currentOffer.value = transformOffer(data)
      console.log('✅ Offer found in Supabase by ID:', currentOffer.value.title)
      return currentOffer.value
    } catch (err: any) {
      error.value = err.message || 'Failed to load offer'
      console.error('getOfferById error:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Get a single offer by either slug or ID (auto-detects)
  const getOffer = async (identifier: string): Promise<Offer | null> => {
    isLoading.value = true
    error.value = ''
    currentOffer.value = null

    try {
      console.log('🔍 Looking for offer with identifier:', identifier)

      // First, check in homepage store
      if (homepageStore.homepageData?.activeOffers?.length > 0) {
        const found = homepageStore.homepageData.activeOffers.find(o => 
          o.slug === identifier || o.id === identifier
        )
        if (found) {
          console.log('✅ Offer found in homepage store')
          currentOffer.value = transformHomepageOffer(found, 0)
          return currentOffer.value
        }
      }

      // If not found, try Supabase by slug
      console.log('🔄 Not found in homepage, trying Supabase by slug...')
      const tenantId = authStore.currentTenant
      if (!tenantId) {
        throw new Error('Tenant not resolved – cannot fetch offer')
      }

      const { data: slugData, error: slugError } = await supabase
        .from('offers')
        .select('*')
        .eq('slug', identifier)
        .eq('tenant_id', tenantId)
        .maybeSingle()

      if (slugError) throw slugError

      if (slugData) {
        currentOffer.value = transformOffer(slugData)
        console.log('✅ Offer found in Supabase by slug:', currentOffer.value.title)
        return currentOffer.value
      }

      // If not found by slug, try as ID
      console.log('🔄 Not found by slug, trying Supabase by ID...')
      const { data: idData, error: idError } = await supabase
        .from('offers')
        .select('*')
        .eq('id', identifier)
        .maybeSingle()

      if (idError) throw idError

      if (idData) {
        if (idData.tenant_id !== tenantId) {
          console.log('❌ Offer belongs to another tenant')
          return null
        }
        currentOffer.value = transformOffer(idData)
        console.log('✅ Offer found in Supabase by ID:', currentOffer.value.title)
        return currentOffer.value
      }

      console.log('❌ No offer found with identifier:', identifier)
      return null
    } catch (err: any) {
      error.value = err.message || 'Failed to load offer'
      console.error('getOffer error:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Refresh offers from homepage store
  const refreshFromHomepage = () => {
    if (homepageStore.homepageData?.activeOffers?.length > 0) {
      console.log('🔄 Refreshing offers from homepage store')
      const homepageOffers = homepageStore.homepageData.activeOffers
      offers.value = homepageOffers.map((offer, index) => 
        transformHomepageOffer(offer, index)
      )
      dataSource.value = 'homepage'
      console.log(`✅ Refreshed ${offers.value.length} offers from homepage store`)
    }
  }

  // Admin: create a new offer
  const createOffer = async (input: OfferInput): Promise<string | null> => {
    isLoading.value = true
    error.value = ''

    try {
      const tenantId = authStore.currentTenant
      if (!tenantId) {
        throw new Error('Tenant not resolved – cannot create offer')
      }

      // Check slug uniqueness within tenant
      const { data: existing, error: checkError } = await supabase
        .from('offers')
        .select('id')
        .eq('slug', input.slug)
        .eq('tenant_id', tenantId)
        .maybeSingle()

      if (checkError) throw checkError
      if (existing) {
        throw new Error(`Offer slug "${input.slug}" already exists in this tenant`)
      }

      // Map camelCase input to snake_case for insert
      const insertPayload = {
        tenant_id: tenantId,
        slug: input.slug,
        title: input.title,
        subtitle: input.subtitle,
        description: input.description,
        image_url: input.imageUrl,
        old_price: input.oldPrice,
        new_price: input.newPrice,
        link_url: input.linkUrl,
        start_date: input.startDate,
        end_date: input.endDate,
        offer_type: input.offerType || 'percentage',
        terms: input.terms,
        active: input.active !== false
      }

      const { data, error: insertError } = await supabase
        .from('offers')
        .insert(insertPayload)
        .select()
        .single()

      if (insertError) throw insertError

      await loadOffers()
      return data.id
    } catch (err: any) {
      error.value = err.message || 'Failed to create offer'
      console.error('createOffer error:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Admin: update an existing offer
  const updateOffer = async (id: string, input: Partial<OfferInput>): Promise<boolean> => {
    isLoading.value = true
    error.value = ''

    try {
      const tenantId = authStore.currentTenant
      if (!tenantId) {
        throw new Error('Tenant not resolved – cannot update offer')
      }

      // If slug is being updated, check uniqueness within tenant
      if (input.slug) {
        const { data: existing, error: checkError } = await supabase
          .from('offers')
          .select('id')
          .eq('slug', input.slug)
          .eq('tenant_id', tenantId)
          .maybeSingle()

        if (checkError) throw checkError
        if (existing && existing.id !== id) {
          throw new Error(`Offer slug "${input.slug}" already exists in this tenant`)
        }
      }

      // Prepare update payload (map camelCase to snake_case)
      const updatePayload: any = {
        updated_at: new Date().toISOString()
      }
      if (input.slug !== undefined) updatePayload.slug = input.slug
      if (input.title !== undefined) updatePayload.title = input.title
      if (input.subtitle !== undefined) updatePayload.subtitle = input.subtitle
      if (input.description !== undefined) updatePayload.description = input.description
      if (input.imageUrl !== undefined) updatePayload.image_url = input.imageUrl
      if (input.oldPrice !== undefined) updatePayload.old_price = input.oldPrice
      if (input.newPrice !== undefined) updatePayload.new_price = input.newPrice
      if (input.linkUrl !== undefined) updatePayload.link_url = input.linkUrl
      if (input.startDate !== undefined) updatePayload.start_date = input.startDate
      if (input.endDate !== undefined) updatePayload.end_date = input.endDate
      if (input.offerType !== undefined) updatePayload.offer_type = input.offerType
      if (input.terms !== undefined) updatePayload.terms = input.terms
      if (input.active !== undefined) updatePayload.active = input.active

      const { error: updateError } = await supabase
        .from('offers')
        .update(updatePayload)
        .eq('id', id)

      if (updateError) throw updateError

      await loadOffers()
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to update offer'
      console.error('updateOffer error:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Admin: delete an offer
  const deleteOffer = async (id: string): Promise<boolean> => {
    isLoading.value = true
    error.value = ''

    try {
      const { error: deleteError } = await supabase
        .from('offers')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      await loadOffers()
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to delete offer'
      console.error('deleteOffer error:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Clear current offer
  const clearCurrentOffer = () => {
    currentOffer.value = null
  }

  return {
    offers,
    currentOffer,
    isLoading,
    error,
    dataSource,
    activeOffers,
    loadOffers,
    getOfferBySlug,
    getOfferById,
    getOffer,
    refreshFromHomepage,
    createOffer,
    updateOffer,
    deleteOffer,
    clearCurrentOffer
  }
})
