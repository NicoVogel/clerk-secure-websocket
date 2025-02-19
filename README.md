# Clerk Secure WebSocket Example

This project demonstrates how to implement secure WebSocket connections using Clerk authentication.
It includes both a client and server implementation showing how to maintain authenticated WebSocket connections.

## Prerequisites

- Node.js (v16 or higher recommended)
- A Clerk account and project (get one at [clerk.com](https://clerk.com))

## Setup

1. Clone the repository:
```bash
git clone https://github.com/NicoVogel/clerk-secure-websocket
cd clerk-secure-websocket
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your Clerk credentials:
```bash
CLERK_SECRET_KEY=your_secret_key
VITE_CLERK_PUBLISHABLE_KEY=your_publishable_key
```

## Running the Project

1. Start the server:
```bash
npm run serve:server
```

2. In a separate terminal, start the client:
```bash
npm run serve:client
```

The client will be available at `http://localhost:5173` (or the port Vite assigns).
The WebSocket server runs on `http://localhost:3000`.

## Project Structure

- `/src/client` - Browser client implementation
  - `main.ts` - Client-side WebSocket and Clerk setup
  - `index.html` - Main HTML file
- `/src/server` - Node.js server implementation
  - `main.ts` - WebSocket server with Clerk authentication

## License

MIT

