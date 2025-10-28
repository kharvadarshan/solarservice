import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// https://vite.dev/config/
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [react()],
   resolve: {
    alias: {
      crypto: 'crypto-browserify',
       '@': path.resolve(__dirname, './src'),
    },
  },
})

