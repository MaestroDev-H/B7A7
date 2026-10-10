import http from "node:http";

const TARGET_PORT = process.env.PORT || 3000;
const PORT_5000 = 5000;

const server = http.createServer((req, res) => {
  const targetUrl = `http://localhost:${TARGET_PORT}${req.url}`;
  console.log(`[Port 5000 Redirect] Redirecting ${req.url} -> ${targetUrl}`);
  res.writeHead(302, { Location: targetUrl });
  res.end();
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.log(`[Port 5000 Redirect] Port ${PORT_5000} is already in use, skipping fallback redirect listener.`);
  } else {
    console.error(`[Port 5000 Redirect] Error:`, err.message);
  }
});

server.listen(PORT_5000, () => {
  console.log(`[Port 5000 Redirect] Listening on http://localhost:${PORT_5000} -> Redirecting to http://localhost:${TARGET_PORT}`);
});
