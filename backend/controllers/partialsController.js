const CHAINS = require("../chain/config");

exports.getChains = async (req, res) => {
  try {
    const chains = Object.entries(CHAINS).map(([key, chain]) => ({
      key,
      label: chain.label,
      nativeSymbol: chain.nativeSymbol,
      decimals: chain.decimals,
      chainId: chain.chainId,
      logo: chain.logo,
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

    const tokens = [{
        symbol: chainConfig.nativeSymbol,
        decimals: chainConfig.decimals,
        address: null,
        logo: chainConfig.logo,
        native: true,
      },
      ...chainConfig.tokens,
    ];

    res.json(tokens);
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
}