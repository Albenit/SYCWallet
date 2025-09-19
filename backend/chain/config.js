// chain/config.js
module.exports = {
  ethereum: {
    label: "Ethereum",
    nativeSymbol: "ETH",
    decimals: 18,
    binanceSymbol: "ETHUSDT",
    tokens: [
      {
        address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", 
        symbol: "USDT",
        decimals: 6,
        binanceSymbol: "USDCUSDT", 
      },
    ],
  },

  sepolia: {
    label: "Ethereum Sepolia",
    nativeSymbol: "ETH",
    decimals: 18,
    binanceSymbol: "ETHUSDT",
    tokens: [
      {
        address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Test USDC
        symbol: "USDC",
        decimals: 6,
        binanceSymbol: "USDCUSDT", // maps to real USDC for pricing
      },
      {
        address: "0x68194a729C2450ad26072b3D33adC0b3b2AaA77c", // Test DAI
        symbol: "DAI",
        decimals: 18,
        binanceSymbol: "DAIUSDT",
      },
      {
        address: "0x779877A7B0D9E8603169DdbD7836e478b4624789", // Test LINK
        symbol: "LINK",
        decimals: 18,
        binanceSymbol: "LINKUSDT",
      },
    ],
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
  tokens: [
    {
      address: "0xA57ac35CE91Ee92CaEfAA8dc04140C8e232c2E50",
      symbol: "PIT",
      decimals: 9,
      binanceSymbol: "PITUSDT",
    },
  ],
},


};
