/**
 * Development server using Bun.serve() with HTML imports
 * Bun automatically handles bundling, transpilation, and HMR
 */

import index from "../index.html";

const PORT = 5173;
const HOST = "0.0.0.0";

Bun.serve({
  port: PORT,
  hostname: HOST,
  routes: {
    "/": index,
  },
  development: {
    hmr: true,
    console: true,
  },
});

console.info(`🦊 Frontend dev server running at http://${HOST}:${PORT}`);
