import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000 // Setzt den Port auf 3000
  },
  plugins: [react()],
  assetsInclude: ['**/*.csv'],
})
