import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    port: 5173,
    // Слушать все интерфейсы — чтобы ngrok мог достучаться.
    host: true,
    // Vite 8 блокирует незнакомый Host (ngrok-домен) → 403. Разрешаем туннели.
    allowedHosts: true,
    proxy: {
      // Фронт публикуется через ngrok; API проксируется тем же origin.
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
