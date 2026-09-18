// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'
import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  compatibilityDate: '2026-01-27',
  devtools: { enabled: false },

  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // modules: ['@nuxtjs/google-fonts'],

  alias: {
    '#data': fileURLToPath(new URL('./content', import.meta.url)),
  },

  // Global page headers: https://nuxt.com/docs/4.x/getting-started/seo-meta
  app: {
    head: {
      title: 'Plantlist',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: 'Application de reconnaissance de plantes indigènes.' },
        { name: 'format-detection', content: 'telephone=no' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Plantlist - plantes indigènes et exotiques' },
        { property: 'og:description', content: 'Liste et infos sur les plantes sauvages en Belgique.' },
        { property: 'og:image', content: 'https://plantqz.netlify.app/cgn-og-cover.png' },
      ],
      htmlAttrs: {
        lang: 'fr',
      },
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/manifest.webmanifest' }
      ],
    },
  },

  // PWA module configuration.
  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@vite-pwa/nuxt',
    '@nuxt/image'
  ],

  pwa: {
    // Test in dev mode
    // devOptions: {
    //   enabled: true,
    //   type: 'module'
    // },
    registerType: 'autoUpdate',
    manifest: {
      // Id and start_url should match. Chrome currently requires it.
      id: '/',
      start_url: '/',
      name: 'Plant quiz',
      short_name: 'Plantlist',
      description: 'Application de reconnaissance de plantes sauvages.',
      theme_color: '#541E76',
      background_color: '#ffffff',
      icons: [
        {
          src: '/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ],
      "screenshots": [
        {
          "src": "/app_screenshot_narrow.png",
            "sizes": "375x667",
            "type": "image/png",
            "form_factor": "narrow",
            "label": "App mobile"
        },
        {
          "src": "/app_screenshot.png",
            "sizes": "640x320",
            "type": "image/png",
            "form_factor": "wide",
            "label": "App"
        }
      ]
    },
    workbox: {
      // Testing for netlify, sometimes required to avoid conflicts with netlify routing.
      navigateFallback: null,
      // navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}']
    },
    client: {
      // Display install banner if supported
      installPrompt: true,
    },
    // Forcing for Netlify
    strategies: 'generateSW',
    injectRegister: 'auto',
  },

  // Global CSS.
  css: [
    '@/assets/sass/global.scss'
  ],

  vite: {
    css: {
      preprocessorMaxWorkers: true,
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/sass/_abstracts.scss" as *;',
        },
      },
    },
    // For the quiz view.
    optimizeDeps: {
      include: ['lodash.orderby', 'lodash.throttle', 'vue-agile'],
    },
  },

  googleFonts: {
    display: 'swap',
    families: {
      Roboto: [400, 500, 700],
    }
  },

})
