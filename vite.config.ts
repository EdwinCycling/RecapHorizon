import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isProd = mode === 'production';
    return {
      plugins: [react()],
      server: {
        port: 3000,
        strictPort: true, // Force port 3000
        host: true, // Dit zorgt ervoor dat de server toegankelijk is vanaf andere apparaten op je netwerk
        open: false, // Open browser niet automatisch
        cors: true, // Enable CORS for development
        proxy: {
          '/.netlify/functions': {
            target: 'http://127.0.0.1:9000',
            changeOrigin: true,
            secure: false
          }
        }
      },
      define: {
        'process.env.VITE_FIREBASE_API_KEY': JSON.stringify(env.VITE_FIREBASE_API_KEY),
        'process.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN),
        'process.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(env.VITE_FIREBASE_PROJECT_ID),
        'process.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(env.VITE_FIREBASE_STORAGE_BUCKET),
        'process.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(env.VITE_FIREBASE_MESSAGING_SENDER_ID),
        'process.env.VITE_FIREBASE_APP_ID': JSON.stringify(env.VITE_FIREBASE_APP_ID),
        // Ensure correct React production build without jsxDEV in preview
        'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development'),
        global: 'globalThis'
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
          buffer: 'buffer',
          process: 'process/browser',
          stream: 'stream-browserify',
          events: 'events',
          util: path.resolve(__dirname, './src/utils/util-polyfill.js')
        }
      },
      // In productie: verwijder console-statements en debugger
      esbuild: {
        jsx: 'automatic',
        jsxDev: false,
        jsxImportSource: 'react',
        ...(isProd ? { drop: ['console', 'debugger'] } : {})
      },
      optimizeDeps: {
        include: ['buffer', 'process', 'stream-browserify', 'events'],
        exclude: ['@getbrevo/brevo']
      }
    };
});
