import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api':  { target: 'http://localhost:3001', changeOrigin: true },
      '/auth': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-tiptap': [
            '@tiptap/react', '@tiptap/starter-kit',
            '@tiptap/extension-color', '@tiptap/extension-text-style',
            '@tiptap/extension-highlight', '@tiptap/extension-image',
            '@tiptap/extension-underline',
          ],
          'vendor-motion': ['framer-motion'],
          'vendor-mui': ['@mui/material', '@mui/icons-material', '@mui/x-data-grid'],
        },
      },
    },
  },
})
