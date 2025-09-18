// chain/config.js
module.exports = {
  ethereum: {
    label: "Ethereum",
    nativeSymbol: "ETH",
    decimals: 18,
    binanceSymbol: "ETHUSDT",
    tokens: [
      {
        address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT contract on Ethereum
        symbol: "USDT",
        decimals: 6,
        binanceSymbol: "USDCUSDT", // always = 1 USD
      },
    ],
  },

  sepolia: {
    label: "Ethereum Sepolia",
    nativeSymbol: "ETH",
    decimals: 18,
    binanceSymbol: "ETHUSDT",
    tokens: [],
  },

  polygon: {
    label: "Polygon",
    nativeSymbol: "MATIC",
    decimals: 18,
    binanceSymbol: "MATICUSDT",
    tokens: [],
  },

  bsc: {
    label: "BNB Chain",
    nativeSymbol: "BNB",
    decimals: 18,
    binanceSymbol: "BNBUSDT",
    tokens: [],
  },
};
