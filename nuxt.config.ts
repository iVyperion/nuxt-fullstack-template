// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxt/ui',
    'nuxt-auth-utils',
    'nuxt-nodemailer',
  ],

  nodemailer: {
    from: '"John Doe" <john@doe.com>',
    host: 'smtp.mailtrap.io',
    port: 465,
    secure: true,
    auth: {
      user: 'john@doe.com',
      pass: '',
    },
  },


  components: [
    { path: '~/components/atoms', pathPrefix: false },
    { path: '~/components/molecules', pathPrefix: false },
    { path: '~/components/organisms', pathPrefix: false },
    { path: '~/components', pathPrefix: false }
  ],

  css: ['@/assets/css/main.css'],


  nitro: {
    prerender: {
      ignore: ['/api/**'],
    },
    routeRules: {
      '/': { prerender: true }
    }
  },

  vite: {
    ssr: {
      external: ["@prisma/client"]
    },
    resolve: {
      alias: {
        ".prisma/client/index-browser": "./node_modules/.prisma/client/index-browser.js"
      }
    }
  },

  runtimeConfig: {
    // Private keys only available server-side
    // Set NUXT_DATABASE_URL, NUXT_HYTALE_OAUTH_BASE, etc. in .env or environment
    databaseUrl: '',
    oauth: {
      discord: {
        clientId: '',
        clientSecret: ''
      },
      google: {
        clientId: '',
        clientSecret: ''
      }
    },
    session: {
      password: ''
    },
    public: {
      // Add public runtime config here, e.g. baseURL: ''
    }
  },



  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
      autoprefixer: {}
    }
  }
})