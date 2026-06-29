import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const mockFintocPlugin = {
  name: 'mock-fintoc',
  configureServer(server) {
    return () => {
      server.middlewares.use('/api/fintoc-checkout', (req, res, next) => {
        if (req.method !== 'POST') return next()
        let body = ''
        req.on('data', (chunk) => { body += chunk })
        req.on('end', () => {
          try {
            const data = JSON.parse(body)
            console.log('✓ Mock Fintoc:', data.email)
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({
              sessionUrl: `https://pay.sandbox.fintoc.com/sessions/test_${Date.now()}?amount=${data.amount}`,
              sessionId: `test_${Date.now()}`,
            }))
          } catch (e) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Invalid request' }))
          }
        })
      })
    }
  },
}

export default defineConfig({
  plugins: [react(), mockFintocPlugin],
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
