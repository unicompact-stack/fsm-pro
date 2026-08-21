import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Номер сборки: дата и время запуска дев-сервера / прод-сборки.
// Показывается на экране входа и в «Помощи», чтобы всегда понимать,
// какая версия перед глазами. Обновляется автоматически.
const buildId = (() => {
  const now = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(now.getDate())}.${p(now.getMonth() + 1)}.${now.getFullYear()} ${p(now.getHours())}:${p(now.getMinutes())}`
})()

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  define: {
    __APP_BUILD__: JSON.stringify(buildId),
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
  }
})
