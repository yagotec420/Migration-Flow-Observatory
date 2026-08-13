import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/api/server.ts'],
  format: ['esm'],
  target: 'node20',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  splitting: false,
  bundle: false,
  dts: false,
});
