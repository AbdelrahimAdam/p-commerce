// ===============================
// Luxury Types - Complete Index
// ===============================

export type Language = 'en' | 'ar' | 'fa' | 'he'

export interface Translation {
  en: string
  ar: string
  fa?: string
  he?: string
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
  tenantId?: string
  lastUpdated?: string
  source?: 'supabase' | 'local' | 'api'
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
  slug?: string
  parentId?: string
  order?: number
  isActive?: boolean
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
  categoryId?: string

  isBestSeller: boolean
  isFeatured?: boolean
  isNew?: boolean
  isActive?: boolean

  inStock: boolean
  stockQuantity: number

  // Additional fields
  ratings?: number
  ratingCount?: number
  stock?: number // alias for stockQuantity

  rating?: number
  reviewCount?: number

  sku?: string

  tenantId: string

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

export interface ProductFormData extends Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'slug'> {
  imageFile?: File
  slug?: string
}

// ===============================
// Product Filters & Options
// ===============================

export type ProductSize = '30ml' | '50ml' | '100ml' | '200ml' | '500ml'
export type Concentration = 'EDT' | 'EDP' | 'Parfum' | 'Extrait'

export const CONCENTRATIONS: Record<Concentration, string> = {
  'EDT': 'Eau de Toilette',
  'EDP': 'Eau de Parfum',
  'Parfum': 'Parfum',
  'Extrait': 'Extrait de Parfum'
}

export const SIZES: ProductSize[] = ['30ml', '50ml', '100ml', '200ml', '500ml']

export const NOTES_CATEGORIES = {
  top: 'Top Notes',
  heart: 'Heart Notes',
  base: 'Base Notes'
}

export const NOTES_LIST = [
  'Bergamot', 'Lemon', 'Orange', 'Grapefruit', 'Lime',
  'Lavender', 'Rose', 'Jasmine', 'Lily', 'Violet',
  'Sandalwood', 'Cedar', 'Oud', 'Patchouli', 'Vetiver',
  'Vanilla', 'Amber', 'Musk', 'Tonka Bean', 'Leather'
]

export interface ProductVariant {
  size: ProductSize
  price: number
  sku: string
}

export interface ProductInventory {
  productId: string
  variants: ProductVariant[]
  stock: number
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
  sku?: string
}

export interface Cart {
  items: CartItem[]
  total: number
  subtotal: number
  tax: number
  shipping: number
  discount: number
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
  tenantId: string
  lastLogin?: Date
  isActive?: boolean
  createdAt?: Date
  updatedAt?: Date
  permissions?: string[]
}

export interface CreateAdminDto {
  email: string
  password: string
  displayName: string
  phoneNumber?: string
  role: 'admin' | 'super-admin'
  photoURL?: string
  tenantId: string
  isActive?: boolean
  permissions?: string[]
}

export interface UpdateAdminDto {
  displayName?: string
  phoneNumber?: string
  role?: 'admin' | 'super-admin'
  photoURL?: string
  isActive?: boolean
  permissions?: string[]
}

// Customer user (for authenticated customers)
export interface CustomerUser {
  uid: string
  email: string
  displayName?: string
  photoURL?: string
  phoneNumber?: string
  tenantId: string
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
// Tenant
// ===============================

export interface Tenant {
  id: string
  name: string
  domain: string | null
  logo: string | null
  primary_color: string | null
  secondary_color: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  settings?: {
    defaultLanguage?: Language
    currency?: string
    timezone?: string
  }
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
  sortBy?: 'newest' | 'price-low' | 'price-high' | 'popular' | 'rating'
  searchTerm?: string
  page?: number
  limit?: number
}

// ===============================
// Pagination
// ===============================

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// ===============================
// Orders
// ===============================

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type PaymentMethod = 'credit_card' | 'paypal' | 'cod' | 'bank_transfer'

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
  sku?: string
}

export interface ShippingAddress {
  name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  postalCode?: string
  state?: string
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
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  shippingAddress: string // legacy
  trackingNumber?: string
  notes?: string
  adminNotes?: string
  userId?: string
  guestId?: string
  userEmail?: string // legacy
  tenantId: string
  statusHistory?: StatusHistoryItem[]
  createdAt: Date
  updatedAt: Date
  shippedAt?: Date
  deliveredAt?: Date
  cancelledAt?: Date
}

// Supabase order type (using ISO strings)
export interface SupabaseOrder extends Omit<Order,
  'createdAt' | 'updatedAt' | 'shippedAt' | 'deliveredAt' | 'cancelledAt' | 'statusHistory'
> {
  createdAt: string
  updatedAt: string
  shippedAt?: string | null
  deliveredAt?: string | null
  cancelledAt?: string | null
  statusHistory?: Array<{
    status: OrderStatus
    timestamp: string
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
  verified?: boolean
  title?: string
}

// ===============================
// Wishlist
// ===============================

export interface Wishlist {
  id: string
  user_id: string
  items: WishlistItem[]
  privacy: 'public' | 'private' | 'shared'
  shareable_id: string | null
  tenant_id: string
  created_at: string
  updated_at: string
  name?: string
  description?: string
}

export interface WishlistItem {
  id: string
  product_id: string
  product?: Product
  added_at: string
  notes?: string
  variant?: {
    size?: string
    concentration?: string
  }
}

export interface WishlistShare {
  id: string
  wishlist_id: string
  shared_with_email: string
  permission: 'view' | 'edit'
  created_at: string
  accepted_at?: string
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
  language?: Language
  tenantId?: string
  isActive?: boolean
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
// Contact
// ===============================

export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
  language: Language
  phone?: string
  orderNumber?: string
}

// ===============================
// API
// ===============================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
  statusCode?: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// ===============================
// SEO
// ===============================

export interface SEOData {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  canonical?: string
  robots?: string
  author?: string
  publishedTime?: string
  modifiedTime?: string
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
    success: string
    warning: string
    info: string
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
    xxl: string
  }
  shadows: {
    soft: string
    medium: string
    gold: string
    luxury: string
    card: string
  }
  breakpoints: {
    sm: string
    md: string
    lg: string
    xl: string
    xxl: string
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
  tenantId: string
  createdAt: Date
  updatedAt: Date
  country?: string
  founded?: number
  website?: string
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
  productCount?: number
}

// ===============================
// Utils & Validation
// ===============================

export const validateProductData = (data: Partial<ProductFormData>): string[] => {
  const errors: string[] = []

  if (!data.name?.en?.trim()) errors.push('English name is required')
  if (!data.name?.ar?.trim()) errors.push('Arabic name is required')
  if (!data.brand?.trim()) errors.push('Brand is required')
  if (!data.category?.trim()) errors.push('Category is required')
  if (!data.price || data.price < 0) errors.push('Valid price is required')
  if (!data.size?.trim()) errors.push('Size is required')
  if (!data.concentration?.trim()) errors.push('Concentration is required')
  if (!data.description?.en?.trim()) errors.push('English description is required')
  if (!data.description?.ar?.trim()) errors.push('Arabic description is required')
  if (!data.imageUrl?.trim()) errors.push('Image URL is required')

  return errors
}

export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
}
