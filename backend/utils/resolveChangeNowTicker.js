const SPECIAL_OVERRIDES = {
  base: {
    weth: "eth",
  },
};

const UNSUPPORTED = {
  matic: new Set(["weth"]),
  avaxc: new Set(["dai", "wbtc", "wavax"]),
  zksync: new Set(["usdt", "usdc", "dai", "weth", "wbtc"]),
};

module.exports = function resolveChangeNowTicker(symbol, network) {
  if (!symbol) return null;
  const s = String(symbol).toLowerCase();
  const n = network ? String(network).toLowerCase() : null;

  if (n && UNSUPPORTED[n]?.has(s)) {
    return null;
  }

  if (n && SPECIAL_OVERRIDES[n]?.[s]) {
    return SPECIAL_OVERRIDES[n][s];
  }

  return s;
};
