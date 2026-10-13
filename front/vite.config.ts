import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Proxy: fetch('/api/...') → http://localhost:3333/api/...
    // Elimina CORS em desenvolvimento sem precisar de variável de ambiente.
    proxy: {
      '/api': { target: 'http://localhost:3333', changeOrigin: true },
    },
  },
})