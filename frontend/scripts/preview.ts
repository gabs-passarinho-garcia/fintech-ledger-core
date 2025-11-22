/**
 * Preview server for production build
 * Serves the built files from dist/
 */

const PORT = 4173;
const HOST = '0.0.0.0';

const server = Bun.serve({
  port: PORT,
  hostname: HOST,
  async fetch(req) {
    const url = new URL(req.url);
    const pathname = url.pathname === '/' ? '/index.html' : url.pathname;

    // Try to serve from dist/
    const file = Bun.file(`./dist${pathname}`);
    if (await file.exists()) {
      return new Response(file);
    }

    // Fallback to index.html for SPA routing
    const html = await Bun.file('./dist/index.html').text();
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  },
});

console.log(`🚀 Preview server running at http://${HOST}:${PORT}`);
console.log('📦 Serving files from ./dist');

