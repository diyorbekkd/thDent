import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'Medlink Dental',
        short_name: 'Medlink',
        description: 'Dental Practice Management System',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // 👇 YANGI QO'SHILGAN QISM (BUILD OPTIMIZATSIYA)
  build: {
    chunkSizeWarningLimit: 1000, // Ogohlantirish limitini 1MB ga ko'taramiz
    rollupOptions: {
      output: {
        manualChunks: {
          // Katta kutubxonalarni alohida faylga ajratamiz
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'ui-vendor': ['lucide-react', 'clsx', 'tailwind-merge', 'date-fns']
        }
      }
    }
  }
})