import { defineConfig } from 'vite';

export default defineConfig({
  base: '/don-ib/',
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    host: true,
  },
});
