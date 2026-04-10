import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    mkcert(), // Enables HTTPS on localhost — required for Firebase Auth popup
  ],
  server: {
    host: true, // Listen on all local IPs
  },
  preview: {
    allowedHosts: ["amd-slingshot-hackathon-647243420459.asia-south1.run.app"]
  }
})
