import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@components": fileURLToPath(new URL("./src/components", import.meta.url)),
      "@pages": fileURLToPath(new URL("./src/pages", import.meta.url)),
      "@stores": fileURLToPath(new URL("./src/stores", import.meta.url)),
      "@utils": fileURLToPath(new URL("./src/utils", import.meta.url)),
      "@types": fileURLToPath(new URL("./src/types", import.meta.url)),
      "@assets": fileURLToPath(new URL("./src/assets", import.meta.url))
    }
  },

  build: {
    target: "es2020",
    sourcemap: false,
    cssCodeSplit: true,
    minify: "terser",

    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },

    rollupOptions: {
      output: {
        manualChunks: {
          "vue-vendor": ["vue", "vue-router", "pinia"],
          "supabase-vendor": ["@supabase/supabase-js"],
          "ui-vendor": ["@vueuse/core"],
          "utils-vendor": ["date-fns", "yup"]
        },

        entryFileNames: "assets/js/[name]-[hash].js",
        chunkFileNames: "assets/js/[name]-[hash].js",

        assetFileNames: ({ name }) => {
          if (!name) return "assets/[name]-[hash][extname]";

          if (/\.(gif|jpe?g|png|svg|webp|avif)$/i.test(name)) {
            return "assets/images/[name]-[hash][extname]";
          }

          if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) {
            return "assets/fonts/[name]-[hash][extname]";
          }

          if (/\.css$/i.test(name)) {
            return "assets/css/[name]-[hash][extname]";
          }

          return "assets/[name]-[hash][extname]";
        }
      }
    }
  },

  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/assets/styles/variables.scss";`
      }
    }
  },

  server: {
    port: 3000,
    host: true,
    open: true
  },

  preview: {
    port: 4173,
    host: true
  }
});
