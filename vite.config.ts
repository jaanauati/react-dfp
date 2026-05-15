import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { externalizeDeps } from 'vite-plugin-externalize-deps'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), externalizeDeps()],
  build: {
    outDir: 'lib',
    sourcemap: true,
    target: 'es2025',
    lib: {
        entry: 'js/index.js',
        formats: ['es', 'cjs'],
    },
  },
});