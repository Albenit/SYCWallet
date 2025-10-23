const { ethers } = require("ethers");
const { getProvider } = require("../chain/providers");
const ERC20_ABIS = require("../abis/erc20.json");
const CHAINS = require("../chain/config");

const ZERO_BN = ethers.BigNumber.from(0);
const FALLBACK_BASE_FEE_GWEI = "3"; // gentle default for base fee when RPC omits it
const FALLBACK_PRIORITY_FEE_GWEI = "1.5"; // mild priority fee similar to MetaMask defaults

const parseGwei = (value) => ethers.utils.parseUnits(String(value ?? "0"), "gwei");
const formatEther = (value) => ethers.utils.formatEther(value);
const formatGwei = (value) => ethers.utils.formatUnits(value, "gwei");

const normalizeErrorPayload = (err, fallbackMessage = "Request failed") => {
  const rpcError = err?.error || err;
  const message = rpcError?.reason || rpcError?.message || fallbackMessage;
  const code = rpcError?.code || rpcError?.data?.code || rpcError?.error?.code || null;
  return { code, message };
};

const buildErrorResponse = ({
  status = 400,
  code,
  message,
  details = {},
}) => ({ status, body: { error: { code, message, ...details } } });

async function buildGasProfile({
  provider,
  chainCfg,
  txRequest,
  from,
  valueWei,
  bufferBps = 1000, // 10% buffer by default
}) {
  const estimated = await provider.estimateGas(txRequest);
  const bufferedGasLimit = estimated.mul(10000 + bufferBps).div(10000);

  const feeData = await provider.getFeeData();

  const fallbackPriority = parseGwei(chainCfg?.fallbackPriorityFeeGwei ?? FALLBACK_PRIORITY_FEE_GWEI);
  const fallbackBase = parseGwei(chainCfg?.fallbackBaseFeeGwei ?? FALLBACK_BASE_FEE_GWEI);

  let priorityFee =
    feeData.maxPriorityFeePerGas !== null && feeData.maxPriorityFeePerGas !== undefined
      ? ethers.BigNumber.from(feeData.maxPriorityFeePerGas)
      : null;

  let baseFee =
    feeData.lastBaseFeePerGas !== null && feeData.lastBaseFeePerGas !== undefined
      ? ethers.BigNumber.from(feeData.lastBaseFeePerGas)
      : null;

  const gasPrice =
    feeData.gasPrice !== null && feeData.gasPrice !== undefined
      ? ethers.BigNumber.from(feeData.gasPrice)
      : null;

  // Legacy chains (no EIP-1559) expose only gasPrice; treat entire value as base fee without priority tip
  if (!priorityFee && !feeData.maxFeePerGas && gasPrice && !baseFee) {
    priorityFee = ZERO_BN;
    baseFee = gasPrice;
  }

  if (!priorityFee) {
    priorityFee = fallbackPriority;
  }

  if (!baseFee) {
    if (feeData.maxFeePerGas) {
      const maxFeeCandidate = ethers.BigNumber.from(feeData.maxFeePerGas);
      baseFee = maxFeeCandidate.sub(priorityFee);
      if (baseFee.lt(ZERO_BN)) baseFee = maxFeeCandidate;
    } else if (gasPrice) {
      baseFee = gasPrice.gte(priorityFee) ? gasPrice.sub(priorityFee) : gasPrice;
    } else {
      baseFee = fallbackBase;
    }
  }

  if (baseFee.lt(ZERO_BN)) baseFee = fallbackBase;

  let maxFeePerGas;
  if (feeData.maxFeePerGas) {
    maxFeePerGas = ethers.BigNumber.from(feeData.maxFeePerGas);
  } else if (gasPrice) {
    maxFeePerGas = gasPrice;
  } else {
    // MetaMask heuristic: maxFee = baseFee * 2 + priority tip
    maxFeePerGas = baseFee.mul(2).add(priorityFee);
  }

  // Ensure max fee is at least estimated fee per gas
  const estimatedFeePerGas = baseFee.add(priorityFee);
  if (maxFeePerGas.lt(estimatedFeePerGas)) {
    maxFeePerGas = estimatedFeePerGas;
  }

  const estimatedFeeWei = bufferedGasLimit.mul(estimatedFeePerGas);
  const worstCaseFeeWei = bufferedGasLimit.mul(maxFeePerGas);

  const nativeBalance = await provider.getBalance(from);
  const totalEstimatedCost = valueWei.add(estimatedFeeWei);
  const totalWorstCaseCost = valueWei.add(worstCaseFeeWei);

  const hasEnoughForEstimated = nativeBalance.gte(totalEstimatedCost);
  const hasEnoughForWorstCase = nativeBalance.gte(totalWorstCaseCost);

  const shortfallEstimated = hasEnoughForEstimated ? ZERO_BN : totalEstimatedCost.sub(nativeBalance);
  const shortfallWorst = hasEnoughForWorstCase ? ZERO_BN : totalWorstCaseCost.sub(nativeBalance);

  const spendableAfterEstimated = hasEnoughForEstimated ? nativeBalance.sub(estimatedFeeWei) : ZERO_BN;

  return {
    gasLimit: bufferedGasLimit,
    estimatedFeeWei,
    worstCaseFeeWei,
    baseFeePerGas: baseFee,
    priorityFeePerGas: priorityFee,
    maxFeePerGas,
    estimatedFeePerGas,
    nativeBalance,
    totalEstimatedCost,
    totalWorstCaseCost,
    hasEnoughForEstimated,
    hasEnoughForWorstCase,
    shortfallEstimated,
    shortfallWorst,
    spendableAfterEstimated,
  };
}

const formatGasProfile = ({
  profile,
  chainCfg,
  valueWei,
}) => {
  const symbol = chainCfg.nativeSymbol;
  const response = {
    symbol,
    gasLimit: profile.gasLimit.toString(),
    gasLimitHex: ethers.utils.hexlify(profile.gasLimit),
    estimatedFeeWei: profile.estimatedFeeWei.toString(),
    estimatedFeeNative: formatEther(profile.estimatedFeeWei),
    estimatedFeeFormatted: `${formatEther(profile.estimatedFeeWei)} ${symbol}`,
    maxFeeWei: profile.worstCaseFeeWei.toString(),
    maxFeeNative: formatEther(profile.worstCaseFeeWei),
    maxFeeFormatted: `${formatEther(profile.worstCaseFeeWei)} ${symbol}`,
    estimatedFeePerGasGwei: formatGwei(profile.estimatedFeePerGas),
    baseFeePerGasGwei: formatGwei(profile.baseFeePerGas),
    maxFeePerGasGwei: formatGwei(profile.maxFeePerGas),
    maxPriorityFeePerGasGwei: formatGwei(profile.priorityFeePerGas),
    nativeBalanceWei: profile.nativeBalance.toString(),
    nativeBalance: formatEther(profile.nativeBalance),
    totalEstimatedCostWei: profile.totalEstimatedCost.toString(),
    totalEstimatedCost: formatEther(profile.totalEstimatedCost),
    totalWorstCaseCostWei: profile.totalWorstCaseCost.toString(),
    totalWorstCaseCost: formatEther(profile.totalWorstCaseCost),
    hasEnoughForEstimated: profile.hasEnoughForEstimated,
    hasEnoughForWorstCase: profile.hasEnoughForWorstCase,
    shortfallEstimatedWei: profile.shortfallEstimated.toString(),
    shortfallEstimated: formatEther(profile.shortfallEstimated),
    shortfallWorstWei: profile.shortfallWorst.toString(),
    shortfallWorst: formatEther(profile.shortfallWorst),
    spendableAfterEstimatedWei: profile.spendableAfterEstimated.toString(),
    spendableAfterEstimated: formatEther(profile.spendableAfterEstimated),
    requestedValueWei: valueWei.toString(),
    requestedValue: formatEther(valueWei),
  };

  if (profile.hasEnoughForEstimated && !profile.hasEnoughForWorstCase) {
    response.warning = {
      code: "LOW_GAS_BUFFER",
      message: `Balance covers the estimated fee but not the worst-case buffer. Leave at least ${response.shortfallWorst} ${symbol} extra to avoid failures if base fees spike before confirmation.`,
    };
  }

  return response;
};

const handleInsufficientFunds = ({ chainCfg, profile }) => {
  return buildErrorResponse({
    code: "INSUFFICIENT_NATIVE_BALANCE",
    message: `Not enough ${chainCfg.nativeSymbol} to cover the transaction amount plus estimated gas.`,
    details: {
      required: formatEther(profile.totalEstimatedCost),
      available: formatEther(profile.nativeBalance),
      shortfall: formatEther(profile.shortfallEstimated),
    },
  });
};

// ---------------- SEND TRANSACTION ---------------- //
exports.sendTransaction = async (req, res) => {
  try {
    const { signedTx } = req.body;
    const { chain } = req.params;

    const provider = getProvider(chain);
    const parsed = ethers.utils.parseTransaction(signedTx);
    const chainCfg = CHAINS[chain];
    if (!chainCfg) {
      const { status, body } = buildErrorResponse({
        status: 400,
        code: "UNSUPPORTED_CHAIN",
        message: `Unsupported chain: ${chain}`,
      });
      return res.status(status).json(body);
    }

    const senderBalance = await provider.getBalance(parsed.from);
    const gasLimit = parsed.gasLimit ? ethers.BigNumber.from(parsed.gasLimit) : ZERO_BN;

    const perGas = parsed.maxFeePerGas
      ? ethers.BigNumber.from(parsed.maxFeePerGas)
      : parsed.gasPrice
      ? ethers.BigNumber.from(parsed.gasPrice)
      : ZERO_BN;

    const worstCaseFee = gasLimit.mul(perGas);
    const totalWorstCaseCost = parsed.value.add(worstCaseFee);

    if (senderBalance.lt(totalWorstCaseCost)) {
      const shortfall = totalWorstCaseCost.sub(senderBalance);
      const { status, body } = buildErrorResponse({
        code: "INSUFFICIENT_NATIVE_BALANCE",
        message: `Sender balance is too low to cover the transaction value plus worst-case gas cost.`,
        details: {
          required: formatEther(totalWorstCaseCost),
          available: formatEther(senderBalance),
          shortfall: formatEther(shortfall),
        },
      });
      return res.status(status).json(body);
    }

    try {
      // Quick sanity check: simulate call to catch reverts before broadcasting
      const callRequest = {
        from: parsed.from,
        to: parsed.to,
        data: parsed.data,
        value: parsed.value,
      };
      if (!gasLimit.isZero()) {
        callRequest.gasLimit = gasLimit;
      }
      await provider.call(callRequest);
    } catch (callErr) {
      const normalized = normalizeErrorPayload(callErr, "Transaction simulation failed");
      const { status, body } = buildErrorResponse({
        code: normalized.code || "GAS_SIMULATION_FAILED",
        message: normalized.message,
      });
      return res.status(status).json(body);
    }

    const txResponse = await provider.sendTransaction(signedTx);

    res.json({ hash: txResponse.hash });
  } catch (err) {
    console.error("Send TX error:", err);
    const normalized = normalizeErrorPayload(err, "Transaction broadcast failed");
    let code = normalized.code || "RPC_ERROR";
    const lower = normalized.message.toLowerCase();

    if (
      lower.includes("insufficient funds") ||
      lower.includes("balance too low")
    ) {
      code = "INSUFFICIENT_NATIVE_BALANCE";
    } else if (
      lower.includes("replacement transaction underpriced") ||
      lower.includes("nonce too low") ||
      lower.includes("already known")
    ) {
      code = "PENDING_TRANSACTION";
    }

    res.status(400).json({
      error: {
        code,
        message: normalized.message,
      },
    });
  }
};

// ---------------- ESTIMATE GAS ---------------- //
exports.estimateGas = async (req, res) => {
  try {
    const { to, from, amount, token, decimals } = req.body;
    const { chain } = req.params;

    const provider = getProvider(chain);
    const chainCfg = CHAINS[chain];
    if (!chainCfg) {
      const { status, body } = buildErrorResponse({
        code: "UNSUPPORTED_CHAIN",
        message: `Unsupported chain: ${chain}`,
      });
      return res.status(status).json(body);
    }

    if (!from) {
      const { status, body } = buildErrorResponse({
        code: "MISSING_FROM_ADDRESS",
        message: "Sender address is required for gas estimation.",
      });
      return res.status(status).json(body);
    }

    const isTokenTransfer = Boolean(token);
    const nativeDecimals = chainCfg.nativeDecimals || 18;
    const amountString = amount && amount !== "" ? String(amount) : "0";

    const valueWei = isTokenTransfer
      ? ZERO_BN
      : ethers.utils.parseUnits(amountString, nativeDecimals);

    let txRequest;
    if (isTokenTransfer) {
      const contract = new ethers.Contract(token, ERC20_ABIS, provider);
      const transferData = contract.interface.encodeFunctionData("transfer", [
        to,
        ethers.utils.parseUnits(amountString, decimals || 18),
      ]);
      txRequest = { to: token, from, data: transferData };
    } else {
      txRequest = {
        to,
        from,
        value: valueWei,
      };
    }

    let profile;
    try {
      profile = await buildGasProfile({
        provider,
        chainCfg,
        txRequest,
        from,
        valueWei,
      });
    } catch (err) {
      const normalized = normalizeErrorPayload(err, "Unable to estimate gas for this transaction");
      const lower = normalized.message.toLowerCase();
      if (lower.includes("insufficient funds")) {
        const { status, body } = buildErrorResponse({
          code: "INSUFFICIENT_NATIVE_BALANCE",
          message: "Sender balance is too low to cover the current amount plus gas.",
        });
        return res.status(status).json(body);
      }
      console.error("Gas estimation failed:", err);
      const { status, body } = buildErrorResponse({
        code: normalized.code || "GAS_ESTIMATION_FAILED",
        message: normalized.message,
      });
      return res.status(status).json(body);
    }

    if (!profile.hasEnoughForEstimated) {
      const insufficient = handleInsufficientFunds({ chainCfg, profile });
      insufficient.body.context = formatGasProfile({ profile, chainCfg, valueWei });
      return res.status(insufficient.status).json(insufficient.body);
    }

    const formatted = formatGasProfile({ profile, chainCfg, valueWei });
    res.json(formatted);
  } catch (err) {
    console.error("Estimate gas error:", err);
    const normalized = normalizeErrorPayload(err, "Gas estimation failed");
    res.status(400).json({
      error: {
        code: normalized.code || "GAS_ESTIMATION_FAILED",
        message: normalized.message,
      },
    });
  }
};

// ---------------- PREPARE TX ---------------- //
exports.prepareTx = async (req, res) => {
  try {
    const { chain } = req.params;
    const { from, to, value, data } = req.body;

    const chainCfg = CHAINS[chain];
    if (!chainCfg) {
      const { status, body } = buildErrorResponse({
        code: "UNSUPPORTED_CHAIN",
        message: "Unsupported chain",
      });
      return res.status(status).json(body);
    }

    if (!from || !to) {
      const { status, body } = buildErrorResponse({
        code: "MISSING_FIELDS",
        message: "Both from and to addresses are required to prepare a transaction.",
      });
      return res.status(status).json(body);
    }

    const provider = getProvider(chain);
    const nonce = await provider.getTransactionCount(from, "latest");

    const valueWei = value ? ethers.BigNumber.from(String(value)) : ZERO_BN;

    const txRequest = {
      from,
      to,
      value: valueWei,
      data,
    };

    let profile;
    try {
      profile = await buildGasProfile({
        provider,
        chainCfg,
        txRequest,
        from,
        valueWei,
      });
    } catch (err) {
      const normalized = normalizeErrorPayload(err, "Unable to estimate gas for this transaction");
      const lower = normalized.message.toLowerCase();
      if (lower.includes("insufficient funds")) {
        const nativeBalance = await provider.getBalance(from);
        const shortfall = valueWei.gt(nativeBalance) ? valueWei.sub(nativeBalance) : ZERO_BN;
        const { status, body } = buildErrorResponse({
          code: "INSUFFICIENT_NATIVE_BALANCE",
          message: `Not enough ${chainCfg.nativeSymbol} to cover the requested amount and estimated gas.`,
          details: {
            available: formatEther(nativeBalance),
            shortfall: formatEther(shortfall),
          },
        });
        return res.status(status).json(body);
      }
      console.error("prepareTx gas estimation failed:", err);
      const { status, body } = buildErrorResponse({
        code: normalized.code || "GAS_ESTIMATION_FAILED",
        message: normalized.message,
      });
      return res.status(status).json(body);
    }

    if (!profile.hasEnoughForEstimated) {
      const insufficient = handleInsufficientFunds({ chainCfg, profile });
      insufficient.body.context = formatGasProfile({ profile, chainCfg, valueWei });
      return res.status(insufficient.status).json(insufficient.body);
    }

    const prepared = {
      to,
      from,
      nonce,
      data,
      value: valueWei.toHexString(),
      gasLimit: ethers.utils.hexlify(profile.gasLimit),
      maxFeePerGas: ethers.utils.hexlify(profile.maxFeePerGas),
      maxPriorityFeePerGas: ethers.utils.hexlify(profile.priorityFeePerGas),
      chainId: chainCfg.chainId,
      type: profile.maxFeePerGas.eq(profile.estimatedFeePerGas) && profile.priorityFeePerGas.isZero() ? 0 : 2,
    };

    const meta = formatGasProfile({ profile, chainCfg, valueWei });

    res.json({ tx: prepared, meta });
  } catch (err) {
    console.error("❌ prepareTx error:", err);
    const normalized = normalizeErrorPayload(err, "Failed to prepare transaction");
    res.status(400).json({
      error: {
        code: normalized.code || "PREPARE_TX_FAILED",
        message: normalized.message,
      },
    });
  }
};
