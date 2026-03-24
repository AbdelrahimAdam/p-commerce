// src/utils/luxuryConstants.ts

// App Configuration
export const APP_NAME = 'Perfume Stock'
export const APP_DESCRIPTION = 'Luxury Fragrances Collection'
export const APP_VERSION = '1.0.0'

// Luxury Colors
export const LUXURY_COLORS = {
  darkBg: '#0a0a0a',
  darkBrown: '#1a120b',
  gold: '#d4af37',
  goldLight: '#f4e7c1',
  goldDark: '#b8941f',
  lightBg: '#f9f7f3',
  cardBg: '#ffffff',
  red: '#c41e3a'
} as const

// Luxury Categories
export const LUXURY_CATEGORIES = [
  {
    id: 'arabic-oud',
    en: 'Arabic Oud',
    ar: 'عود عربي',
    description: {
      en: 'Exquisite Arabian oud fragrances with deep, woody notes',
      ar: 'عطور العود العربي الفاخرة مع نوتات خشبية عميقة'
    },
    image: '/images/categories/arabic-oud.jpg',
    featured: true
  },
  {
    id: 'floral',
    en: 'Floral Elegance',
    ar: 'أناقة زهرية',
    description: {
      en: 'Delicate floral compositions for timeless elegance',
      ar: 'تركيبات زهرية رقيقة للأناقة الخالدة'
    },
    image: '/images/categories/floral.jpg',
    featured: true
  },
  {
    id: 'woody',
    en: 'Woody Mystique',
    ar: 'غموض خشبي',
    description: {
      en: 'Rich woody scents with mysterious depth',
      ar: 'عطور خشبية غنية بعمق غامض'
    },
    image: '/images/categories/woody.jpg',
    featured: true
  },
  {
    id: 'fresh',
    en: 'Fresh & Citrus',
    ar: 'عطور منعشة وحمضيات',
    description: {
      en: 'Revitalizing citrus and fresh notes',
      ar: 'نوتات حمضيات ومنعشة منعشة'
    },
    image: '/images/categories/fresh.jpg',
    featured: true
  },
  {
    id: 'oriental',
    en: 'Oriental Spice',
    ar: 'توابل شرقية',
    description: {
      en: 'Warm oriental blends with exotic spices',
      ar: 'مزيج شرقي دافئ مع توابل غريبة'
    },
    image: '/images/categories/oriental.jpg',
    featured: true
  },
  {
    id: 'gourmand',
    en: 'Gourmand Delights',
    ar: 'ملذات جورموند',
    description: {
      en: 'Sweet, edible-inspired luxury fragrances',
      ar: 'عطور فاخرة مستوحاة من الأطعمة الحلوة'
    },
    image: '/images/categories/gourmand.jpg',
    featured: false
  }
] as const

// Luxury Brands
export const LUXURY_BRANDS = [
  {
    id: 'tom-ford',
    name: 'Tom Ford',
    description: {
      en: 'American luxury fashion house founded by designer Tom Ford',
      ar: 'دار أزياء فاخرة أمريكية أسسها المصمم توم فورد'
    },
    logo: '/images/brands/tom-ford.png',
    featured: true
  },
  {
    id: 'ysl',
    name: 'Yves Saint Laurent',
    description: {
      en: 'French luxury fashion house founded by Yves Saint Laurent',
      ar: 'دار أزياء فاخرة فرنسية أسسها إيف سان لوران'
    },
    logo: '/images/brands/ysl.png',
    featured: true
  },
  {
    id: 'versace',
    name: 'Versace',
    description: {
      en: 'Italian luxury fashion company founded by Gianni Versace',
      ar: 'شركة أزياء فاخرة إيطالية أسسها جياني فيرساتشي'
    },
    logo: '/images/brands/versace.png',
    featured: true
  },
  {
    id: 'chanel',
    name: 'Chanel',
    description: {
      en: 'French luxury fashion house founded by Coco Chanel',
      ar: 'دار أزياء فاخرة فرنسية أسسها كوكو شانيل'
    },
    logo: '/images/brands/chanel.png',
    featured: true
  },
  {
    id: 'dior',
    name: 'Christian Dior',
    description: {
      en: 'French luxury goods company controlled by Bernard Arnault',
      ar: 'شركة سلع فاخرة فرنسية يتحكم بها برنار أرنو'
    },
    logo: '/images/brands/dior.png',
    featured: false
  },
  {
    id: 'gucci',
    name: 'Gucci',
    description: {
      en: 'Italian luxury brand of fashion and leather goods',
      ar: 'علامة تجارية فاخرة إيطالية للأزياء والسلع الجلدية'
    },
    logo: '/images/brands/gucci.png',
    featured: false
  }
] as const

// Luxury Product Concentrations
export const LUXURY_CONCENTRATIONS = [
  { value: 'eau-de-parfum', label: { en: 'Eau de Parfum', ar: 'أو دو بارفيوم' } },
  { value: 'eau-de-toilette', label: { en: 'Eau de Toilette', ar: 'أو دو تواليت' } },
  { value: 'parfum', label: { en: 'Parfum', ar: 'بارفيوم' } },
  { value: 'eau-de-cologne', label: { en: 'Eau de Cologne', ar: 'أو دو كولونيا' } }
] as const

// Luxury Sizes
export const LUXURY_SIZES = [
  { value: '30ml', label: { en: '30ml', ar: '٣٠ مل' } },
  { value: '50ml', label: { en: '50ml', ar: '٥٠ مل' } },
  { value: '100ml', label: { en: '100ml', ar: '١٠٠ مل' } },
  { value: '200ml', label: { en: '200ml', ar: '٢٠٠ مل' } }
] as const

// Luxury Fragrance Notes
export const LUXURY_NOTES = {
  top: [
    { value: 'bergamot', label: { en: 'Bergamot', ar: 'برغموت' } },
    { value: 'citrus', label: { en: 'Citrus', ar: 'حمضيات' } },
    { value: 'green-apple', label: { en: 'Green Apple', ar: 'تفاح أخضر' } },
    { value: 'lime', label: { en: 'Lime', ar: 'ليمون' } },
    { value: 'mandarin', label: { en: 'Mandarin', ar: 'يوسفي' } },
    { value: 'orange', label: { en: 'Orange', ar: 'برتقال' } },
    { value: 'pear', label: { en: 'Pear', ar: 'كمثرى' } },
    { value: 'pineapple', label: { en: 'Pineapple', ar: 'أناناس' } }
  ],
  heart: [
    { value: 'jasmine', label: { en: 'Jasmine', ar: 'ياسمين' } },
    { value: 'rose', label: { en: 'Rose', ar: 'ورد' } },
    { value: 'lily', label: { en: 'Lily', ar: 'زنبق' } },
    { value: 'peony', label: { en: 'Peony', ar: 'بيوني' } },
    { value: 'ylang-ylang', label: { en: 'Ylang Ylang', ar: 'يلانغ يلانغ' } },
    { value: 'carnation', label: { en: 'Carnation', ar: 'قرنفل' } },
    { value: 'lilac', label: { en: 'Lilac', ar: 'أرجوان' } },
    { value: 'orchid', label: { en: 'Orchid', ar: 'أوركيد' } }
  ],
  base: [
    { value: 'oud', label: { en: 'Oud', ar: 'عود' } },
    { value: 'sandalwood', label: { en: 'Sandalwood', ar: 'خشب الصندل' } },
    { value: 'vanilla', label: { en: 'Vanilla', ar: 'فانيليا' } },
    { value: 'musk', label: { en: 'Musk', ar: 'مسك' } },
    { value: 'amber', label: { en: 'Amber', ar: 'عنبر' } },
    { value: 'patchouli', label: { en: 'Patchouli', ar: 'باتشولي' } },
    { value: 'tonka-bean', label: { en: 'Tonka Bean', ar: 'فول تونكا' } },
    { value: 'vetiver', label: { en: 'Vetiver', ar: 'فيتيفر' } }
  ]
} as const

// Luxury Product Sort Options
export const LUXURY_SORT_OPTIONS = [
  { value: 'newest', label: { en: 'Newest', ar: 'الأحدث' } },
  { value: 'price-low', label: { en: 'Price: Low to High', ar: 'السعر: منخفض إلى مرتفع' } },
  { value: 'price-high', label: { en: 'Price: High to Low', ar: 'السعر: مرتفع إلى منخفض' } },
  { value: 'rating', label: { en: 'Highest Rated', ar: 'الأعلى تقييماً' } },
  { value: 'popular', label: { en: 'Most Popular', ar: 'الأكثر شيوعاً' } },
  { value: 'name-asc', label: { en: 'Name: A to Z', ar: 'الاسم: أ إلى ي' } },
  { value: 'name-desc', label: { en: 'Name: Z to A', ar: 'الاسم: ي إلى أ' } }
] as const

// Luxury Price Ranges
export const LUXURY_PRICE_RANGES = [
  { min: 0, max: 100, label: { en: 'Under $100', ar: 'أقل من ١٠٠ دولار' } },
  { min: 100, max: 200, label: { en: '$100 - $200', ar: '١٠٠ - ٢٠٠ دولار' } },
  { min: 200, max: 300, label: { en: '$200 - $300', ar: '٢٠٠ - ٣٠٠ دولار' } },
  { min: 300, max: 500, label: { en: '$300 - $500', ar: '٣٠٠ - ٥٠٠ دولار' } },
  { min: 500, max: 1000, label: { en: '$500+', ar: '٥٠٠ دولار فأكثر' } }
] as const

// Luxury Delivery Options
export const LUXURY_DELIVERY_OPTIONS = [
  {
    id: 'standard',
    name: { en: 'Standard Delivery', ar: 'توصيل قياسي' },
    description: { en: '3-5 business days', ar: '٣-٥ أيام عمل' },
    price: 15,
    freeThreshold: 200
  },
  {
    id: 'express',
    name: { en: 'Express Delivery', ar: 'توصيل سريع' },
    description: { en: '1-2 business days', ar: '١-٢ أيام عمل' },
    price: 30,
    freeThreshold: 500
  },
  {
    id: 'overnight',
    name: { en: 'Overnight Delivery', ar: 'توصيل ليلي' },
    description: { en: 'Next business day', ar: 'اليوم التالي' },
    price: 50,
    freeThreshold: 1000
  }
] as const

// Luxury Payment Methods
export const LUXURY_PAYMENT_METHODS = [
  {
    id: 'credit-card',
    name: { en: 'Credit Card', ar: 'بطاقة ائتمان' },
    icon: '💳',
    description: { en: 'Pay with your credit card', ar: 'الدفع ببطاقة الائتمان' }
  },
  {
    id: 'paypal',
    name: { en: 'PayPal', ar: 'باي بال' },
    icon: '💰',
    description: { en: 'Pay with your PayPal account', ar: 'الدفع بحساب باي بال' }
  },
  {
    id: 'apple-pay',
    name: { en: 'Apple Pay', ar: 'آبل باي' },
    icon: '🍎',
    description: { en: 'Pay with Apple Pay', ar: 'الدفع بآبل باي' }
  },
  {
    id: 'google-pay',
    name: { en: 'Google Pay', ar: 'جوجل باي' },
    icon: '📱',
    description: { en: 'Pay with Google Pay', ar: 'الدفع بجوجل باي' }
  }
] as const

// Luxury Animations
export const LUXURY_ANIMATIONS = {
  duration: {
    fast: '0.2s',
    normal: '0.3s',
    slow: '0.5s',
    verySlow: '1s'
  },
  easing: {
    ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.58, 1)',
    easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',
    luxury: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
} as const

// Luxury Currencies
export const LUXURY_CURRENCIES = [
  { code: 'USD', symbol: '$', name: { en: 'US Dollar', ar: 'دولار أمريكي' } },
  { code: 'EUR', symbol: '€', name: { en: 'Euro', ar: 'يورو' } },
  { code: 'GBP', symbol: '£', name: { en: 'British Pound', ar: 'جنيه إسترليني' } },
  { code: 'AED', symbol: 'د.إ', name: { en: 'UAE Dirham', ar: 'درهم إماراتي' } },
  { code: 'SAR', symbol: 'ر.س', name: { en: 'Saudi Riyal', ar: 'ريال سعودي' } },
  { code: 'QAR', symbol: 'ر.ق', name: { en: 'Qatari Riyal', ar: 'ريال قطري' } },
  { code: 'KWD', symbol: 'د.ك', name: { en: 'Kuwaiti Dinar', ar: 'دينار كويتي' } }
] as const

// Luxury SEO Constants
export const SEO_CONSTANTS = {
  siteName: APP_NAME,
  siteDescription: APP_DESCRIPTION,
  siteUrl: 'https://perfumestock.com',
  siteImage: '/images/og-default.jpg',
  twitterHandle: '@perfumestock',
  keywords: [
    'luxury perfume',
    'premium fragrances',
    'designer perfume',
    'arabic oud',
    'french perfume',
    'tom ford',
    'chanel',
    'ysl',
    'versace',
    'niche fragrance'
  ]
} as const

// Luxury Navigation Links
export const LUXURY_NAV_LINKS = [
  { path: '/', label: { en: 'Home', ar: 'الرئيسية' }, icon: '🏠' },
  { path: '/shop', label: { en: 'Shop All', ar: 'تسوق الكل' }, icon: '🛍️' },
  { path: '/collections', label: { en: 'Collections', ar: 'المجموعات' }, icon: '🎁' },
  { path: '/brands', label: { en: 'Brands', ar: 'الماركات' }, icon: '🏷️' },
  { path: '/new-arrivals', label: { en: 'New Arrivals', ar: 'وصل حديثاً' }, icon: '✨' },
  { path: '/best-sellers', label: { en: 'Best Sellers', ar: 'الأكثر مبيعاً' }, icon: '🏆' }
] as const

// Luxury Social Media
export const LUXURY_SOCIAL_MEDIA = [
  { name: 'Instagram', icon: '📷', url: 'https://instagram.com/perfumestock', handle: '@perfumestock' },
  { name: 'Facebook', icon: '👥', url: 'https://facebook.com/perfumestock', handle: 'PerfumeStock' },
  { name: 'Twitter', icon: '🐦', url: 'https://twitter.com/perfumestock', handle: '@perfumestock' },
  { name: 'Pinterest', icon: '📌', url: 'https://pinterest.com/perfumestock', handle: 'PerfumeStock' }
] as const

// Luxury Store Information
export const LUXURY_STORE_INFO = {
  name: APP_NAME,
  email: 'info@perfumestock.com',
  phone: '+1 (800) PER-FUME',
  address: {
    en: '123 Luxury Avenue, Beverly Hills, CA 90210',
    ar: '١٢٣ جادة الرفاهية، بيفرلي هيلز، كاليفورنيا ٩٠٢١٠'
  },
  hours: {
    en: 'Mon-Fri: 10AM-8PM, Sat: 10AM-6PM, Sun: 12PM-5PM',
    ar: 'الإثنين-الجمعة: ١٠ صباحاً - ٨ مساءً، السبت: ١٠ صباحاً - ٦ مساءً، الأحد: ١٢ ظهراً - ٥ مساءً'
  }
} as const

// Luxury Policies
export const LUXURY_POLICIES = {
  shipping: {
    freeThreshold: 200,
    processingTime: '1-2 business days',
    countries: ['US', 'CA', 'UK', 'AE', 'SA', 'QA', 'KW', 'EG']
  },
  returns: {
    period: 30,
    condition: 'Unused, in original packaging',
    refundMethod: 'Original payment method'
  },
  privacy: {
    dataRetention: '2 years',
    cookieConsent: 'Required for optimal experience'
  }
} as const

// Export Types
export type LuxuryCategory = typeof LUXURY_CATEGORIES[number]
export type LuxuryBrand = typeof LUXURY_BRANDS[number]
export type Concentration = typeof LUXURY_CONCENTRATIONS[number]
export type Size = typeof LUXURY_SIZES[number]
export type Note = typeof LUXURY_NOTES.top[number] | typeof LUXURY_NOTES.heart[number] | typeof LUXURY_NOTES.base[number]
export type SortOption = typeof LUXURY_SORT_OPTIONS[number]
export type PriceRange = typeof LUXURY_PRICE_RANGES[number]
export type DeliveryOption = typeof LUXURY_DELIVERY_OPTIONS[number]
export type PaymentMethod = typeof LUXURY_PAYMENT_METHODS[number]
export type Currency = typeof LUXURY_CURRENCIES[number]
export type SocialMedia = typeof LUXURY_SOCIAL_MEDIA[number]

// Default exports for backward compatibility
export default {
  APP_NAME,
  APP_DESCRIPTION,
  APP_VERSION,
  LUXURY_COLORS,
  LUXURY_CATEGORIES,
  LUXURY_BRANDS,
  LUXURY_CONCENTRATIONS,
  LUXURY_SIZES,
  LUXURY_NOTES,
  LUXURY_SORT_OPTIONS,
  LUXURY_PRICE_RANGES,
  LUXURY_DELIVERY_OPTIONS,
  LUXURY_PAYMENT_METHODS,
  LUXURY_ANIMATIONS,
  LUXURY_CURRENCIES,
  SEO_CONSTANTS,
  LUXURY_NAV_LINKS,
  LUXURY_SOCIAL_MEDIA,
  LUXURY_STORE_INFO,
  LUXURY_POLICIES
}
