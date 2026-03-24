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

// Export types
export type LuxuryCategory = typeof LUXURY_CATEGORIES[number]
export type LuxuryBrand = typeof LUXURY_BRANDS[number]
export type Concentration = typeof LUXURY_CONCENTRATIONS[number]
export type Size = typeof LUXURY_SIZES[number]
export type Note = typeof LUXURY_NOTES.top[number] | typeof LUXURY_NOTES.heart[number] | typeof LUXURY_NOTES.base[number]
export type SortOption = typeof LUXURY_SORT_OPTIONS[number]
export type PriceRange = typeof LUXURY_PRICE_RANGES[number]
