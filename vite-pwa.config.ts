import { VitePWA } from 'vite-plugin-pwa';

export const pwaConfig = VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          },
          cacheKeyWillBeUsed: async ({ request }) => {
            return `${request.url}?${Date.now()}`;
          },
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'gstatic-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          },
        },
      },
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'supabase-api-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24, // 1 day
          },
          networkTimeoutSeconds: 10,
        },
      },
      {
        urlPattern: /\.(png|jpg|jpeg|svg|gif|webp)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'images-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          },
        },
      },
      {
        urlPattern: /\.(js|css)$/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-resources',
        },
      },
    ],
    cleanupOutdatedCaches: true,
    skipWaiting: true,
  },
  includeAssets: ['favicon.ico', 'icons/icon.svg'],
  manifest: {
    name: 'RN Gestor Auto',
    short_name: 'RN Gestor',
    description: 'Sistema de gestão para concessionárias de veículos',
    theme_color: '#ffffff',
    background_color: '#ffffff',
    display: 'standalone',
    orientation: 'portrait',
    scope: '/',
    start_url: '/',
    icons: [
      {
        src: 'icons/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any maskable',
      },
    ],
    categories: ['business', 'productivity'],
    lang: 'pt-BR',
    dir: 'ltr',
    shortcuts: [
      {
        name: 'Dashboard',
        short_name: 'Dashboard',
        description: 'Acesso rápido ao dashboard',
        url: '/dashboard',
      },
      {
        name: 'Veículos',
        short_name: 'Veículos',
        description: 'Gerenciar veículos',
        url: '/dashboard/vehicles',
      },
      {
        name: 'Clientes',
        short_name: 'Clientes',
        description: 'Gerenciar clientes',
        url: '/dashboard/customers',
      },
      {
        name: 'Anúncios',
        short_name: 'Anúncios',
        description: 'Gerenciar anúncios',
        url: '/dashboard/ads',
      },
    ],

    related_applications: [],
    prefer_related_applications: false,
  },
  devOptions: {
    enabled: true,
    type: 'module',
  },
});

export default pwaConfig;