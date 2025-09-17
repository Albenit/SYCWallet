const axios = require("axios");

async function getPrices(ids = []) {
  if (ids.length === 0) return {};

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(",")}&vs_currencies=usd`;
  const { data } = await axios.get(url);
  return data; 
}

module.exports = { getPrices };
