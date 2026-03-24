// scripts/generate-sitemap.ts
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// Get the directory name (for ES modules)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from project root
dotenv.config({ path: resolve(__dirname, '../.env.local') })

// Configuration
const BASE_URL = process.env.VITE_APP_URL || 'https://p-commerce-peach.vercel.app'
const OUTPUT_DIR = resolve(__dirname, '../public')
const OUTPUT_FILE = 'sitemap.xml'

// Ensure output directory exists
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true })
}

// Priority mapping
const PRIORITY = {
  home: '1.0',
  category: '0.9',
  product: '0.8',
  static: '0.7',
  brand: '0.8'
}

// Frequency mapping
const FREQUENCY = {
  home: 'daily',
  category: 'weekly',
  product: 'monthly',
  static: 'monthly',
  brand: 'weekly'
}

// Initialize Supabase client (using service role for full access)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

interface Product {
  id: string
  slug: string
  updated_at: string
  is_active: boolean
}

interface Brand {
  id: string
  slug: string
  updated_at: string
  is_active: boolean
}

interface Category {
  id: string
  name: string
  slug: string
}

async function generateSitemap() {
  console.log('🔍 Generating sitemap...')
  console.log(`📍 Base URL: ${BASE_URL}`)

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">`

  // ==================== STATIC PAGES ====================
  const staticPages = [
    { loc: '/', priority: PRIORITY.home, changefreq: FREQUENCY.home },
    { loc: '/shop', priority: PRIORITY.static, changefreq: FREQUENCY.static },
    { loc: '/brands', priority: PRIORITY.static, changefreq: FREQUENCY.static },
    { loc: '/offers', priority: PRIORITY.static, changefreq: FREQUENCY.static },
    { loc: '/collections', priority: PRIORITY.static, changefreq: FREQUENCY.static },
    { loc: '/contact', priority: PRIORITY.static, changefreq: FREQUENCY.static },
    { loc: '/about', priority: PRIORITY.static, changefreq: FREQUENCY.static },
    { loc: '/cart', priority: PRIORITY.static, changefreq: FREQUENCY.static },
    { loc: '/wishlist', priority: PRIORITY.static, changefreq: FREQUENCY.static }
  ]

  staticPages.forEach(page => {
    xml += `
  <url>
    <loc>${BASE_URL}${page.loc}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  })

  try {
    // ==================== CATEGORIES ====================
    console.log('📁 Fetching categories from Supabase...')
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name')
      .limit(100)

    if (categoriesError) throw categoriesError

    if (categories && categories.length > 0) {
      console.log(`✅ Found ${categories.length} categories`)
      categories.forEach(category => {
        const slug = category.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || category.id
        xml += `
  <url>
    <loc>${BASE_URL}/category/${slug}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${FREQUENCY.category}</changefreq>
    <priority>${PRIORITY.category}</priority>
  </url>`
      })
    } else {
      // Fallback to static categories
      const fallbackCategories = [
        'mens', 'womens', 'unisex', 'luxury', 'niche', 'best-sellers', 'new-arrivals'
      ]
      fallbackCategories.forEach(category => {
        xml += `
  <url>
    <loc>${BASE_URL}/category/${category}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${FREQUENCY.category}</changefreq>
    <priority>${PRIORITY.category}</priority>
  </url>`
      })
    }

    // ==================== PRODUCTS ====================
    console.log('📦 Fetching products from Supabase...')
    let allProducts: Product[] = []
    let page = 0
    const pageSize = 1000

    while (true) {
      const { data, error } = await supabase
        .from('products')
        .select('id, slug, updated_at, is_active')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1)

      if (error) throw error
      if (!data || data.length === 0) break

      allProducts = [...allProducts, ...data]
      page++

      if (data.length < pageSize) break
    }

    console.log(`✅ Found ${allProducts.length} active products`)

    allProducts.forEach(product => {
      const lastmod = product.updated_at 
        ? new Date(product.updated_at).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]

      xml += `
  <url>
    <loc>${BASE_URL}/product/${product.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${FREQUENCY.product}</changefreq>
    <priority>${PRIORITY.product}</priority>
  </url>`
    })

    // ==================== BRANDS ====================
    console.log('🏷️ Fetching brands from Supabase...')
    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select('id, slug, updated_at, is_active')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (brandsError) throw brandsError

    console.log(`✅ Found ${brands?.length || 0} active brands`)

    brands?.forEach(brand => {
      const lastmod = brand.updated_at 
        ? new Date(brand.updated_at).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]

      xml += `
  <url>
    <loc>${BASE_URL}/brand/${brand.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${FREQUENCY.brand}</changefreq>
    <priority>${PRIORITY.brand}</priority>
  </url>`
    })

  } catch (error) {
    console.error('❌ Error fetching data:', error)
    console.log('⚠️ Continuing with static pages only')
  }

  xml += '\n</urlset>'

  // Write sitemap file
  const outputPath = `${OUTPUT_DIR}/${OUTPUT_FILE}`
  writeFileSync(outputPath, xml)

  const urlCount = (xml.match(/<url>/g) || []).length
  console.log(`✅ Sitemap generated: ${outputPath}`)
  console.log(`🌐 Total URLs: ${urlCount}`)

  // Generate robots.txt if not exists
  const robotsPath = `${OUTPUT_DIR}/robots.txt`
  if (!existsSync(robotsPath)) {
    const robotsTxt = `# P.COMMERCE robots.txt
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /admin/*
Disallow: /cart
Disallow: /checkout
Disallow: /account/

# Sitemap
Sitemap: ${BASE_URL}/sitemap.xml

# Crawl delay
Crawl-delay: 1

# Security
Disallow: /.env
Disallow: /.git/
Disallow: /node_modules/
Disallow: /src/
Disallow: /public/*.html
Disallow: /*.json$
Disallow: /*.xml$
Allow: /sitemap.xml

# Development/Staging
User-agent: *
Disallow: /staging/
Disallow: /test/
Disallow: /dev/`

    writeFileSync(robotsPath, robotsTxt)
    console.log('✅ robots.txt generated')
  } else {
    console.log('📄 robots.txt already exists, skipping...')
  }
}

// Run the generator
generateSitemap().catch((error) => {
  console.error('❌ Sitemap generation failed:', error)
  process.exit(1)
})
