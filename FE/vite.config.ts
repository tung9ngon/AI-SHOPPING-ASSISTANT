import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// FE phải chạy ở port 3000 để khớp CORS + OAuth redirect của backend
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Mọi request /api sẽ được proxy sang backend NestJS ở cổng 8000.
      // Nhờ vậy cookie httpOnly hoạt động same-origin, không vướng CORS.
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
