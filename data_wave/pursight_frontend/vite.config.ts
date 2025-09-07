import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path"
import tailwindcss from "@tailwindcss/vite"
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), tailwindcss(),
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "next/navigation": path.resolve(__dirname, "./src/lib/next-navigation-shim.ts"),
    },
  },
  server: {
    proxy: {
      // Proxy frontend calls to backend, stripping the /proxy prefix
      "/proxy": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/proxy/, ""),
      },
      // Proxy health check endpoints directly
      "/health": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
      // Proxy racine integration endpoints
      "/api/racine": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
