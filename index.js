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
  console.log('Connection url: %s', req.url);

  const app = (new URLSearchParams(req.url.replace(/^\/|\/$/g, ''))).get('app');

  if (app === null) {
    ws.terminate();
  } else {
    ws.app = app;
    clients.set(ws, app);
  }

  ws.on('error', console.error);

  ws.on('message', (rawData) => {
    if (!isJsonString(rawData)) return;

    const data = JSON.parse(rawData);

    clients.forEach((app, client) => {
      if (app === data.app && client.readyState === WebSocket.OPEN) {
        client.send(data.payload);
      }
    });
  });
});

console.log('Echo to the world!')
