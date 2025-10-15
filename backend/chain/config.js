module.exports = {
  ethereum: {
    label: "Ethereum",
    nativeSymbol: "ETH",
    decimals: 18,
    chainId: 1,
    binanceSymbol: "ETHUSDT",
    logo: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    tokens: [
      { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT", binanceSymbol: "USDTUSDC", decimals: 6, logo: "https://assets.coingecko.com/coins/images/325/large/Tether.png" },
      { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", symbol: "USDC", binanceSymbol: "USDCUSDT", decimals: 6, logo: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png" },
      { address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", symbol: "DAI", binanceSymbol: "DAIUSDT", decimals: 18, logo: "https://assets.coingecko.com/coins/images/9956/large/4943.png" },
      { address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", symbol: "WETH", binanceSymbol: "ETHUSDT", decimals: 18, logo: "https://assets.coingecko.com/coins/images/2518/large/weth.png" },
      { address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", symbol: "WBTC", binanceSymbol: "BTCUSDT", decimals: 8, logo: "https://assets.coingecko.com/coins/images/7598/large/wrapped_bitcoin_wbtc.png" },
    ],
  },

  sepolia: {
    label: "Sepolia",
    nativeSymbol: "ETH",
    decimals: 18,
    chainId: 11155111,
    binanceSymbol: "ETHUSDT",
    logo: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    tokens: [
      { address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", symbol: "USDC", decimals: 6, binanceSymbol: "USDCUSDT", logo: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png" },
      { address: "0x68194a729C2450ad26072b3D33adC0b3b2AaA77c", symbol: "DAI", decimals: 18, binanceSymbol: "DAIUSDT", logo: "https://assets.coingecko.com/coins/images/9956/large/4943.png" },
      { address: "0x779877A7B0D9E8603169DdbD7836e478b4624789", symbol: "LINK", decimals: 18, binanceSymbol: "LINKUSDT", logo: "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png" },
      { address: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F", symbol: "USDT", decimals: 6, binanceSymbol: "USDTUSDT", logo: "https://assets.coingecko.com/coins/images/325/large/Tether.png" },
    ],
  },

  polygon: {
    label: "Polygon",
    nativeSymbol: "MATIC",
    decimals: 18,
    chainId: 137,
    binanceSymbol: "MATICUSDT",
    logo: "https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png",
    tokens: [
      { address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", symbol: "USDC", binanceSymbol: "USDCUSDT", decimals: 6, logo: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png" },
      { address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", symbol: "DAI", binanceSymbol: "DAIUSDT", decimals: 18, logo: "https://assets.coingecko.com/coins/images/9956/large/4943.png" },
      { address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", symbol: "WETH", binanceSymbol: "ETHUSDT", decimals: 18, logo: "https://assets.coingecko.com/coins/images/2518/large/weth.png" },
      { address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6", symbol: "WBTC", binanceSymbol: "BTCUSDT", decimals: 8, logo: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png" },
    ],
  },

  bsc: {
    label: "BNB Chain",
    nativeSymbol: "BNB",
    decimals: 18,
    chainId: 56,
    binanceSymbol: "BNBUSDT",
    logo: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
    tokens: [
      { address: "0x55d398326f99059fF775485246999027B3197955", symbol: "USDT", binanceSymbol: "USDCUSDT", decimals: 18, logo: "https://assets.coingecko.com/coins/images/325/large/Tether.png" },
      { address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", symbol: "USDC", binanceSymbol: "USDCUSDT", decimals: 18, logo: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png" },
      { address: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3", symbol: "DAI", binanceSymbol: "DAIUSDT", decimals: 18, logo: "https://assets.coingecko.com/coins/images/9956/large/4943.png" },
      { address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", symbol: "ETH", binanceSymbol: "ETHUSDT", decimals: 18, logo: "https://assets.coingecko.com/coins/images/279/large/ethereum.png" },
    ],
  },

  arbitrum: {
    label: "Arbitrum",
    nativeSymbol: "ETH",
    decimals: 18,
    chainId: 42161,
    binanceSymbol: "ETHUSDT",
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/info/logo.png",
    tokens: [
      { address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", symbol: "USDT", binanceSymbol: "USDCUSDT", decimals: 6, logo: "https://assets.coingecko.com/coins/images/325/large/Tether.png" },
      { address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", symbol: "USDC", binanceSymbol: "USDCUSDT", decimals: 6, logo: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png" },
      { address: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1", symbol: "DAI", binanceSymbol: "DAIUSDT", decimals: 18, logo: "https://assets.coingecko.com/coins/images/9956/large/4943.png" },
      { address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", symbol: "WETH", binanceSymbol: "ETHUSDT", decimals: 18, logo: "https://assets.coingecko.com/coins/images/2518/large/weth.png" },
    ],
  },

  avalanche: {
    label: "Avalanche",
    nativeSymbol: "AVAX",
    decimals: 18,
    chainId: 43114,
    binanceSymbol: "AVAXUSDT",
    logo: "https://assets.coingecko.com/coins/images/12559/large/coin-round-red.png",
    tokens: [
      { address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", symbol: "USDC", binanceSymbol: "USDCUSDT", decimals: 6, logo: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png" },
      { address: "0xa7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664", symbol: "USDT", binanceSymbol: "USDCUSDT", decimals: 6, logo: "https://assets.coingecko.com/coins/images/325/large/Tether.png" },
      { address: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70", symbol: "DAI", binanceSymbol: "DAIUSDT", decimals: 18, logo: "https://assets.coingecko.com/coins/images/9956/large/4943.png" },
      { address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", symbol: "WAVAX", binanceSymbol: "AVAXUSDT", decimals: 18, logo: "https://assets.coingecko.com/coins/images/12559/large/coin-round-red.png" },
    ],
  },

  base: {
    label: "Base",
    nativeSymbol: "ETH",
    decimals: 18,
    chainId: 8453,
    binanceSymbol: "ETHUSDT",
    logo: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    tokens: [
      { address: "0x833589fCD6EDb6E08f4c7C32D4f71b54bdA02913", symbol: "USDC", binanceSymbol: "USDCUSDT", decimals: 6, logo: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png" },
      { address: "0x4200000000000000000000000000000000000006", symbol: "WETH", binanceSymbol: "ETHUSDT", decimals: 18, logo: "https://assets.coingecko.com/coins/images/2518/large/weth.png" },
    ],
  },

  zksync: {
    label: "zkSync Era",
    nativeSymbol: "ETH",
    decimals: 18,
    chainId: 324,
    binanceSymbol: "ETHUSDT",
    logo: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    tokens: [
      { address: "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4", symbol: "USDC", binanceSymbol: "USDCUSDT", decimals: 6, logo: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png" },
      { address: "0x493257fD37EDb34451f62EDf8D2a0C418852bA4C", symbol: "USDT", binanceSymbol: "USDCUSDT", decimals: 6, logo: "https://assets.coingecko.com/coins/images/325/large/Tether.png" },
      { address: "0x5AEA5775959fBC2557Cc8789bC1bf90A239D9a91", symbol: "WETH", binanceSymbol: "ETHUSDT", decimals: 18, logo: "https://assets.coingecko.com/coins/images/2518/large/weth.png" },
    ],
  },
};
