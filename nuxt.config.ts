// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  typescript: {
    typeCheck: false // Disable TypeScript checking for faster startup
  },
  modules: [
    '@nuxt/content',
    '@vueuse/nuxt',
    '@nuxtjs/tailwindcss'
  ],
  content: {
    // Content configuration using pre-built MDN content
    sources: {
      // Local content directory
      content: {
        driver: 'fs',
        prefix: '/docs',
        base: 'content'
      }
    },
    highlight: {
      theme: {
        default: 'github-light',
        dark: 'github-dark'
      },
      preload: [
        'javascript',
        'typescript',
        'json',
        'html',
        'css',
        'bash',
        'shell'
      ]
    },
    markdown: {
      toc: {
        depth: 3,
        searchDepth: 3
      }
    },
    // Disable automatic route generation to prevent conflicts
    documentDriven: false,
    experimental: {
      clientDB: false
    }
  },
  runtimeConfig: {
    // Server-side environment variables
    githubToken: process.env.GITHUB_TOKEN,
    openRouterApiKey: process.env.OPENROUTER_API_KEY,
    public: {
      // Client-side environment variables
      mdnCacheExpiry: 1000 * 60 * 60 * 24, // 24 hours
      mdnApiUrl: 'https://api.github.com/repos/mdn/content/contents/files/en-us/web/javascript',
      openRouterApiKey: process.env.OPENROUTER_API_KEY
    }
  }
})
