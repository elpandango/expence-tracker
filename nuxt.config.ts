export default defineNuxtConfig({
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
      Raleway: {
        wght: [400, 500, 600],
      },
    }
  }], '@pinia/nuxt'],
  plugins: ['~/plugins/router.js'],
})