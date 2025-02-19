import { Clerk } from "@clerk/clerk-js";

declare global {
  var wsConnection: WebSocket | undefined;
}

setupBackendTest();
setupClerk();
setupWebSocketTest();
setupWebsocketReset();

function setupBackendTest() {
  const backendTestDiv = document.getElementById("backend-test")!;
  backendTestDiv.innerHTML = `<button id="test-button">Test Backend</button><div id="test-result"></div>`;

  const testButton = document.getElementById("test-button")!;
  testButton.addEventListener("click", async () => {
    const response = await fetch("http://localhost:3000");
    const data = await response.text();
    const testResultDiv = document.getElementById("test-result")!;
    testResultDiv.innerHTML = data;
  });
}

async function setupClerk() {
  const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  if (!clerkPubKey) {
    throw new Error("Add your VITE_CLERK_PUBLISHABLE_KEY to the .env file");
  }

  const clerk = new Clerk(clerkPubKey);
  await clerk.load();

  if (clerk.user) {
    document.getElementById("login")!.innerHTML = `
    <div id="user-button"></div>
  `;

    const userButtonDiv = document.getElementById(
      "user-button"
    )! as HTMLDivElement;
    clerk.mountUserButton(userButtonDiv);
  } else {
    document.getElementById("login")!.innerHTML = `
    <div id="sign-in"></div>
  `;

    const signInDiv = document.getElementById("sign-in")! as HTMLDivElement;
    clerk.mountSignIn(signInDiv);
  }
}

function setupWebSocketTest() {
  if (globalThis.wsConnection) {
    globalThis.wsConnection.close();
  }

  const ws = new WebSocket("ws://localhost:3000");
  const websocketTestDiv = document.getElementById("websocket-test")!;
  websocketTestDiv.innerHTML = `<button id="send-button">Send Ping</button><div id="test-result"></div><div id="test-status">Connecting...</div>`;

  const sendButton = document.getElementById("send-button")! as HTMLButtonElement;

  sendButton.addEventListener("click", () => {
    ws.send("ping");
  });

  ws.onmessage = (event) => {
    const testResultDiv = document.getElementById("test-result")!;
    testResultDiv.innerHTML = event.data;
  };
  const testStatusDiv = document.getElementById("test-status")!;

  ws.onopen = () => {
    testStatusDiv.innerHTML = "Connected to server";
  };

  ws.onclose = () => {
    testStatusDiv.innerHTML = "Disconnected from server";
  };

  ws.onerror = (event) => {
    testStatusDiv.innerHTML = `Error: ${String(event)}`;
  };

  globalThis.wsConnection = ws;
}

function setupWebsocketReset() {
  const resetButton = document.getElementById("reset-websocket")! as HTMLButtonElement;
  resetButton.addEventListener("click", () => {
    setupWebSocketTest();
  });
}
