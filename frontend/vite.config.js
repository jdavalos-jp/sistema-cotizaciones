import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Leer API_BASE_URL desde variable de entorno o usar default
const apiTarget = process.env.VITE_API_BASE_URL || 'http://localhost:3001'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
})
