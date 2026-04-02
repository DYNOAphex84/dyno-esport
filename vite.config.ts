import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/dyno-esport/',
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
