const { WebSocket, WebSocketServer } = require('ws');

const PORT = process.env.PORT || 1337;
const wss = new WebSocketServer({ port: PORT });
const clients = new Map();

const isJsonString = (str) => {
  try {
      JSON.parse(str);
  } catch (e) {
      return false;
  }
  return true;
}

wss.on('connection', (ws, req) => {
  const app = (new URLSearchParams(req.url.replace(/^\/|\/$/g, ''))).get('app');

  if (app === null) {
    console.log('Invalid client connection');
    ws.terminate();
  } else {
    console.log('Client connected to %s', app);
    ws.app = app;
    clients.set(ws, app);
  }

  ws.on('error', console.error);

  ws.on('message', (data, isBinary) => {
    const message = isBinary ? data : data.toString();
    if (!isJsonString(message)) return;

    const json = JSON.parse(message);
    clients.forEach((app, client) => {
      if (app === json.app && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(json.payload));
      }
    });
  });
});

console.log('Echo to the world!')
