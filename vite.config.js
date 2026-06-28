import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: parseInt(process.env.PORT) || 5173,
    strictPort: false,
  },
  build: {
    outDir: 'dist',
    // Vendor split: React y el router cambian poco, así el navegador los cachea
    // entre deploys y solo re-descarga el código de la app cuando cambia.
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
    // Sube el umbral de inline para evitar warnings con CSS grande ya minificado.
    chunkSizeWarningLimit: 700,
  },
})
