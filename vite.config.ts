import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Garante que os caminhos dos arquivos funcionem em qualquer rota
  define: {
    // Garante compatibilidade com código que usa process.env
    'process.env': process.env
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
})