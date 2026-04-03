import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/dyno-esport/',
  root: 'source',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    sourcemap: false,
    emptyOutDir: true
  }
})
