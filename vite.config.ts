import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path' 

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
     tailwindcss()
  ],
  // This adds the '@/' alias we've been using
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // This is the new proxy section
  server: {
    proxy: {
      // Forward any request starting with /api
      '/api': {
        target: 'http://localhost:3001', // to your json-server
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // remove /api
      },
    }
  }
})
