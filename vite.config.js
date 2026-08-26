import { defineConfig } from 'vite';

export default defineConfig({
  // If you deploy to GitHub Pages under a subpath, set this to '/<repo-name>/'.
  // For Netlify / Vercel / a custom domain, leave it as '/'.
  base: '/',

  server: {
    host: true, // lets you open the dev server on your phone via your local IP
    // 5173 unless something assigns a PORT — that lets a second dev server
    // run alongside the first instead of colliding with it.
    port: Number(process.env.PORT) || 5173,
  },

  build: {
    outDir: 'dist',
    // Set to true while you are learning to inspect the bundled output.
    sourcemap: false,
  },
});
