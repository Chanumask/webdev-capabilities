// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  devToolbar: { enabled: false },
  vite: { build: { chunkSizeWarningLimit: 4000 } },
});
