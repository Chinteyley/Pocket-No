#!/usr/bin/env bun
import http from "node:http";

const PORT = Number(process.env.VISUAL_REVIEW_PORT ?? 8787);
const reason = {
  id: "catalog-1",
  text: "That sounds like a beautiful problem for next month me.",
  copiedText: "That sounds like a beautiful problem for next month me.",
  source: "catalog",
};

const server = http.createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://127.0.0.1:${PORT}`);

  if (url.pathname === "/api/no") {
    response.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    });
    response.end(JSON.stringify(reason));
    return;
  }

  if (url.pathname === "/health") {
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end("ok");
    return;
  }

  response.writeHead(404, { "Content-Type": "text/plain" });
  response.end("not found");
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[visual-pr] fixture server listening on http://127.0.0.1:${PORT}`);
});
