// src/stores/language.ts
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Language } from '@/types'
import { useLocalStorage } from '@vueuse/core'

export const useLanguageStore = defineStore('language', () => {
  // Luxury Language State
  const currentLanguage = useLocalStorage<Language>('luxury_perfume_language', 'en')
  const isTransitioning = ref(false)

  // Available languages (only English and Arabic)
  const availableLanguages = computed(() => [
    {
      code: 'en',
      name: 'English',
      native: 'English',
      flag: '🇺🇸',
      direction: 'ltr'
    },
    {
      code: 'ar',
      name: 'Arabic',
      native: 'العربية',
      flag: '🇸🇦',
      direction: 'rtl'
    }
  ])

  // Luxury Getters
  const isRTL = computed(() => currentLanguage.value === 'ar')
  const direction = computed(() => isRTL.value ? 'rtl' : 'ltr')
  const fontFamily = computed(() => 
    isRTL.value 
      ? "'Noto Sans Arabic', 'Cairo', system-ui, sans-serif"
      : "'Inter', 'Cormorant Garamond', system-ui, sans-serif"
  )

  const currentLanguageObj = computed(() => {
    return availableLanguages.value.find(lang => lang.code === currentLanguage.value) || availableLanguages.value[0]
  })

  const luxuryTypography = computed(() => ({
    serif: "'Cormorant Garamond', serif",
    sans: "'Inter', sans-serif",
    arabic: "'Noto Sans Arabic', sans-serif"
  }))

  // Luxury Actions
  const setLanguage = async (langCode: Language) => {
    if (currentLanguage.value === langCode) return

    isTransitioning.value = true

    // Show transition effect
    showLanguageTransition()

    // Delay for smooth transition
    await new Promise(resolve => setTimeout(resolve, 300))

    currentLanguage.value = langCode

    // Update document
    updateDocumentAttributes()

    // Show notification using custom event (works with your existing notification system)
    const langObj = availableLanguages.value.find(l => l.code === langCode)
    window.dispatchEvent(new CustomEvent('luxury-notification', {
      detail: {
        type: 'success',
        title: t('languageChanged'),
        message: t('languageChangedTo', { language: langObj?.name || langCode }),
        duration: 3000
      }
    }))

    isTransitioning.value = false

    // Return the language object
    return langObj
  }

  const toggleLanguage = () => {
    const nextLang = currentLanguage.value === 'en' ? 'ar' : 'en'
    setLanguage(nextLang)
  }

  const initialize = () => {
    // Check saved language or default to English
    const savedLang = localStorage.getItem('luxury_perfume_language') as Language

    if (!savedLang) {
      // Try to detect browser language
      const browserLang = navigator.language.split('-')[0]
      // Only accept 'en' or 'ar' from browser, otherwise default to 'en'
      const detectedLang = browserLang === 'ar' ? 'ar' : 'en'
      setLanguage(detectedLang as Language)
    } else {
      // Ensure saved language is valid (en or ar)
      if (savedLang === 'en' || savedLang === 'ar') {
        currentLanguage.value = savedLang
        updateDocumentAttributes()
      } else {
        // Fallback to English if saved language is invalid
        currentLanguage.value = 'en'
        updateDocumentAttributes()
      }
    }
  }

  // Luxury Helper Functions
  const updateDocumentAttributes = () => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = currentLanguage.value
      document.documentElement.dir = direction.value
      document.body.style.fontFamily = fontFamily.value
      document.body.style.transition = 'font-family 0.3s ease'
    }
  }

  const showLanguageTransition = () => {
    // Add luxury transition effect
    if (typeof document !== 'undefined') {
      document.body.style.opacity = '0.5'
      document.body.style.transition = 'opacity 0.3s ease'

      setTimeout(() => {
        document.body.style.opacity = '1'
      }, 300)
    }
  }

  // Translation helper with interpolation support
  const t = (key: string, params?: Record<string, string>): string => {
    // Get translation from our computed translations
    const translationObj = translations.value[key as keyof typeof translations.value]

    if (!translationObj) {
      console.warn(`Translation key not found: ${key}`)
      return key
    }

    // Cast to a record with Language keys to allow indexing
    const dict = translationObj as Record<Language, string>
    let translation = dict[currentLanguage.value] || dict.en || key

    // Replace parameters if provided
    if (params) {
      Object.keys(params).forEach(param => {
        translation = translation.replace(`{${param}}`, params[param])
      })
    }

    return translation
  }

  const formatCurrency = (amount: number, currencyCode: string = 'USD'): string => {
    const locale = currentLanguage.value === 'ar' ? 'ar-SA' : 'en-US'

    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })

    return formatter.format(amount)
  }

  const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
    const locale = currentLanguage.value === 'ar' ? 'ar-SA' : 'en-US'
    const dateObj = typeof date === 'string' ? new Date(date) : date

    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    }

    const formatter = new Intl.DateTimeFormat(locale, defaultOptions)
    return formatter.format(dateObj)
  }

  // Watch for changes
  watch(currentLanguage, () => {
    updateDocumentAttributes()

    // Save preference
    localStorage.setItem('luxury_perfume_language', currentLanguage.value)

    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('language-changed', {
      detail: { language: currentLanguage.value }
    }))
  }, { immediate: true })

  // Translations for all keys (including landing page)
  const translations = computed(() => ({
    // Header translations
    home: { en: 'Home', ar: 'الرئيسية' },
    collections: { en: 'Collections', ar: 'المجموعات' },
    brands: { en: 'Brands', ar: 'العلامات التجارية' },
    categories: { en: 'Categories', ar: 'الفئات' },
    gifts: { en: 'Gifts', ar: 'الهدايا' },
    about: { en: 'About', ar: 'من نحن' },
    contact: { en: 'Contact', ar: 'اتصل بنا' },
    search: { en: 'Search', ar: 'بحث' },
    account: { en: 'Account', ar: 'الحساب' },
    wishlist: { en: 'Wishlist', ar: 'قائمة الرغبات' },
    cart: { en: 'Cart', ar: 'عربة التسوق' },
    login: { en: 'Login', ar: 'تسجيل الدخول' },
    profile: { en: 'Profile', ar: 'الملف الشخصي' },
    orders: { en: 'Orders', ar: 'الطلبات' },
    adminPanel: { en: 'Admin Panel', ar: 'لوحة التحكم' },
    logout: { en: 'Logout', ar: 'تسجيل الخروج' },
    menu: { en: 'Menu', ar: 'القائمة' },

    // Skip to content (accessibility)
    skipToContent: { en: 'Skip to main content', ar: 'انتقل إلى المحتوى الرئيسي' },

    // Language translations
    languageChanged: { en: 'Language Changed', ar: 'تم تغيير اللغة' },
    languageChangedTo: { en: 'Language changed to {language}', ar: 'تم تغيير اللغة إلى {language}' },
    languageChangeFailed: { en: 'Failed to change language', ar: 'فشل تغيير اللغة' },
    selectLanguage: { en: 'Select Language', ar: 'اختر اللغة' },
    autoDetectLanguage: { en: 'Auto-detect language', ar: 'كشف اللغة تلقائياً' },
    error: { en: 'Error', ar: 'خطأ' },

    // Currency translations
    selectCurrency: { en: 'Select Currency', ar: 'اختر العملة' },
    currencyChanged: { en: 'Currency Changed', ar: 'تم تغيير العملة' },
    currencyChangedTo: { en: 'Currency changed to {currency}', ar: 'تم تغيير العملة إلى {currency}' },

    // Cart translations
    yourCart: { en: 'Your Luxury Cart', ar: 'سلة التسوق الفاخرة' },
    cartEmpty: { en: 'Your cart is awaiting luxury', ar: 'سلة التسوق بانتظار الفخامة' },
    continueShopping: { en: 'Continue Exploring', ar: 'مواصلة الاستكشاف' },
    subtotal: { en: 'Subtotal', ar: 'المجموع الفرعي' },
    shipping: { en: 'Luxury Shipping', ar: 'الشحن الفاخر' },
    tax: { en: 'Tax', ar: 'الضريبة' },
    total: { en: 'Total', ar: 'الإجمالي' },
    free: { en: 'FREE', ar: 'مجاني' },
    freeShippingProgress: { en: 'Free shipping at $200', ar: 'شحن مجاني عند 200 دولار' },
    proceedToCheckout: { en: 'Proceed to Checkout', ar: 'تابع إلى الدفع' },
    shoppingCart: { en: 'Shopping Cart', ar: 'سلة التسوق' },
    viewCart: { en: 'View Luxury Cart', ar: 'عرض السلة الفاخرة' },
    each: { en: 'Each', ar: 'للقطعة' },
    decreaseQuantity: { en: 'Decrease quantity', ar: 'تقليل الكمية' },
    increaseQuantity: { en: 'Increase quantity', ar: 'زيادة الكمية' },
    removeItem: { en: 'Remove item', ar: 'إزالة المنتج' },
    removeItemConfirm: { en: 'Remove Item?', ar: 'إزالة المنتج؟' },
    removeItemMessage: { en: 'Are you sure you want to remove this luxury item?', ar: 'هل أنت متأكد من إزالة هذا المنتج الفاخر؟' },
    remove: { en: 'Remove', ar: 'إزالة' },
    keep: { en: 'Keep', ar: 'الإبقاء' },
    quantityDecreased: { en: 'Quantity decreased', ar: 'تم تقليل الكمية' },
    quantityIncreased: { en: 'Quantity increased', ar: 'تم زيادة الكمية' },
    itemRemoved: { en: 'Item removed', ar: 'تمت إزالة المنتج' },
    cartItemsCount: { en: '{count} items', ar: '{count} عناصر' },
    cartEmptyMessage: { en: 'Your cart is currently empty', ar: 'سلة التسوق فارغة حالياً' },

    // Products
    products: { en: 'Products', ar: 'المنتجات' },

    // Search translations
    searchPlaceholder: { en: 'Search for luxury fragrances...', ar: 'ابحث عن العطور الفاخرة...' },
    recentSearches: { en: 'Recent Searches', ar: 'عمليات البحث الحديثة' },
    clearAll: { en: 'Clear All', ar: 'مسح الكل' },
    popularSearches: { en: 'Popular Searches', ar: 'عمليات البحث الشائعة' },

    // Footer translations
    footerDescription: { en: 'Experience the essence of luxury with our curated collection of premium perfumes from around the world.', ar: 'اختبر جوهر الفخامة مع مجموعتنا المختارة من العطور الفاخرة من حول العالم.' },
    quickLinks: { en: 'Quick Links', ar: 'روابط سريعة' },
    customerService: { en: 'Customer Service', ar: 'خدمة العملاء' },
    company: { en: 'Company', ar: 'الشركة' },
    stayUpdated: { en: 'Stay Updated', ar: 'كن على اطلاع' },
    newsletterDescription: { en: 'Subscribe to receive exclusive offers and fragrance news', ar: 'اشترك لتلقي العروض الحصرية وأخبار العطور' },
    yourEmail: { en: 'Your email address', ar: 'عنوان بريدك الإلكتروني' },
    privacyDisclaimer: { en: 'By subscribing you agree to our Privacy Policy', ar: 'بالاشتراك، فإنك توافق على سياسة الخصوصية الخاصة بنا' },
    allRightsReserved: { en: 'All rights reserved.', ar: 'جميع الحقوق محفوظة.' },
    securePayment: { en: 'Secure Payment', ar: 'دفع آمن' },
    contactUs: { en: 'Contact Us', ar: 'اتصل بنا' },
    shippingInfo: { en: 'Shipping Information', ar: 'معلومات الشحن' },
    returnsExchanges: { en: 'Returns & Exchanges', ar: 'الإرجاع والاستبدال' },
    faq: { en: 'FAQ', ar: 'الأسئلة الشائعة' },
    sizeGuide: { en: 'Size Guide', ar: 'دليل المقاسات' },
    aboutUs: { en: 'About Us', ar: 'من نحن' },
    careers: { en: 'Careers', ar: 'الوظائف' },
    press: { en: 'Press', ar: 'الصحافة' },
    storeLocator: { en: 'Store Locator', ar: 'مواقع المتاجر' },
    blog: { en: 'Blog', ar: 'المدونة' },
    privacyPolicy: { en: 'Privacy Policy', ar: 'سياسة الخصوصية' },
    termsOfService: { en: 'Terms of Service', ar: 'شروط الخدمة' },
    cookiePolicy: { en: 'Cookie Policy', ar: 'سياسة ملفات تعريف الارتباط' },

    // 404 Page translations
    pageNotFound: { en: 'Page Not Found', ar: 'الصفحة غير موجودة' },
    pageNotFoundDescription: { en: 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.', ar: 'الصفحة التي تبحث عنها ربما تمت إزالتها أو تغيير اسمها أو أنها غير متوفرة مؤقتاً.' },
    backToHome: { en: 'Back to Home', ar: 'العودة إلى الرئيسية' },
    browseProducts: { en: 'Browse Products', ar: 'تصفح المنتجات' },

    // Homepage translations
    brandName: { en: 'Perfume Stock', ar: 'مخزون العطور' },
    luxuryCollection: { en: 'LUXURY COLLECTION', ar: 'المجموعة الفاخرة' },
    luxury: { en: 'LUXURY', ar: 'فاخر' },
    shopNow: { en: 'Shop Now', ar: 'تسوق الآن' },
    featuredBrands: { en: 'Featured Brands', ar: 'العلامات التجارية المميزة' },
    luxuryCollections: { en: 'Luxury Collections', ar: 'المجموعات الفاخرة' },
    viewAllBrands: { en: 'View All Brands', ar: 'عرض كل العلامات التجارية' },

    // Brand-specific translations
    brandTomFord: { en: 'TOM FORD', ar: 'توم فورد' },
    brandYsl: { en: 'YVES SAINT LAURENT', ar: 'ايف سان لوران' },
    brandVersace: { en: 'VERSACE', ar: 'فيرساتشي' },
    brandChanel: { en: 'CHANEL', ar: 'شانيل' },
    brandDior: { en: 'DIOR', ar: 'ديور' },
    brandGucci: { en: 'GUCCI', ar: 'غوتشي' },

    // Product signatures
    noirExtreme: { en: 'Noir Extreme', ar: 'نوار إكستريم' },
    blackOpium: { en: 'Black Opium', ar: 'بلاك أوبيوم' },
    erosFlame: { en: 'Eros Flame', ar: 'ايروس فليم' },
    cocoMademoiselle: { en: 'Coco Mademoiselle', ar: 'كوكو ماديموزيل' },
    sauvageElixir: { en: 'Sauvage Elixir', ar: 'سوفاج إكسير' },
    bloom: { en: 'Bloom', ar: 'بلوم' },

    // Offer section
    todaysExclusiveOffer: { en: "TODAY'S EXCLUSIVE OFFER", ar: 'العرض الحصري اليوم' },
    cocoChanel: { en: 'COCO CHANEL', ar: 'كوكو شانيل' },
    iconicEauDeParfum: { en: 'Iconic Eau de Parfum', ar: 'عطر أي دو بارفيوم الأيقوني' },
    buyNow: { en: 'Buy Now', ar: 'اشتري الآن' },

    // Pricing and currency
    price: { en: 'Price', ar: 'السعر' },
    oldPrice: { en: 'Old Price', ar: 'السعر القديم' },
    newPrice: { en: 'New Price', ar: 'السعر الجديد' },
    le: { en: 'LE', ar: 'ج.م' },

    // Navigation
    exploreCollections: { en: 'Explore Collections', ar: 'استكشف المجموعات' },
    discoverMore: { en: 'Discover More', ar: 'اكتشف المزيد' },
    learnMore: { en: 'Learn More', ar: 'اعرف المزيد' },

    // Status and availability
    inStock: { en: 'In Stock', ar: 'متوفر' },
    limitedStock: { en: 'Limited Stock', ar: 'كمية محدودة' },
    soldOut: { en: 'Sold Out', ar: 'نفذ من المخزون' },
    comingSoon: { en: 'Coming Soon', ar: 'قريباً' },

    // Categories
    mensFragrances: { en: "Men's Fragrances", ar: 'عطور الرجال' },
    womensFragrances: { en: "Women's Fragrances", ar: 'عطور النساء' },
    unisexFragrances: { en: 'Unisex Fragrances', ar: 'عطور للجنسين' },
    limitedEditions: { en: 'Limited Editions', ar: 'الطبعات المحدودة' },
    bestSellers: { en: 'Best Sellers', ar: 'الأكثر مبيعاً' },
    newArrivals: { en: 'New Arrivals', ar: 'وصل حديثاً' },

    // Actions
    addToCart: { en: 'Add to Cart', ar: 'أضف إلى السلة' },
    addToWishlist: { en: 'Add to Wishlist', ar: 'أضف إلى قائمة الرغبات' },
    removeFromWishlist: { en: 'Remove from Wishlist', ar: 'إزالة من قائمة الرغبات' },
    viewDetails: { en: 'View Details', ar: 'عرض التفاصيل' },
    quickView: { en: 'Quick View', ar: 'نظرة سريعة' },
    compare: { en: 'Compare', ar: 'مقارنة' },

    // Product details
    productDescription: { en: 'Product Description', ar: 'وصف المنتج' },
    ingredients: { en: 'Ingredients', ar: 'المكونات' },
    howToUse: { en: 'How to Use', ar: 'طريقة الاستخدام' },
    reviews: { en: 'Reviews', ar: 'التقييمات' },
    writeReview: { en: 'Write a Review', ar: 'اكتب تقييماً' },
    share: { en: 'Share', ar: 'مشاركة' },
    selectSize: { en: 'Select Size', ar: 'اختر الحجم' },
    selectQuantity: { en: 'Select Quantity', ar: 'اختر الكمية' },

    // Checkout
    checkout: { en: 'Checkout', ar: 'الدفع' },
    shippingAddress: { en: 'Shipping Address', ar: 'عنوان الشحن' },
    billingAddress: { en: 'Billing Address', ar: 'عنوان الفواتير' },
    paymentMethod: { en: 'Payment Method', ar: 'طريقة الدفع' },
    orderSummary: { en: 'Order Summary', ar: 'ملخص الطلب' },
    placeOrder: { en: 'Place Order', ar: 'تأكيد الطلب' },

    // Account
    myAccount: { en: 'My Account', ar: 'حسابي' },
    myOrders: { en: 'My Orders', ar: 'طلباتي' },
    myWishlist: { en: 'My Wishlist', ar: 'قائمة رغباتي' },
    addressBook: { en: 'Address Book', ar: 'دفتر العناوين' },
    paymentMethods: { en: 'Payment Methods', ar: 'طرق الدفع' },
    personalInformation: { en: 'Personal Information', ar: 'المعلومات الشخصية' },
    changePassword: { en: 'Change Password', ar: 'تغيير كلمة المرور' },

    // Authentication
    signUp: { en: 'Sign Up', ar: 'إنشاء حساب' },
    forgotPassword: { en: 'Forgot Password?', ar: 'نسيت كلمة المرور؟' },
    rememberMe: { en: 'Remember Me', ar: 'تذكرني' },
    resetPassword: { en: 'Reset Password', ar: 'إعادة تعيين كلمة المرور' },
    createNewAccount: { en: 'Create New Account', ar: 'إنشاء حساب جديد' },

    // Messages
    success: { en: 'Success', ar: 'نجاح' },
    warning: { en: 'Warning', ar: 'تحذير' },
    info: { en: 'Information', ar: 'معلومات' },
    operationFailed: { en: 'Operation Failed', ar: 'فشلت العملية' },
    tryAgain: { en: 'Try Again', ar: 'حاول مرة أخرى' },

    // Filter and sort
    filter: { en: 'Filter', ar: 'تصفية' },
    sortBy: { en: 'Sort By', ar: 'ترتيب حسب' },
    priceLowToHigh: { en: 'Price: Low to High', ar: 'السعر: من الأقل إلى الأعلى' },
    priceHighToLow: { en: 'Price: High to Low', ar: 'السعر: من الأعلى إلى الأقل' },
    newest: { en: 'Newest', ar: 'الأحدث' },
    popularity: { en: 'Popularity', ar: 'الشعبية' },
    rating: { en: 'Rating', ar: 'التقييم' },

    // Brands (for navigation/filtering)
    chanel: { en: 'Chanel', ar: 'شانيل' },
    dior: { en: 'Dior', ar: 'ديور' },
    tomFord: { en: 'Tom Ford', ar: 'توم فورد' },
    creed: { en: 'Creed', ar: 'كريد' },
    byredo: { en: 'Byredo', ar: 'بايريدو' },
    leLabo: { en: 'Le Labo', ar: 'لي لابو' },
    versace: { en: 'Versace', ar: 'فيرساتشي' },
    ysl: { en: 'YSL', ar: 'واي إس إل' },
    gucci: { en: 'Gucci', ar: 'غوتشي' },

    // Common UI elements
    loading: { en: 'Loading...', ar: 'جاري التحميل...' },
    saving: { en: 'Saving...', ar: 'جاري الحفظ...' },
    updating: { en: 'Updating...', ar: 'جاري التحديث...' },
    deleting: { en: 'Deleting...', ar: 'جاري الحذف...' },
    confirmAction: { en: 'Confirm Action', ar: 'تأكيد الإجراء' },
    cancel: { en: 'Cancel', ar: 'إلغاء' },
    confirm: { en: 'Confirm', ar: 'تأكيد' },
    delete: { en: 'Delete', ar: 'حذف' },
    edit: { en: 'Edit', ar: 'تعديل' },
    update: { en: 'Update', ar: 'تحديث' },
    submit: { en: 'Submit', ar: 'إرسال' },
    save: { en: 'Save', ar: 'حفظ' },
    close: { en: 'Close', ar: 'إغلاق' },
    apply: { en: 'Apply', ar: 'تطبيق' },
    clear: { en: 'Clear', ar: 'مسح' },
    reset: { en: 'Reset', ar: 'إعادة تعيين' },

    // Social media and sharing
    followUs: { en: 'Follow Us', ar: 'تابعنا' },
    shareOnFacebook: { en: 'Share on Facebook', ar: 'مشاركة على فيسبوك' },
    shareOnTwitter: { en: 'Share on Twitter', ar: 'مشاركة على تويتر' },
    shareOnInstagram: { en: 'Share on Instagram', ar: 'مشاركة على إنستجرام' },
    shareOnWhatsapp: { en: 'Share on WhatsApp', ar: 'مشاركة على واتساب' },

    // Seasonal and promotional
    seasonalCollection: { en: 'Seasonal Collection', ar: 'المجموعة الموسمية' },
    holidaySpecial: { en: 'Holiday Special', ar: 'العرض العطلي' },
    summerEssentials: { en: 'Summer Essentials', ar: 'مستلزمات الصيف' },
    winterWarmer: { en: 'Winter Warmers', ar: 'دفء الشتاء' },
    giftIdeas: { en: 'Gift Ideas', ar: 'أفكار هدايا' },
    perfectGift: { en: 'Perfect Gift', ar: 'هدية مثالية' },

    // Shipping and delivery
    freeShipping: { en: 'Free Shipping', ar: 'شحن مجاني' },
    expressDelivery: { en: 'Express Delivery', ar: 'توصيل سريع' },
    sameDayDelivery: { en: 'Same Day Delivery', ar: 'توصيل في نفس اليوم' },
    estimatedDelivery: { en: 'Estimated Delivery', ar: 'موعد التوصيل المقدر' },
    trackOrder: { en: 'Track Order', ar: 'تتبع الطلب' },

    // Quality and guarantee
    qualityGuarantee: { en: 'Quality Guarantee', ar: 'ضمان الجودة' },
    authenticProducts: { en: 'Authentic Products', ar: 'منتجات أصلية' },
    moneyBackGuarantee: { en: 'Money Back Guarantee', ar: 'ضمان استعادة الأموال' },
    satisfactionGuaranteed: { en: 'Satisfaction Guaranteed', ar: 'رضا مضمون' },

    // Customer testimonials
    customerReviews: { en: 'Customer Reviews', ar: 'تقييمات العملاء' },
    testimonials: { en: 'Testimonials', ar: 'شهادات العملاء' },
    customerSatisfaction: { en: 'Customer Satisfaction', ar: 'رضا العملاء' },
    ratedByCustomers: { en: 'Rated by Customers', ar: 'تم التقييم من قبل العملاء' },

    // Newsletter and updates
    subscribe: { en: 'Subscribe', ar: 'اشتراك' },
    unsubscribe: { en: 'Unsubscribe', ar: 'إلغاء الاشتراك' },
    newsletter: { en: 'Newsletter', ar: 'النشرة الإخبارية' },
    specialOffers: { en: 'Special Offers', ar: 'عروض خاصة' },
    exclusiveDeals: { en: 'Exclusive Deals', ar: 'صفقات حصرية' },

    // ========== LANDING PAGE TRANSLATIONS ==========
    heroTitle: { en: 'Create Your Own Luxury', ar: 'أنشئ متجر عطورك الفاخر' },
    heroHighlight: { en: 'Perfume Store', ar: 'متجر عطور' },
    heroSubtitle: { en: 'Launch a beautiful, fully‑managed e‑commerce platform for premium fragrances. One store, many brands, ready in minutes.', ar: 'أطلق منصة تجارة إلكترونية جميلة وكاملة الإدارة للعطور الفاخرة. متجر واحد، العديد من العلامات التجارية، جاهز في دقائق.' },
    startStore: { en: 'Start Your Store', ar: 'ابدأ متجرك' },
    exploreDemo: { en: 'Explore Demo', ar: 'استكشف العرض التوضيحي' },
    featuresTitle: { en: 'Everything You Need', ar: 'كل ما تحتاجه' },
    featuresSubtitle: { en: 'A complete solution for perfume brands to sell online with ease.', ar: 'حل متكامل للعلامات التجارية للعطور للبيع عبر الإنترنت بسهولة.' },

    // Feature cards
    featureMultiTenant: { en: 'Multiple Brands', ar: 'علامات تجارية متعددة' },
    featureMultiTenantDesc: { en: 'Add and manage dozens of perfume brands, each with its own identity and products.', ar: 'أضف وأدر العشرات من العلامات التجارية للعطور، لكل منها هويتها ومنتجاتها الخاصة.' },
    featureProductMgmt: { en: 'Product Management', ar: 'إدارة المنتجات' },
    featureProductMgmtDesc: { en: 'Easy product uploads, fragrance notes, collections, and inventory tracking.', ar: 'رفع المنتجات بسهولة، ملاحظات العطر، المجموعات، وتتبع المخزون.' },
    featureMultiLang: { en: 'Multilingual Support', ar: 'دعم متعدد اللغات' },
    featureMultiLangDesc: { en: 'Arabic & English ready. Seamlessly switch between languages for global customers.', ar: 'العربية والإنجليزية جاهزتان. التبديل بسلاسة بين اللغات للعملاء العالميين.' },
    featureCart: { en: 'Shopping Cart & Checkout', ar: 'سلة التسوق والدفع' },
    featureCartDesc: { en: 'Fully functional cart, wishlist, and secure checkout experience.', ar: 'سلة تسوق كاملة الوظائف، قائمة الرغبات، وتجربة دفع آمنة.' },
    featureAdmin: { en: 'Admin Dashboard', ar: 'لوحة تحكم المسؤول' },
    featureAdminDesc: { en: 'Powerful admin panel to manage orders, products, and settings.', ar: 'لوحة تحكم قوية لإدارة الطلبات والمنتجات والإعدادات.' },
    featureSubdomain: { en: 'Custom Brand URL', ar: 'عنوان URL مخصص للعلامة التجارية' },
    featureSubdomainDesc: { en: 'Get your own branded subdomain immediately after registration.', ar: 'احصل على نطاقك الفرعي الخاص بعد التسجيل مباشرة.' },

    stepsTitle: { en: 'Get Started in 3 Simple Steps', ar: 'ابدأ في 3 خطوات بسيطة' },
    stepsSubtitle: { en: 'Launch your perfume store in minutes, not weeks.', ar: 'أطلق متجر العطور الخاص بك في دقائق، وليس أسابيع.' },
    step1Title: { en: 'Register Your Company', ar: 'سجل شركتك' },
    step1Desc: { en: 'Enter your company name, email, and choose a subdomain.', ar: 'أدخل اسم شركتك وبريدك الإلكتروني واختر نطاقًا فرعيًا.' },
    step2Title: { en: 'Add Your Products', ar: 'أضف منتجاتك' },
    step2Desc: { en: 'Upload your perfume collection with images, notes, and prices.', ar: 'حمِّل مجموعة العطور الخاصة بك مع الصور والملاحظات والأسعار.' },
    step3Title: { en: 'Start Selling', ar: 'ابدأ البيع' },
    step3Desc: { en: 'Your store is live. Manage orders and grow your business.', ar: 'متجرك حي. أدر الطلبات وطور عملك.' },
    ctaTitle: { en: 'Ready to Start Your Fragrance Journey?', ar: 'هل أنت مستعد لبدء رحلتك العطرية؟' },
    ctaSubtitle: { en: 'Join dozens of perfume brands using our platform to reach more customers.', ar: 'انضم إلى العشرات من العلامات التجارية للعطور التي تستخدم منصتنا للوصول إلى مزيد من العملاء.' },
    ctaButton: { en: 'Create Your Store Now', ar: 'أنشئ متجرك الآن' }
  }))

  // Notification helper that works with your existing notification system
  const showNotification = (options: { type: string; title: string; message: string; duration?: number }) => {
    window.dispatchEvent(new CustomEvent('luxury-notification', {
      detail: {
        type: options.type,
        title: options.title,
        message: options.message,
        duration: options.duration || 3000
      }
    }))
  }

  // Initialize on store creation
  if (typeof window !== 'undefined') {
    setTimeout(initialize, 100) // Small delay to ensure everything is loaded
  }

  return {
    // State
    currentLanguage,
    isTransitioning,
    availableLanguages,
    currentLanguageObj,

    // Getters
    isRTL,
    direction,
    fontFamily,
    luxuryTypography,

    // Actions
    setLanguage,
    toggleLanguage,
    initialize,
    showNotification,

    // Helper Functions
    t,
    formatCurrency,
    formatDate,

    // Translations
    translations
  }
})