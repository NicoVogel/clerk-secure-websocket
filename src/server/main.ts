import http from "node:http";
import { WebSocketServer } from "ws";

const server = http.createServer((req, res) => {
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle OPTIONS request for CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("hello world");
});

const wss = new WebSocketServer({
  noServer: true,
});

wss.on("connection", (ws, req) => {
  console.log("connection");
  let index = 0;
  ws.on("message", (message) => {
    console.log("message", message);
    ws.send(`pong ${index++}`);
  });
});

server.on("upgrade", (req, socket, header) => {
  wss.handleUpgrade(req, socket, header, (ws) => {
    wss.emit("connection", ws, req);
  })
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
