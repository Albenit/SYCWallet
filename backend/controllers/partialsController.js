const CHAINS = require("../chain/config");
const resolveChangeNowTicker = require("../utils/resolveChangeNowTicker");

exports.getChains = async (req, res) => {
  try {
    const chains = Object.entries(CHAINS).map(([key, chain]) => ({
      key,
      label: chain.label,
      nativeSymbol: chain.nativeSymbol,
      decimals: chain.decimals,
      chainId: chain.chainId,
      logo: chain.logo,
      changeNowNetwork: chain.changeNowNetwork || null,
      changeNowTicker: chain.changeNowTicker || null,
    }));

    return res.json({
      success: true,
      chains
    });
  } catch (err) {
    console.error("Error in getChains:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to load chains"
    });
  }
};

exports.getChainTokens = async (req, res) => {
  try {
    const {
      chain
    } = req.params;
    const chainConfig = CHAINS[chain];

    if (!chainConfig) {
      return res.status(404).json({
        error: "chain_not_found"
      });
    }

    const mapTicker = (symbol, rawTicker) => {
      if (!chainConfig.changeNowNetwork) return null;
      if (rawTicker === null) return null;
      if (typeof rawTicker === "string" && rawTicker.trim().length > 0 && rawTicker !== "null") {
        return rawTicker.toLowerCase();
      }
      return resolveChangeNowTicker(symbol, chainConfig.changeNowNetwork);
    };

    const tokens = [
      {
        symbol: chainConfig.nativeSymbol,
        decimals: chainConfig.decimals,
        address: null,
        logo: chainConfig.logo,
        native: true,
        changeNowTicker: mapTicker(chainConfig.nativeSymbol, chainConfig.changeNowTicker),
      },
      ...chainConfig.tokens.map((token) => {
        const ticker = mapTicker(token.symbol, token.changeNowTicker);
        return {
          ...token,
          changeNowTicker: ticker,
        };
      }),
    ];

    res.json(tokens.map((token) => ({
      ...token,
      changeNowTicker: token.changeNowTicker ?? null,
      changeNowSupported: Boolean(token.changeNowTicker),
    })));
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
}