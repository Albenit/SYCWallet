const axios = require("axios");
const { ethers } = require("ethers");
const CHAINS = require("../chain/config");
const ERC20_ABI = require("../abis/erc20.json");
const resolveChangeNowTicker = require("../utils/resolveChangeNowTicker");

const erc20Interface = new ethers.utils.Interface(ERC20_ABI);

const BASE_URL = (process.env.CHANGENOW_BASE_URL || "https://api.changenow.io/v2").replace(/\/$/, "");
const API_KEY = process.env.CHANGENOW_API_KEY;

function createError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function handleError(res, err, label) {
  const status = err.status || err.response?.status || 500;
  const data = err.response?.data;
  const errorCode = data?.error || err.code || "internal_error";
  const message = data?.message || err.message || "Unknown error";

  console.error(`❌ ${label}:`, data || err.message);

  res.status(status).json({
    error: errorCode,
    message,
    payload: data?.payload || null,
  });
}

function requireApiKey() {

  if (!API_KEY) {
    throw createError(500, "ChangeNOW API key is not configured");
  }
  return { "x-changenow-api-key": API_KEY };
}

function resolveChain(chainKey) {
  const chain = CHAINS[chainKey];
  if (!chain) {
    throw createError(400, `Unsupported chain: ${chainKey}`);
  }
  if (!chain.changeNowNetwork) {
    throw createError(400, `${chain.label || chainKey} is not supported by ChangeNOW`);
  }
  return chain;
}

function normalizeAsset(asset, chain) {
  if (!asset || typeof asset !== "object") {
    return {
      symbol: asset,
      decimals: chain.decimals,
      changeNowTicker: resolveChangeNowTicker(asset, chain.changeNowNetwork),
      address: null,
    };
  }

  // Try to map dynamically
  const dynamicTicker = resolveChangeNowTicker(asset.symbol, chain.changeNowNetwork);
  const hasExplicitTicker = Object.prototype.hasOwnProperty.call(asset, "changeNowTicker");
  let ticker = null;

  if (hasExplicitTicker) {
    const raw = asset.changeNowTicker;
    if (typeof raw === "string" && raw.trim().length > 0 && raw !== "null") {
      ticker = raw.toLowerCase();
    } else if (raw === null) {
      ticker = null;
    }
  }

  if (!ticker && dynamicTicker) {
    ticker = typeof dynamicTicker === "string" ? dynamicTicker.toLowerCase() : dynamicTicker;
  }

  return {
    ...asset,
    decimals: asset.decimals ?? chain.decimals,
    changeNowTicker: ticker ?? null,
  };
}

function buildDepositTx({ chain, asset, amount, payinAddress }) {
  if (!payinAddress) return null;
  const normalizedAmount = String(amount);
  const decimals = asset.decimals ?? chain.decimals ?? 18;
  let amountInUnits;
  try {
    amountInUnits = ethers.utils.parseUnits(normalizedAmount, decimals);
  } catch (_err) {
    throw createError(400, `Invalid amount for ${asset.symbol || "asset"}: ${normalizedAmount}`);
  }

  if (asset.address) {
    const data = erc20Interface.encodeFunctionData("transfer", [payinAddress, amountInUnits]);
    return {
      to: asset.address,
      data,
      value: "0x0",
      amountHex: amountInUnits.toHexString(),
      decimals,
    };
  }

  return {
    to: payinAddress,
    value: amountInUnits.toHexString(),
    amountHex: amountInUnits.toHexString(),
    decimals,
  };
}

exports.quote = async (req, res) => {
  try {
    const {
      sellAsset,
      buyAsset,
      sellAmount,
      fromChain,
      toChain,
      flow = "standard",
      type = "direct",
    } = req.body;

    if (!sellAsset || !buyAsset || !sellAmount || !fromChain || !toChain) {
      throw createError(400, "Missing params");
    }

    const fromChainCfg = resolveChain(fromChain);
    const toChainCfg = resolveChain(toChain);

    const sell = normalizeAsset(sellAsset, fromChainCfg);
    const buy = normalizeAsset(buyAsset, toChainCfg);

    if (!sell.changeNowTicker || !buy.changeNowTicker) {
      throw createError(400, "Selected assets are not supported by ChangeNOW");
    }

    const headers = requireApiKey();

    const params = {
      fromCurrency: sell.changeNowTicker,
      toCurrency: buy.changeNowTicker,
      fromAmount: String(sellAmount),
      fromNetwork: fromChainCfg.changeNowNetwork,
      toNetwork: toChainCfg.changeNowNetwork,
      flow,
      type,
    };

    const { data } = await axios.get(`${BASE_URL}/exchange/estimated-amount`, {
      params,
      headers,
    });

    res.json({
      ...data,
      params,
    });
  } catch (err) {
    handleError(res, err, "ChangeNOW Quote Error");
  }
};


exports.swap = async (req, res) => {
  try {
    const {
      sellAsset,
      buyAsset,
      sellAmount,
      sourceAddress,
      destinationAddress,
    fromChain,
    toChain,
    rateId,
      flow = "standard",
      type = "direct",
    } = req.body;

    if (!sellAsset || !buyAsset || !sellAmount || !destinationAddress || !fromChain || !toChain) {
      throw createError(400, "Missing required parameters for swap creation");
    }

    const fromChainCfg = resolveChain(fromChain);
    const toChainCfg = resolveChain(toChain);
    const sell = normalizeAsset(sellAsset, fromChainCfg);
    const buy = normalizeAsset(buyAsset, toChainCfg);

    if (!sell.changeNowTicker || !buy.changeNowTicker) {
      throw createError(400, "Selected assets are not supported by ChangeNOW");
    }

    const headers = {
      ...requireApiKey(),
      "Content-Type": "application/json",
    };

    const payload = {
      fromCurrency: sell.changeNowTicker,
      toCurrency: buy.changeNowTicker,
      fromAmount: String(sellAmount),
      fromNetwork: fromChainCfg.changeNowNetwork,
      toNetwork: toChainCfg.changeNowNetwork,
      flow,
      type,
      destinationAddress: String(destinationAddress),
      refundAddress: sourceAddress ? String(sourceAddress) : undefined,
    };

    if (rateId) {
      payload.rateId = String(rateId);
    } else if (flow === "fixed-rate") {
      throw createError(400, "ChangeNOW fixed-rate swaps require a rateId. Fetch a fresh fixed-rate quote.");
    }

    const { data } = await axios.post(`${BASE_URL}/exchange/transactions`, payload, {
      headers,
    });

    let tx = null;
    try {
      tx = buildDepositTx({
        chain: fromChainCfg,
        asset: sell,
        amount: sellAmount,
        payinAddress: data.payinAddress,
      });
    } catch (txErr) {
      console.warn("⚠️ Unable to build deposit transaction:", txErr.message);
    }

    res.json({
      ...data,
      params: payload,
      tx,
    });
  } catch (err) {
    handleError(res, err, "ChangeNOW Swap Error");
  }
};
