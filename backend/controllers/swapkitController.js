const axios = require("axios");

function buildAssetId(chainKey, token) {
  const prefixMap = {
    ethereum: "ETH",
    polygon: "POL",
    bsc: "BSC",
    avalanche: "AVAX",
    arbitrum: "ARB",
    base: "BASE",
    zksync: "ZKSYNC",
  };
  const prefix = prefixMap[chainKey?.toLowerCase()] || chainKey?.toUpperCase() || "ETH";
  if (!token?.address) return `${prefix}.${token?.symbol?.toUpperCase()}`;
  return `${prefix}.${token?.symbol?.toUpperCase()}-${token.address}`;
}

function getBase() {
  const base = process.env.SWAPKIT_BASE_URL || "https://api.swapkit.dev";
  return base.replace(/\/$/, "");
}

function getHeaders() {
  const key = process.env.SWAPKIT_API_KEY;
  const headers = { "Content-Type": "application/json" };
  if (key) headers["x-api-key"] = key;
  return headers;
}

exports.quote = async (req, res) => {
  try {
    const base = getBase();
    const url = `${base}${process.env.SWAPKIT_QUOTE_PATH || "/quote"}`;

    let {
      sellAsset,
      buyAsset,
      sellAmount,
      sourceAddress,
      destinationAddress,
      slippage = 1,
      includeTx = false,
      fromChain,
      toChain,
    } = req.body;

    if (!fromChain && req.body.sellAsset?.chain) fromChain = req.body.sellAsset.chain;
    if (!toChain && req.body.buyAsset?.chain) toChain = req.body.buyAsset.chain;

    if (typeof sellAsset === "object") {
      sellAsset = buildAssetId(fromChain || "ethereum", sellAsset);
    }
    if (typeof buyAsset === "object") {
      buyAsset = buildAssetId(toChain || "ethereum", buyAsset);
    }

    if (!sellAsset || !buyAsset || !sellAmount || !sourceAddress || !destinationAddress) {
      return res.status(400).json({
        error:
          "Missing required parameters: sellAsset, buyAsset, sellAmount, sourceAddress, destinationAddress",
      });
    }

    const payload = {
      sellAsset: String(sellAsset),
      buyAsset: String(buyAsset),
      sellAmount: String(sellAmount),
      sourceAddress: String(sourceAddress),
      destinationAddress: String(destinationAddress),
      slippage: Number(slippage),
      includeTx: Boolean(includeTx),
    };


    const { data } = await axios.post(url, payload, { headers: getHeaders() });

    res.json(data);
  } catch (err) {
    console.error("❌ SwapKit Quote Error:", err.response?.data || err.message);
    res
      .status(err.response?.status || 500)
      .json({ error: err.response?.data || err.message });
  }
};

exports.swap = async (req, res) => {
  try {
  const base = getBase();
  const url = `${base}${process.env.SWAPKIT_QUOTE_PATH || "/quote"}`;

    let {
      sellAsset,
      buyAsset,
      sellAmount,
      sourceAddress,
      destinationAddress,
      slippage = 1,
      includeTx = true,
      fromChain,
      toChain,
      routeIndex = 0,
      routeTag,
    } = req.body;

    if (!fromChain && req.body.sellAsset?.chain) fromChain = req.body.sellAsset.chain;
    if (!toChain && req.body.buyAsset?.chain) toChain = req.body.buyAsset.chain;

    if (typeof sellAsset === "object") {
      sellAsset = buildAssetId(fromChain || "ethereum", sellAsset);
    }
    if (typeof buyAsset === "object") {
      buyAsset = buildAssetId(toChain || "ethereum", buyAsset);
    }

    if (!sellAsset || !buyAsset || !sellAmount || !sourceAddress || !destinationAddress) {
      return res.status(400).json({
        error:
          "Missing required parameters: sellAsset, buyAsset, sellAmount, sourceAddress, destinationAddress",
      });
    }

    const payload = {
      sellAsset: String(sellAsset),
      buyAsset: String(buyAsset),
      sellAmount: String(sellAmount),
      sourceAddress: String(sourceAddress),
      destinationAddress: String(destinationAddress),
      slippage: Number(slippage),
      includeTx: true,
    };

    if (req.body?.quoteId) {
      payload.quoteId = String(req.body.quoteId);
    }

    const { data } = await axios.post(url, payload, { headers: getHeaders() });

    const routes = Array.isArray(data?.routes) ? data.routes : [];
    let selectedRoute = null;

    if (routeTag) {
      selectedRoute = routes.find((route) => route?.meta?.tags?.includes(routeTag));
    }
    if (!selectedRoute) {
      const index = Number(routeIndex);
      if (Number.isFinite(index) && index >= 0 && routes[index]) {
        selectedRoute = routes[index];
      }
    }
    if (!selectedRoute) {
      selectedRoute = routes[0];
    }

    if (!selectedRoute) {
      return res.status(502).json({ error: "SwapKit did not return any executable route" });
    }

    if (!selectedRoute.tx) {
      return res
        .status(502)
        .json({ error: "SwapKit did not provide transaction data for the selected route" });
    }

    const responsePayload = {
      quoteId: data?.quoteId,
      route: selectedRoute,
      tx: selectedRoute.tx,
    };

    console.log("✅ SwapKit swap prepared:", JSON.stringify(responsePayload, null, 2));
    res.json(responsePayload);
  } catch (err) {
    console.error("❌ SwapKit Swap Error:", err.response?.data || err.message);
    res
      .status(err.response?.status || 500)
      .json({ error: err.response?.data || err.message });
  }
};
