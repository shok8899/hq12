const express = require('express');
const binanceService = require('./src/services/binanceService');
const websocketService = require('./src/services/websocketService');
const apiRoutes = require('./src/routes/api');

const app = express();
app.use(express.json());
app.use('/', apiRoutes);

async function startServer() {
  try {
    // Initialize WebSocket server
    await websocketService.init(8001);

    // Start Binance streams
    binanceService.startStreams((price) => {
      websocketService.broadcast(price);
    });

    // Start HTTP server
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`HTTP server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();