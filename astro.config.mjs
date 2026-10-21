import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
export default defineConfig({
  integrations: [react()],
  outDir: './dist/client',
  vite: {
    server: { proxy: { '/api': 'http://127.0.0.1:8787' } },
    optimizeDeps: {
      include: ['@vapi-ai/web', '@daily-co/daily-js'],
    },
    build: {
      rollupOptions: {
        external: [],
      },
    },
    ssr: {
      noExternal: ['@vapi-ai/web', '@daily-co/daily-js'],
    },
  },
});
