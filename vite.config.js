import { defineConfig } from 'vite'

export default defineConfig({
    base: './', // GitHub Pages için relative paths
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        minify: 'esbuild',
    },
    server: {
        port: 5173,
        host: true,
    }
})
