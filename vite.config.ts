/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

const isE2E = process.env['VITE_E2E'] === 'true';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      ...(isE2E
        ? {
            'convex/react': path.resolve('e2e/mocks/convex-react.ts'),
            '@convex-dev/auth/react': path.resolve(
              'e2e/mocks/convex-auth-react.ts',
            ),
          }
        : {}),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Workout Mate',
        short_name: 'WorkoutMate',
        description: 'Mobile-first workout timer app',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
      },
    }),
  ],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/types/**',
        'src/vite-env.d.ts',
        'src/main.tsx',
        'src/App.tsx',
        'src/i18n/**',
        'src/components/LanguageWatcher.tsx',
        'src/hooks/useActiveWorkout.ts',
        'src/hooks/useWorkouts.ts',
        'src/screens/**',
      ],
    },
  },
});
