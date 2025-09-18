const axios = require("axios");

async function getPrices(symbols = []) {
  if (symbols.length === 0) return {};

  const url = "https://api.binance.com/api/v3/ticker/price";
  const { data } = await axios.get(url);

  const priceMap = {};
  for (const sym of symbols) {
    const ticker = data.find((t) => t.symbol === sym.toUpperCase());
    if (ticker) {
      priceMap[sym.toUpperCase()] = parseFloat(ticker.price);
    }
  }

  return priceMap;
}

module.exports = { getPrices };
