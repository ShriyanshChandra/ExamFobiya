import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './App';
import { warmBackend } from './utils/api';

// Wake the backend immediately on every page visit so later dashboard requests
// are less likely to pay the cost of a cold start.
warmBackend();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

// Register PWA Service Worker for offline support and fast loading
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('[ServiceWorker] Registered with scope:', reg.scope);
      })
      .catch((err) => {
        console.error('[ServiceWorker] Registration failed:', err);
      });
  });
} else if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('[ServiceWorker] Development SW registered:', reg.scope);
      })
      .catch((err) => {
        console.error('[ServiceWorker] Development SW registration failed:', err);
      });
  });
}
