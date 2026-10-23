import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  // @fixtures: the sample data, for tests only (never served by the portal).
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)), '@fixtures': fileURLToPath(new URL('./tests/fixtures', import.meta.url)) } },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    css: false,
  },
});
