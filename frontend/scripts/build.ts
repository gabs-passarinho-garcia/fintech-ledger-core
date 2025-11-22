/**
 * Build script using Bun.build()
 * Builds the React app for production
 */

import { $ } from 'bun';

console.log('🔨 Building frontend...');

// Build with Bun
const result = await Bun.build({
  entrypoints: ['./src/main.tsx'],
  outdir: './dist',
  minify: true,
  target: 'browser',
  format: 'esm',
  splitting: true,
  sourcemap: 'external',
});

if (!result.success) {
  console.error('❌ Build failed:', result.logs);
  process.exit(1);
}

// Copy index.html to dist
await $`cp index.html dist/`;

// Copy any static assets if needed
// await $`cp -r public dist/ 2>/dev/null || true`;

console.log('✅ Build completed successfully!');
console.log('📦 Output directory: ./dist');

