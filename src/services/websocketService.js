const WebSocket = require('ws');

class WebSocketService {
  constructor() {
    this.wss = null;
  }

  init(port) {
    return new Promise((resolve, reject) => {
      try {
        this.wss = new WebSocket.Server({ port }, () => {
          console.log(`WebSocket server running on port ${port}`);
          resolve();
        });

        this.wss.on('error', (error) => {
          console.error('WebSocket server error:', error);
          reject(error);
        });

        this.setupConnectionHandler();
      } catch (error) {
        console.error('Error initializing WebSocket server:', error);
        reject(error);
      }
    });
  }

  setupConnectionHandler() {
    this.wss.on('connection', (ws) => {
      console.log('MT4 client connected');

      ws.on('error', (error) => {
        console.error('WebSocket client error:', error);
      });

      ws.on('close', () => {
        console.log('MT4 client disconnected');
      });
    });
  }

  broadcast(data) {
    if (!this.wss) return;

    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(JSON.stringify(data));
        } catch (error) {
          console.error('Error broadcasting to client:', error);
        }
      }
    });
  }
}

module.exports = new WebSocketService();