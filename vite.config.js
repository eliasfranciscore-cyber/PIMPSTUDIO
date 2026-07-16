import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const mockFlowPlugin = {
  name: 'mock-flow',
  configureServer(server) {
    return () => {
      server.middlewares.use('/api/flow-payments', (req, res, next) => {
        const url = new URL(req.url, 'http://localhost')

        // GET ?status=1&token=... — usado por el frontend al volver del checkout mock
        if (req.method === 'GET' && url.searchParams.get('status') === '1') {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ status: 2, paid: true, amount: url.searchParams.get('amount') || 9990 }))
          return
        }

        if (req.method !== 'POST') return next()
        let body = ''
        req.on('data', (chunk) => { body += chunk })
        req.on('end', () => {
          try {
            const data = JSON.parse(body)
            console.log('✓ Mock Flow:', data.email)
            const token = `test_${Date.now()}`
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({
              sessionUrl: `http://localhost:${parseInt(process.env.PORT) || 5173}/cursos?flow_token=${token}&amount=${data.amount}`,
              token,
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
  plugins: [react(), mockFlowPlugin],
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
