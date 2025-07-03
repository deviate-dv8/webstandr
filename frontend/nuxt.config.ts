// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  app: {
    head: {
      link: [{ rel: "icon", type: "image/png", href: "/favicon-32x32.png" }],
    },
  },
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4,
  },
  devServer: {
    port: 3400,
  },
  auth: {
    baseURL: `${process.env.BACKEND_URL}/api/auth`,
    provider: {
      type: "local",
      pages: {
        login: "/auth/login",
      },
      endpoints: {
        signIn: { path: "/login", method: "post" },
        signOut: { path: "/logout", method: "post" },
        signUp: { path: "/signup", method: "post" },
        getSession: { path: "/me", method: "get" },
      },
      token: {
        signInResponseTokenPointer: "/token",
        maxAgeInSeconds: 60 * 60 * 60 * 7,
      },
    },
  },
  modules: [
    "@nuxt/eslint",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxtjs/tailwindcss",
    "@sidebase/nuxt-auth",
    "@primevue/nuxt-module",
  ],
});
