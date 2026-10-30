// @ts-check
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { d1, r2 } from "@emdash-cms/cloudflare";
import { defineConfig } from "astro/config";
import emdash from "emdash/astro";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: cloudflare({
    // Public images are static files or R2 media URLs. Skip the Images binding.
    imageService: "passthrough",
  }),
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    react(),
    emdash({
      database: d1({ binding: "DB" }),
      storage: r2({ binding: "MEDIA" }),
      images: false,
    }),
  ],
});
