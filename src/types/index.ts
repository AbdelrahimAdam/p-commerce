// ===============================
// Luxury Types
// ===============================

export type Language = 'en' | 'ar' | 'fa' | 'he'

export interface Translation {
  en: string
  ar: string
}

// ===============================
// Homepage
// ===============================

export interface HeroBanner {
  imageUrl: string
  title: string
  subtitle: string
  linkText?: string
  linkUrl?: string
}

export interface Offer {
  id?: string
  slug: string
  title: string
  subtitle: string
  description: string
  imageUrl: string
  oldPrice: number
  newPrice: number
  offerType: string
  terms?: string
  startDate?: string
  endDate?: string
  active?: boolean
}

export interface MarqueeBrand {
  id: string
  name: string
  logo: string
}

export interface HomepageData {
  heroBanner: HeroBanner
  heroTitle?: string // kept for backward compatibility
  heroSubtitle?: string
  activeOffers: Offer[]
  featuredBrands: FeaturedBrand[]
  marqueeBrands: MarqueeBrand[]
  aboutWork: {
    title: string
    description: string
  }
  settings: {
    isDarkMode: boolean
    defaultLanguage: Language
  }
  productCount?: number
  lastUpdated?: string
  source?: 'firebase' | 'local' | 'api'
}

// ===============================
// Category
// ===============================

export interface Category {
  id: string
  en: string
  ar: string
  description: Translation
  image: string
  featured: boolean
}

// ===============================
// Product
// ===============================

export interface Product {
  id: string
  slug: string

  name: Translation

  // Brand
  brand: string
  brandSlug?: string
  brandId?: string
  brandName?: string

  description: Translation

  price: number
  originalPrice?: number

  size: string
  concentration: string

  // classification field (gender)
  classification?: string // 'M' | 'F' | 'U'

  notes: {
    top: string[]
    heart: string[]
    base: string[]
  }

  imageUrl: string
  image?: string
  images: string[]

  category: string

  isBestSeller: boolean
  isFeatured?: boolean
  isNew?: boolean
  isActive?: boolean

  inStock: boolean
  stockQuantity: number

  // Additional fields from Firestore (used in some places)
  ratings?: number
  ratingCount?: number
  stock?: number // alias for stockQuantity

  rating?: number
  reviewCount?: number

  sku?: string

  createdAt?: any
  updatedAt?: any

  meta?: {
    weight?: string
    dimensions?: string
    ingredients?: string[]
    howToUse?: Translation
  }
}

// ===============================
// Product Form
// ===============================

export interface ProductFormData {
  name: Translation
  brand: string
  description: Translation
  price: number
  originalPrice?: number
  size: string
  concentration: string
  classification?: string
  notes: {
    top: string[]
    heart: string[]
    base: string[]
  }
  imageUrl: string
  images: string[]
  category: string
  isBestSeller: boolean
  isFeatured?: boolean
  isNew?: boolean
  isActive?: boolean
  inStock: boolean
}

// ===============================
// Cart
// ===============================

export interface CartItem {
  id: string
  name: Translation
  imageUrl: string
  image?: string // alias for imageUrl (used in some components)
  price: number
  originalPrice?: number // for discount display
  size: string
  concentration?: string
  brand?: string
  quantity: number
  addedAt?: string
  productId?: string // used in order items
}

// ===============================
// Admin
// ===============================

export interface AdminUser {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  phoneNumber?: string
  role: 'admin' | 'super-admin'
  lastLogin?: Date
  isActive?: boolean
  createdAt?: Date
  updatedAt?: Date
  permissions?: string[]
}

// Customer user (for authenticated customers)
export interface CustomerUser {
  uid: string
  email: string
  displayName?: string
  photoURL?: string
  phoneNumber?: string
  addresses?: Address[]
  defaultAddressId?: string
  wishlist?: string[]
  newsletter?: boolean
  createdAt?: Date
  updatedAt?: Date
  lastLogin?: Date
}

// Address for customer
export interface Address {
  id: string
  label?: string // e.g., "Home", "Work"
  fullName: string
  addressLine1: string
  addressLine2?: string
  city: string
  state?: string
  postalCode?: string
  country: string
  phone: string
  isDefault?: boolean
}

// ===============================
// Filters
// ===============================

export interface FilterOptions {
  category?: string
  categories?: string[]

  brand?: string
  brands?: string[]
  brandSlug?: string

  size?: string
  concentration?: string

  price?: number
  minPrice?: number
  maxPrice?: number

  minRating?: number

  bestseller?: boolean
  isFeatured?: boolean
  newArrival?: boolean

  classification?: string

  sortBy?: string
  searchTerm?: string
}

// ===============================
// Orders
// ===============================

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type PaymentMethod = string // or union of supported methods

export interface StatusHistoryItem {
  status: OrderStatus
  date: Date
  note?: string
  updatedBy?: string
}

export interface OrderCustomer {
  name: string
  email: string
  phone: string
  userId?: string
  address?: string // full address string (legacy)
  // structured address fields (new)
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
}

export interface OrderItem {
  id: string
  productId: string
  name: string
  nameAr?: string
  price: number
  quantity: number
  size: string
  concentration?: string
  image: string
  brand?: string
  imageUrl?: string
  originalPrice?: number
}

export interface ShippingAddress {
  name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
}

export interface Order {
  id: string
  orderNumber: string

  customer: OrderCustomer
  items: OrderItem[]

  subtotal: number
  shippingCost: number
  tax?: number
  discount?: number
  total: number
  shipping?: number // alias for shippingCost (used in some places)

  status: OrderStatus
  paymentMethod: string
  paymentStatus: PaymentStatus

  shippingAddress: string // legacy
  trackingNumber?: string
  notes?: string
  adminNotes?: string

  userId?: string
  guestId?: string
  userEmail?: string // legacy

  statusHistory?: StatusHistoryItem[]

  createdAt: Date
  updatedAt: Date
  shippedAt?: Date
  deliveredAt?: Date
  cancelledAt?: Date
}

// Firestore order type (with Timestamps)
import type { Timestamp, FieldValue } from 'firebase/firestore'

export interface FirestoreOrder extends Omit<Order, 
  'createdAt' | 'updatedAt' | 'shippedAt' | 'deliveredAt' | 'cancelledAt' | 
  'statusHistory' | 'id' | 'userId' | 'guestId'
> {
  userId?: string | null
  guestId?: string | null
  createdAt: Timestamp | FieldValue
  updatedAt: Timestamp | FieldValue
  shippedAt?: Timestamp | FieldValue | null
  deliveredAt?: Timestamp | FieldValue | null
  cancelledAt?: Timestamp | FieldValue | null
  statusHistory?: Array<{
    status: OrderStatus
    timestamp: Timestamp
    note?: string
    updatedBy?: string
  }>
}

// ===============================
// Review
// ===============================

export interface Review {
  id: string
  productId: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: Date
  helpful?: number
}

// ===============================
// Wishlist
// ===============================

export interface WishlistItem {
  id: string
  productId: string
  userId: string
  addedAt: Date
  product?: Product // populated version
  brand?: string
  brandSlug?: string
  price?: number
  imageUrl?: string
  name?: Translation
}

// ===============================
// Newsletter
// ===============================

export interface NewsletterSubscriber {
  id: string
  email: string
  name?: string
  subscribedAt: Date
  preferences?: {
    newArrivals: boolean
    promotions: boolean
    tips: boolean
  }
}

// ===============================
// API
// ===============================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ===============================
// Forms
// ===============================

export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
  language: Language
}

export interface NewsletterFormData {
  email: string
  name?: string
  language: Language
  preferences?: {
    newArrivals: boolean
    promotions: boolean
    tips: boolean
  }
}

// ===============================
// Theme
// ===============================

export interface LuxuryTheme {
  colors: {
    darkBg: string
    darkBrown: string
    gold: string
    goldLight: string
    goldDark: string
    lightBg: string
    cardBg: string
    red: string
  }
  typography: {
    serif: string
    sans: string
    arabic: string
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  shadows: {
    soft: string
    medium: string
    gold: string
    luxury: string
  }
}

// ===============================
// Brand
// ===============================

export interface Brand {
  id: string
  name: string
  slug: string
  image: string
  signature?: string
  description?: string
  category?: string
  price?: number
  productCount?: number
  isActive: boolean
  productIds?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface BrandWithProducts extends Brand {
  products: Product[]
}

export interface FeaturedBrand {
  id: string
  name: string
  image: string
  signature: string
  price: number
  slug: string
  category?: string
}

// ===============================
// DTOs for Admin Services
// ===============================

export interface CreateAdminDto {
  email: string
  password: string
  displayName: string
  phoneNumber?: string
  role: 'admin' | 'super-admin'
  photoURL?: string
}

export interface UpdateAdminDto {
  displayName?: string
  phoneNumber?: string
  role?: 'admin' | 'super-admin'
  photoURL?: string
  isActive?: boolean
}

// ===============================
// Exports for convenience
// ===============================
export type { Timestamp, FieldValue }