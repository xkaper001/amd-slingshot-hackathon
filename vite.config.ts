import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    host: true,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  },
  preview: {
    allowedHosts: ["amd-slingshot-hackathon-647243420459.asia-south1.run.app"]
  }
})
