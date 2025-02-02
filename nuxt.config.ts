export default defineNuxtConfig({
  ssr: true,
  devtools: {enabled: true},
  nitro: {
    plugins: ["~/server/plugins/mongodb.ts"],
  },
  app: {
    pageTransition: {name: 'page', mode: 'out-in'}
  },
  css: [],
  postcss: {
    plugins: {
      autoprefixer: {},
    },
  },
  modules: [['@nuxtjs/google-fonts', {
    families: {
      Montserrat: {
        wght: [400, 500, 600],
      },
      'Material+Symbols+Outlined': true,
    }
  }],
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxt/eslint'
  ],
  plugins: ['~/plugins/router.ts'],
  server: {
    plugins: ['~/server/plugins/initializeCategories.ts'],
  },
})