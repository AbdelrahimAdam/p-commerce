// src/data/brands.ts
import type { Brand } from '@/types'

// The tenant ID for your Vercel deployment (change if different)
const VERCEL_TENANT_ID = 'vercel-root'

export const brands: Brand[] = [
  {
    id: 'dior',
    slug: 'dior',
    name: 'Dior',
    description: 'Christian Dior revolutionized fashion in 1947 with the "New Look" and brought that same innovative spirit to fragrance. Dior perfumes are renowned for their elegance, sophistication, and timeless appeal.',
    image: '/images/brands/dior.jpg',
    signature: 'Fresh Aromatic',
    category: 'luxury',
    isActive: true,
    productCount: 6,
    tenantId: VERCEL_TENANT_ID,
    createdAt: new Date('1946-01-01'),
    updatedAt: new Date()
  },
  {
    id: 'chanel',
    slug: 'chanel',
    name: 'Chanel',
    description: 'Chanel perfumes represent the essence of Parisian chic and timeless elegance. From the revolutionary Chanel No. 5 to modern classics, each fragrance tells a story of sophistication.',
    image: '/images/brands/chanel.jpg',
    signature: 'Aldehydic Floral',
    category: 'luxury',
    isActive: true,
    productCount: 3,
    tenantId: VERCEL_TENANT_ID,
    createdAt: new Date('1910-01-01'),
    updatedAt: new Date()
  },
  {
    id: 'tom-ford',
    slug: 'tom-ford',
    name: 'Tom Ford',
    description: 'Tom Ford fragrances embody modern luxury with bold, sensual compositions that challenge conventions. Each scent is crafted with rare ingredients and uncompromising quality.',
    image: '/images/brands/tomford.png',
    signature: 'Oriental Woody',
    category: 'luxury',
    isActive: true,
    productCount: 4,
    tenantId: VERCEL_TENANT_ID,
    createdAt: new Date('2005-01-01'),
    updatedAt: new Date()
  },
  {
    id: 'gucci',
    slug: 'gucci',
    name: 'Gucci',
    description: 'Gucci fragrances capture the brand\'s bold, romantic spirit. From floral bouquets to woody compositions, each scent reflects Gucci\'s creative vision.',
    image: '/images/brands/goochi.jpg',
    signature: 'Floral Musky',
    category: 'luxury',
    isActive: true,
    productCount: 3,
    tenantId: VERCEL_TENANT_ID,
    createdAt: new Date('1921-01-01'),
    updatedAt: new Date()
  },
  {
    id: 'versace',
    slug: 'versace',
    name: 'Versace',
    description: 'Versace fragrances embody Mediterranean glamour with bold, vibrant compositions. Each scent reflects the brand\'s passion for luxury and excess.',
    image: '/images/brands/versace.jpeg',
    signature: 'Fresh Aquatic',
    category: 'luxury',
    isActive: true,
    productCount: 2,
    tenantId: VERCEL_TENANT_ID,
    createdAt: new Date('1978-01-01'),
    updatedAt: new Date()
  },
  {
    id: 'yves-saint-laurent',
    slug: 'yves-saint-laurent',
    name: 'Yves Saint Laurent',
    description: 'Yves Saint Laurent perfumes embody Parisian chic with provocative, addictive scents that challenge conventions. Each fragrance celebrates modern femininity.',
    image: '/images/brands/saintlaurent.jpg',
    signature: 'Floral Oriental',
    category: 'luxury',
    isActive: true,
    productCount: 2,
    tenantId: VERCEL_TENANT_ID,
    createdAt: new Date('1961-01-01'),
    updatedAt: new Date()
  }
]

// Helper functions
export const getBrandBySlug = (slug: string): Brand | undefined => {
  return brands.find(brand => brand.slug === slug)
}

export const getAllBrands = (): Brand[] => {
  return brands
}