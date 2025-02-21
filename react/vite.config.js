import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    sourcemap: false, // Disable source maps to avoid missing .map file errors
  },
  server: {
    sourcemapIgnoreList: () => true, // Ignore missing source maps
  }
})
