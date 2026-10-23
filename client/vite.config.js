import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Load .env files from the repo root, where the WorkOS installer put .env.local
  envDir: '..',
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5001',
    },
  },
});
