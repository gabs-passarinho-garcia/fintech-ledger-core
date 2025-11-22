/**
 * Build script using Bun.build()
 * Builds the React app for production using Bun's native bundler
 * Bun automatically processes CSS imports (including Tailwind) and React/JSX
 */

// eslint-disable-next-line no-console
console.log("🔨 Building frontend with Bun bundler...");

// Build with Bun - CSS and JSX are automatically processed when imported
const result = await Bun.build({
  entrypoints: ["./src/main.tsx"],
  outdir: "./dist",
  minify: true,
  target: "browser",
  format: "esm",
  splitting: true,
  sourcemap: "external",
  // CSS is automatically bundled when imported in the code
  // React/JSX is automatically transpiled
});

if (!result.success) {
  console.error("❌ Build failed:", result.logs);
  process.exit(1);
}

// Copy index.html to dist and update script path
const indexHtml = await Bun.file("./index.html").text();
// Update script path to point to the built file
const updatedHtml = indexHtml.replace("/src/main.tsx", "/main.js");
await Bun.write("./dist/index.html", updatedHtml);

console.info("✅ Build completed successfully!");
console.info("📦 Output directory: ./dist");

// Export empty to make this a module (required for top-level await)
export {};
