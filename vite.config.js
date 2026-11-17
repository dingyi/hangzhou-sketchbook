import { defineConfig } from 'vite';

export default defineConfig({
  server: { allowedHosts: ['.onamp.dev'] },
  preview: { allowedHosts: ['.onamp.dev'] },
});