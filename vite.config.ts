import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg"],
      manifest: {
        name: "MeterClarity",
        short_name: "MeterClarity",
        description: "看懂本期水電用量、估算費用與資料新鮮度",
        theme_color: "#0f766e",
        background_color: "#f4f7f5",
        display: "standalone",
        lang: "zh-Hant",
        icons: [{ src: "icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }]
      },
      workbox: { navigateFallback: "index.html" }
    })
  ]
});
