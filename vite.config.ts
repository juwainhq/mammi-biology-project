import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    // The preview runs behind a proxied host (e.g. *.e2b.app); Vite must not reject it.
    allowedHosts: true,
    cors: true,
    headers: {
      // tesseract.js workers need SharedArrayBuffer only for multi-threaded builds; the packaged
      // core we vendor is single-threaded, but these headers keep the door open and are harmless.
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless',
    },
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
  build: {
    target: 'es2020',
    sourcemap: true,
    chunkSizeWarningLimit: 1500,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
} as never);
