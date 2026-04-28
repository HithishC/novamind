// server/index.js
const WebSocket = require('ws');
const http = require('http');

const port = process.env.PORT || 4000;
const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  ws.on('message', (message) => {
    // For now, just echo back the received data (could be audio chunks)
    ws.send(message);
  });
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

server.listen(port, () => {
  console.log(`WebSocket server listening on ws://localhost:${port}`);
});
