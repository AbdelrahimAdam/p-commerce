import { supabase } from '@/supabase/client'
import { useAuthStore } from '@/stores/auth'

export interface HeroBanner {
  imageUrl: string
  title: string
  subtitle: string
}

export interface FeaturedBrand {
  id: string
  name: string
  image: string
  signature: string
  price: number
  slug: string
}

export interface ActiveOffer {
  id: string
  title: string
  imageUrl: string
  subtitle: string
  oldPrice: number
  newPrice: number
  slug: string
}

export interface MarqueeBrand {
  id: string
  name: string
  logo: string
  slug: string
}

export interface HomepageSettings {
  isDarkMode: boolean
  defaultLanguage: string
}

export interface HomepageData {
  heroBanner: HeroBanner
  featuredBrands: FeaturedBrand[]
  activeOffers: ActiveOffer[]
  marqueeBrands: MarqueeBrand[]
  settings: HomepageSettings
}

export const homepageService = {
  // Get homepage data from Supabase
  async getHomepageData(): Promise<HomepageData> {
    const authStore = useAuthStore()
    const tenantId = authStore.currentTenant

    if (!tenantId) {
      throw new Error('Tenant not resolved')
    }

    try {
      const { data, error } = await supabase
        .from('homepage')
        .select('sections')
        .eq('tenant_id', tenantId)
        .maybeSingle()

      if (error) throw error

      if (data?.sections) {
        return data.sections as HomepageData
      } else {
        // Create default homepage data
        const defaultData = await this.getDefaultData()
        await supabase
          .from('homepage')
          .upsert({
            tenant_id: tenantId,
            sections: defaultData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'tenant_id' })
        return defaultData
      }
    } catch (error) {
      console.error('Error getting homepage data:', error)
      throw error
    }
  },

  // Get default data (unchanged)
  async getDefaultData(): Promise<HomepageData> {
    return {
      heroBanner: {
        imageUrl: '/images/banner.jpg',
        title: 'Luxury Perfumes',
        subtitle: 'Premium Collection'
      },
      featuredBrands: [
        {
          id: '1',
          name: 'Tom Ford',
          image: '/images/GURLAND.png',
          signature: 'Noir Extreme',
          price: 450,
          slug: 'tom-ford'
        },
        {
          id: '2',
          name: 'YSL',
          image: '/images/santlaurent.jpg',
          signature: 'Black Opium',
          price: 380,
          slug: 'saint-laurent'
        },
        {
          id: '3',
          name: 'Versace',
          image: '/images/versacee.jpg',
          signature: 'Eros Flame',
          price: 520,
          slug: 'versace'
        },
        {
          id: '4',
          name: 'Chanel',
          image: '/images/chanceshaneal.jpeg',
          signature: 'Coco Mademoiselle',
          price: 600,
          slug: 'chanel'
        },
        {
          id: '5',
          name: 'Dior',
          image: '/images/DIOUR.jpg',
          signature: 'Sauvage Elixir',
          price: 550,
          slug: 'dior'
        },
        {
          id: '6',
          name: 'Gucci',
          image: '/images/GUCCI.jpg',
          signature: 'Bloom',
          price: 480,
          slug: 'gucci'
        }
      ],
      activeOffers: [
        {
          id: '1',
          title: 'Coco Chanel',
          imageUrl: '/images/chanceshaneal.jpeg',
          subtitle: 'Iconic Eau De Parfum',
          oldPrice: 1500,
          newPrice: 150,
          slug: 'coco-chanel-offer'
        }
      ],
      marqueeBrands: [
        {
          id: '1',
          name: 'Tom Ford',
          logo: '/images/tomford.png',
          slug: 'tom-ford'
        },
        {
          id: '2',
          name: 'YSL',
          logo: '/images/saintlaurent.jpg',
          slug: 'saint-laurent'
        },
        {
          id: '3',
          name: 'Versace',
          logo: '/images/versace.jpeg',
          slug: 'versace'
        },
        {
          id: '4',
          name: 'Chanel',
          logo: '/images/shaneal.jpg',
          slug: 'chanel'
        },
        {
          id: '5',
          name: 'Dior',
          logo: '/images/dior.jpg',
          slug: 'dior'
        },
        {
          id: '6',
          name: 'Gucci',
          logo: '/images/goochi.jpg',
          slug: 'gucci'
        }
      ],
      settings: {
        isDarkMode: false,
        defaultLanguage: 'ar'
      }
    }
  },

  // Update hero banner – now merges partial updates
  async updateHeroBanner(heroData: Partial<HeroBanner>): Promise<void> {
    const authStore = useAuthStore()
    const tenantId = authStore.currentTenant
    if (!tenantId) throw new Error('No tenant ID')

    // Get current sections
    const { data: current, error: fetchError } = await supabase
      .from('homepage')
      .select('sections')
      .eq('tenant_id', tenantId)
      .maybeSingle()
    if (fetchError) throw fetchError

    const currentSections = current?.sections || {}
    const currentHero = currentSections.heroBanner || {}
    const updatedHero = { ...currentHero, ...heroData }

    await this.updateSection('heroBanner', updatedHero)
  },

  // Update featured brands
  async updateFeaturedBrands(brands: FeaturedBrand[]): Promise<void> {
    await this.updateSection('featuredBrands', brands)
  },

  // Update active offers
  async updateActiveOffers(offers: ActiveOffer[]): Promise<void> {
    await this.updateSection('activeOffers', offers)
  },

  // Update marquee brands
  async updateMarqueeBrands(brands: MarqueeBrand[]): Promise<void> {
    await this.updateSection('marqueeBrands', brands)
  },

  // Update homepage settings – now merges partial updates
  async updateSettings(settings: Partial<HomepageSettings>): Promise<void> {
    const authStore = useAuthStore()
    const tenantId = authStore.currentTenant
    if (!tenantId) throw new Error('No tenant ID')

    // Get current sections
    const { data: current, error: fetchError } = await supabase
      .from('homepage')
      .select('sections')
      .eq('tenant_id', tenantId)
      .maybeSingle()
    if (fetchError) throw fetchError

    const currentSections = current?.sections || {}
    const currentSettings = currentSections.settings || {}
    const updatedSettings = { ...currentSettings, ...settings }

    await this.updateSection('settings', updatedSettings)
  },

  // Generic section updater (takes full object)
  async updateSection<K extends keyof HomepageData>(key: K, value: HomepageData[K]): Promise<void> {
    const authStore = useAuthStore()
    const tenantId = authStore.currentTenant
    if (!tenantId) throw new Error('No tenant ID')

    // Get current sections
    const { data: current, error: fetchError } = await supabase
      .from('homepage')
      .select('sections')
      .eq('tenant_id', tenantId)
      .maybeSingle()

    if (fetchError) throw fetchError

    const currentSections = current?.sections || {}
    const updatedSections = {
      ...currentSections,
      [key]: value
    }

    const { error: updateError } = await supabase
      .from('homepage')
      .upsert({
        tenant_id: tenantId,
        sections: updatedSections,
        updated_at: new Date().toISOString()
      }, { onConflict: 'tenant_id' })

    if (updateError) throw updateError
  },

  // Upload image to Supabase Storage
  async uploadImage(file: File, folder: string = 'homepage'): Promise<string> {
    try {
      const timestamp = Date.now()
      const fileName = `${folder}/${timestamp}_${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName)
      return urlData.publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  },

  // Reset to default data
  async resetToDefaults(): Promise<void> {
    const authStore = useAuthStore()
    const tenantId = authStore.currentTenant
    if (!tenantId) throw new Error('No tenant ID')

    const defaultData = await this.getDefaultData()

    const { error } = await supabase
      .from('homepage')
      .upsert({
        tenant_id: tenantId,
        sections: defaultData,
        updated_at: new Date().toISOString()
      }, { onConflict: 'tenant_id' })

    if (error) throw error
  }
}
