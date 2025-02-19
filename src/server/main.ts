import { createClerkClient } from "@clerk/backend";
import { SignedInAuthObject } from "@clerk/backend/internal";
import http from "node:http";
import internal from "node:stream";
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
    const auth: SignedInAuthObject = (ws as any).auth;
    console.log("message", message.toString(), auth.userId);
    ws.send(`pong ${index++} ${auth.userId}`);
  });
});

server.on("upgrade", async (req, socket, header) => {
  const auth = await authGuard(req, socket);
  if (auth === undefined) {
    return;
  }

  wss.handleUpgrade(req, socket, header, (ws) => {
    // the effort of globally extending the WebSocket type with the `auth` property is not worth it
    (ws as any).auth = auth;
    wss.emit("connection", ws, req);
  });
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
});

function authGuard(req: http.IncomingMessage, socket: internal.Duplex) {
  return clerkClient
    .authenticateRequest(convertIncomingMessageToRequest(req))
    .catch((err) => {
      console.error(
        `Something went wrong while authenticating the user: ${String(err)}`
      );
      respondUnauthorized(socket);
    })
    .then((client) => {
      if (client === undefined) {
        return;
      }
      if (client.isSignedIn === false) {
        return respondUnauthorized(socket);
      }
      return client.toAuth();
    })
    .catch((err) => {
      console.error(
        `Something went wrong while upgrading the connection to WebSocket: ${String(
          err
        )}`
      );
      return responseInternalServerError(socket);
    });
}

function convertIncomingMessageToRequest(req: http.IncomingMessage) {
  const { method } = req;
  const origin = `http://${req.headers.host ?? "localhost"}`;
  const fullUrl = new URL(req.url!, origin);

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined || Array.isArray(value)) {
      continue;
    }
    headers.set(key, value);
  }

  return new Request(fullUrl, {
    method,
    headers,
  });
}


function respondUnauthorized(socket: internal.Duplex) {
  socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
  socket.destroy();
}

function responseInternalServerError(socket: internal.Duplex) {
  socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
  socket.destroy();
}
