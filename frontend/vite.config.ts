import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    headers: {
      // Allow Firebase Auth popup (Google OAuth) to communicate back to the
      // main window. Without this, the browser's strict Cross-Origin-Opener-Policy
      // blocks window.closed / window.close calls from the popup, breaking login.
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    }
  }
})
