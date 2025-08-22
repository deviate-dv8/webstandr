// https://nuxt.com/docs/api/configuration/nuxt-config
import Aura from "@primeuix/themes/aura";
import { definePreset } from "@primeuix/themes";

const WebStandrPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: "{orange.50}",
      100: "{orange.100}",
      200: "{orange.200}",
      300: "{orange.300}",
      400: "{orange.400}",
      500: "{orange.500}",
      600: "{orange.600}",
      700: "{orange.700}",
      800: "{orange.800}",
      900: "{orange.900}",
      950: "{orange.950}",
    },
  },
});

export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  runtimeConfig: {
    public: {
      API_URL: process.env.BACKEND_URL,
    },
  },
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
  primevue: {
    options: {
      theme: {
        preset: WebStandrPreset,
        options: {
          prefix: "p",
          darkModeSelector: false,
          cssLayer: false,
          colors: {
            primary: "#FFA500", // Orange color
          },
        },
      },
    },
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
    "@vueuse/nuxt",
    "@vee-validate/nuxt",
  ],
});