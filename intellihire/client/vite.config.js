import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // expose on all network interfaces (0.0.0.0)
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,   // Fix: rewrite the Host header so CORS passes
        secure: false,
        // Fix: rewrite cookie domain so cross-device cookies work
        cookieDomainRewrite: { '*': '' },
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})

