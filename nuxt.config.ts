export default defineNuxtConfig({
  ssr: true,
  devtools: {enabled: true},
  nitro: {
    plugins: ["~/server/plugins/mongodb.ts"],
  },
  app: {
    pageTransition: {name: 'page', mode: 'out-in'}
  },
  css: ['@/assets/scss/global.scss'],
  postcss: {
    plugins: {
      autoprefixer: {},
    },
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "@/assets/scss/_variables.scss";'
        }
      }
    }
  },
  modules: [['@nuxtjs/google-fonts', {
    families: {
      Montserrat: {
        wght: [400, 500, 600],
      },
      'Material+Symbols+Outlined': true,
    }
  }], '@pinia/nuxt', '@vite-pwa/nuxt'],
  plugins: ['~/plugins/router.ts'],
  server: {
    plugins: ['~/server/plugins/initializeCategories.ts'],
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Expendango - Expense Tracking App',
      short_name: 'Expendango',
      description: 'Expendango – your personal assistant in the world of finance! Manage your money effortlessly: track expenses, analyze income, and plan for the future. Financial freedom starts here.',
      lang: 'en',
      display: 'standalone',
      start_url: '/',
      theme_color: '#ffffff',
      background_color: '#ffffff',
      icons: [
        {
          src: '/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
  },
})