import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true // Allows you to test the PWA in your local dev environment
      },
      manifest: {
        name: 'Store AutoSys Terminal',
        short_name: 'AutoSys',
        description: 'Offline-capable Point of Sale System',
        theme_color: '#212529', // Matches your Bootstrap dark navbar
        background_color: '#f8f9fa',
        display: 'standalone', // Hides the browser URL bar when installed
        icons: [
          {
            // Using a generic CDN icon for the coursework MVP
            src: 'https://cdn-icons-png.flaticon.com/512/2983/2983067.png', 
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})