import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import handleApi from './server/api.ts'

const localApi = {
  name: 'ecoperto-api',
  configureServer(server: import('vite').ViteDevServer) {
    server.middlewares.use('/api', (req, res) => {
      req.url = `/api${req.url}`
      void handleApi(req, res)
    })
  },
  configurePreviewServer(server: import('vite').PreviewServer) {
    server.middlewares.use('/api', (req, res) => {
      req.url = `/api${req.url}`
      void handleApi(req, res)
    })
  },
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  for (const key of ['OVERPASS_URL', 'NOMINATIM_URL'])
    if (env[key] && !process.env[key]) process.env[key] = env[key]
  return {
    plugins: [react(), tailwindcss(), localApi],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
  }
})
