import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/shopping-list-pwa/", // Set base for GitHub Pages
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo.png', 'icons/apple-icon-180.png'],
      manifest: {
        name: 'Kolay Alışveriş',
        short_name: 'Alışveriş',
        description: 'Alışveriş listelerinizi kolayca oluşturun ve yönetin',
        start_url: '/shopping-list-pwa/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#4CAF50',
        orientation: 'portrait',
        icons: [
          {
            src: 'icons/manifest-icon-192.maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icons/manifest-icon-512.maskable.png',
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
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
