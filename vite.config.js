import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          'three-vendor': ['three'],
          'jspdf-vendor': ['jspdf', 'jspdf-autotable'],
          'react-vendor': ['react', 'react-dom'],
          'zustand-vendor': ['zustand'],
          'icons-vendor': ['lucide-react'],
        },
      },
    },
  },
})
