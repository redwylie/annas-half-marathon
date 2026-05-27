import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/annas-half-marathon/' : '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'rabbit.svg'],
      manifest: {
        name: 'Run Anna Run',
        short_name: 'Run Anna Run',
        description: "Anna's 8-week half marathon training plan",
        theme_color: '#1D9E75',
        background_color: '#fafafa',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/annas-half-marathon/',
        start_url: '/annas-half-marathon/',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: '/annas-half-marathon/index.html',
        navigateFallbackDenylist: [/^\/api/],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
}))
