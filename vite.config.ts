import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  build: {
    // Increase chunk size warning limit to 1000kb (optional)
    chunkSizeWarningLimit: 1000,
    
    rollupOptions: {
      output: {
        // Manual chunk splitting for better performance
        manualChunks: {
          // Vue core and router (critical for all pages)
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          
          // Supabase client (used in many places)
          'vendor-supabase': ['@supabase/supabase-js'],
          
          // VueUse utilities
          'vendor-vueuse': ['@vueuse/core'],
          
          // UI heavy libraries
          'vendor-ui': ['vue3-carousel', 'vue-toastification'],
          
          // Chart and visualization libraries (if used)
          // 'vendor-charts': ['chart.js', 'vue-chartjs'],
        },
        
        // Advanced chunk splitting using function
        manualChunks(id) {
          // Split vendor chunks from node_modules
          if (id.includes('node_modules')) {
            // Vue ecosystem
            if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
              return 'vendor-vue'
            }
            
            // Supabase
            if (id.includes('@supabase')) {
              return 'vendor-supabase'
            }
            
            // VueUse
            if (id.includes('@vueuse')) {
              return 'vendor-vueuse'
            }
            
            // UI components
            if (id.includes('vue3-carousel') || id.includes('vue-toastification')) {
              return 'vendor-ui'
            }
            
            // All other node_modules go to common vendor
            return 'vendor'
          }
          
          // Split admin components into separate chunks
          if (id.includes('/src/components/Admin/') || id.includes('/src/pages/Admin/')) {
            return 'admin-module'
          }
          
          // Split product components
          if (id.includes('/src/components/Products/') || id.includes('/src/pages/Products/')) {
            return 'products-module'
          }
          
          // Split layout components
          if (id.includes('/src/components/Layout/')) {
            return 'layout-module'
          }
          
          // Split cart and checkout
          if (id.includes('/src/components/Cart/') || id.includes('/src/pages/Checkout')) {
            return 'cart-module'
          }
          
          // Split brand components
          if (id.includes('/src/components/Brand/') || id.includes('/src/pages/Brand/')) {
            return 'brand-module'
          }
        },
        
        // Optimize chunk file naming
        chunkFileNames: (chunkInfo) => {
          // Use different naming patterns for different chunk types
          if (chunkInfo.name === 'admin-module') {
            return 'assets/admin/[name]-[hash].js'
          }
          if (chunkInfo.name === 'products-module') {
            return 'assets/products/[name]-[hash].js'
          }
          if (chunkInfo.name === 'cart-module') {
            return 'assets/cart/[name]-[hash].js'
          }
          return 'assets/js/[name]-[hash].js'
        },
        
        entryFileNames: 'assets/js/[name]-[hash].js',
        
        assetFileNames: (assetInfo) => {
          // Organize assets by type
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/css/[name]-[hash][extname]'
          }
          if (assetInfo.name?.endsWith('.png') || 
              assetInfo.name?.endsWith('.jpg') || 
              assetInfo.name?.endsWith('.jpeg') || 
              assetInfo.name?.endsWith('.svg')) {
            return 'assets/images/[name]-[hash][extname]'
          }
          if (assetInfo.name?.endsWith('.woff') || 
              assetInfo.name?.endsWith('.woff2') || 
              assetInfo.name?.endsWith('.ttf')) {
            return 'assets/fonts/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
    
    // Minification settings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // Remove specific console functions
      },
      format: {
        comments: false, // Remove comments
      },
    },
    
    // Source maps (disable for production to reduce size)
    sourcemap: false,
    
    // Target modern browsers
    target: 'es2015',
    
    // Enable CSS code splitting
    cssCodeSplit: true,
    
    // Improve tree shaking
    modulePreload: {
      polyfill: true,
    },
    
    // CommonJS options
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
  
  // Optimize dependencies pre-bundling
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      '@supabase/supabase-js',
      '@vueuse/core',
    ],
    exclude: [],
  },
  
  // Server configuration
  server: {
    port: 3000,
    open: true,
  },
  
  // Preview configuration (for production testing)
  preview: {
    port: 4173,
    open: true,
  },
})