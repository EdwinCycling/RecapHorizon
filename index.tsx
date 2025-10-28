import React from 'react';
import ReactDOM from 'react-dom/client';
import './src/index.css';

import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register the service worker only in production or when served over HTTPS
if ('serviceWorker' in navigator && (import.meta.env?.PROD || window.location.protocol === 'https:')) {
  window.addEventListener('load', () => {
    const swUrl = '/sw.js';
    navigator.serviceWorker.register(swUrl).catch(() => {
      // ignore errors
    });
  });
} else if ('serviceWorker' in navigator) {
  // In development or non-HTTPS, proactively unregister any existing service workers
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((reg) => reg.unregister());
  }).catch(() => {
    // ignore errors
  });
  // Also clear any caches created by a previous service worker
  if ('caches' in window) {
    caches.keys().then((keys) => {
      keys.forEach((key) => caches.delete(key));
    }).catch(() => {
      // ignore errors
    });
  }
}