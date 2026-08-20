import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Регистрация Service Worker только в production-сборке (PWA / offline-first).
// В dev-режиме отключаем, чтобы кэш не мешал видеть свежие изменения.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch((err) => {
      console.log('SW registration failed:', err);
    });
  });
}
