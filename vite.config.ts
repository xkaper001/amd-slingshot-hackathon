import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    host: true, // Listen on all local IPs
  },
  preview: {
    allowedHosts: ["amd-slingshot-hackathon-647243420459.asia-south1.run.app"]
  }
})
