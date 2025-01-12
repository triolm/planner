import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/class-search/api': {
        target: 'https://bulletins.nyu.edu',
        changeOrigin: true,
        secure: false, 
        rewrite: (path) => path.replace(/^\/class-search\/api/, '/class-search/api'),
      },
    },
  },
});
