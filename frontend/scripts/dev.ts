/**
 * Development server using Bun.serve()
 * Serves the React app with hot reload support
 */

const PORT = 5173;
const HOST = "0.0.0.0";

const server = Bun.serve({
  port: PORT,
  hostname: HOST,
  async fetch(req) {
    const url = new URL(req.url);

    // Serve static files
    if (url.pathname.startsWith("/src/") || url.pathname === "/index.html") {
      const file = Bun.file(`.${url.pathname}`);
      if (await file.exists()) {
        return new Response(file);
      }
    }

    // Serve index.html for all other routes (SPA routing)
    if (url.pathname === "/" || !url.pathname.includes(".")) {
      const html = await Bun.file("./index.html").text();
      return new Response(html, {
        headers: {
          "Content-Type": "text/html",
        },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`🦊 Frontend dev server running at http://${HOST}:${PORT}`);
