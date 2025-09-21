import React from 'react';
import ReactDOM from 'react-dom/client';
import './src/index.css'; // keep path but ensure Vite resolves correctly

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

// Register a basic service worker (only in production or when served over HTTPS)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = '/sw.js';
    navigator.serviceWorker.register(swUrl).catch(() => {
      // ignore errors
    });
  });
}