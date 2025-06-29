import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/extra-2025a-GabrielUFSM/',
  plugins: [react()],
  publicDir: 'frontend/public',
})
