import { defineConfig } from 'vite';

export default defineConfig({
  // '/' suits Netlify, Vercel and custom domains. Deploying to GitHub Pages
  // under a subpath would need '/<repo-name>/' instead.
  base: '/',

  server: {
    host: true, // lets the dev server be opened on a phone via the local IP
    port: Number(process.env.PORT) || 5173,
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
