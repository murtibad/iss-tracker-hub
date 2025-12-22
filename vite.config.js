import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    base: '/iss-tracker-hub/', // GitHub Pages base path
    plugins: [
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['icons/*.png', 'favicon.ico'],
            manifest: {
                name: 'ISS Tracker HUB',
                short_name: 'ISS Tracker',
                description: 'Real-time ISS tracker with 3D visualization and personalized pass predictions',
                theme_color: '#00d4ff',
                background_color: '#0B0C15',
                display: 'standalone',
                start_url: '/iss-tracker-hub/', // Match base path
                icons: [
                    {
                        src: './icons/icon-192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any maskable'
                    },
                    {
                        src: './icons/icon-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}'],
                navigateFallback: null,
                cleanupOutdatedCaches: true,
                runtimeCaching: [
                    // ISS Telemetry API (wheretheiss.at)
                    {
                        urlPattern: /^https:\/\/api\.wheretheiss\.at\/.*/,
                        handler: 'NetworkFirst',
                        options: {
                            networkTimeoutSeconds: 5,
                            cacheName: 'iss-api',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 300 // 5 minutes
                            }
                        }
                    },
                    // Geocoding API (Nominatim)
                    {
                        urlPattern: /^https:\/\/nominatim\.openstreetmap\.org\/.*/,
                        handler: 'NetworkFirst',
                        options: {
                            networkTimeoutSeconds: 5,
                            cacheName: 'geocoding-api',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 86400 // 24 hours
                            }
                        }
                    }
                ]
            },
            devOptions: {
                enabled: false // SW only in production build
            }
        })
    ],
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
