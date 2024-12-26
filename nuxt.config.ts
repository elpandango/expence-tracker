export default defineNuxtConfig({
  ssr: true,
  devtools: { enabled: true },
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
  }], '@pinia/nuxt'],
  plugins: ['~/plugins/router.ts', '~/plugins/global-components.ts'],
  server: {
    plugins: ['~/server/plugins/initializeCategories.ts'],
  },
})