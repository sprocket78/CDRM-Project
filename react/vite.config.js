import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    sourcemap: false, // Disable source maps
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react")) return "react-vendor"; // Separate React-related libraries
            if (id.includes("tailwindcss")) return "tailwind-vendor"; // Separate Tailwind
            return "vendor"; // Other third-party libraries
          }
        },
      },
    },
  },
  server: {
    host: "localhost",
    port: 1338, // CHANGE THIS (FRONTEND PORT)
    strictPort: true, 
    proxy: {
      "/api": {
        target: "http://localhost:1337", // CHANGE THIS (BACKEND ENDPOINT) 
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
