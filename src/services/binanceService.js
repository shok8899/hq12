const Binance = require('binance-api-node').default;
const { formatMT4Price } = require('../utils/priceFormatter');

class BinanceService {
  constructor() {
    this.client = Binance();
    this.prices = new Map();
  }

  async getSymbols() {
    try {
      const exchangeInfo = await this.client.exchangeInfo();
      return exchangeInfo.symbols
        .filter(s => s.quoteAsset === 'USDT')
        .map(s => s.symbol);
    } catch (error) {
      console.error('Error fetching symbols:', error);
      throw error;
    }
  }

  startStreams(onPrice) {
    this.getSymbols()
      .then(symbols => {
        this.client.ws.trades(symbols, trade => {
          try {
            const mt4Price = formatMT4Price(trade.symbol, trade.price, trade.quantity);
            this.prices.set(trade.symbol, mt4Price);
            onPrice(mt4Price);
          } catch (error) {
            console.error('Error processing trade:', error);
          }
        });
      })
      .catch(error => {
        console.error('Error starting Binance streams:', error);
        // Retry after 5 seconds
        setTimeout(() => this.startStreams(onPrice), 5000);
      });
  }

  getPrice(symbol) {
    return this.prices.get(symbol);
  }

  getAllPrices() {
    return Array.from(this.prices.values());
  }
}

module.exports = new BinanceService();