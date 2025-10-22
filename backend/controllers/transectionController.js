const { ethers } = require("ethers");
const { getProvider } = require("../chain/providers");
const ERC20_ABIS = require("../abis/erc20.json");
const CHAINS = require("../chain/config");

// ---------------- SEND TRANSACTION ---------------- //
exports.sendTransaction = async (req, res) => {
  try {
    const { signedTx } = req.body;
    const { chain } = req.params;

    const provider = getProvider(chain);
    const txResponse = await provider.sendTransaction(signedTx);

    res.json({ hash: txResponse.hash });
  } catch (err) {
    console.error("Send TX error:", err);
    res.status(400).json({ error: err.message || "failed" });
  }
};

// ---------------- ESTIMATE GAS ---------------- //
exports.estimateGas = async (req, res) => {
  try {
    const { to, from, amount, token, decimals } = req.body;
    const { chain } = req.params;

    const provider = getProvider(chain);
    const chainCfg = CHAINS[chain];
    if (!chainCfg) return res.status(400).json({ error: `Unsupported chain: ${chain}` });

    // 1️⃣ Estimate gas limit
    let gasLimitBN;
    try {
      if (token) {
        const contract = new ethers.Contract(token, ERC20_ABIS, provider);
        const data = contract.interface.encodeFunctionData("transfer", [
          to,
          ethers.utils.parseUnits(amount, decimals || 18),
        ]);
        gasLimitBN = await provider.estimateGas({ to: token, from, data });
      } else {
        gasLimitBN = await provider.estimateGas({
          to,
          from,
          value: ethers.utils.parseEther(amount),
        });
      }
    } catch (err) {
      // ✅ Handle insufficient funds gracefully
      if (
        err.message.includes("insufficient funds") ||
        (err.error && err.error.message?.includes("insufficient funds"))
      ) {
        return res.status(400).json({
          error:
            "Insufficient funds to cover the transaction amount and gas fees. Please reduce amount or add more ETH.",
        });
      }
      console.error("Gas estimation failed:", err);
      return res.status(400).json({ error: err.message || "Gas estimation failed" });
    }

    let gasLimit = BigInt(gasLimitBN.toString());
    gasLimit = (gasLimit * 110n) / 100n; // +10% buffer

    // 2️⃣ Fee data
    const feeData = await provider.getFeeData();
    const baseFee =
      feeData.lastBaseFeePerGas !== null
        ? BigInt(feeData.lastBaseFeePerGas.toString())
        : BigInt(ethers.utils.parseUnits("20", "gwei").toString());
    const priority =
      feeData.maxPriorityFeePerGas !== null
        ? BigInt(feeData.maxPriorityFeePerGas.toString())
        : BigInt(ethers.utils.parseUnits("2", "gwei").toString());

    // 3️⃣ Dynamic MetaMask-style gas logic
    let maxFeePerGas = (baseFee * 15n) / 10n + priority; // 1.5x base + tip
    const minGas = BigInt(ethers.utils.parseUnits("20", "gwei").toString());
    if (maxFeePerGas < minGas) maxFeePerGas = minGas;

    const totalFee = gasLimit * maxFeePerGas;

    // 4️⃣ Return response
    res.json({
      fee: ethers.utils.formatEther(totalFee.toString()),
      symbol: chainCfg.nativeSymbol,
      gasLimit: gasLimit.toString(),
      gasPrice: ethers.utils.formatUnits(maxFeePerGas.toString(), "gwei"),
      maxFeePerGas: ethers.utils.formatUnits(maxFeePerGas.toString(), "gwei"),
      maxPriorityFeePerGas: ethers.utils.formatUnits(priority.toString(), "gwei"),
    });
  } catch (err) {
    console.error("Estimate gas error:", err);
    res.status(400).json({ error: err.message || "failed" });
  }
};

// ---------------- PREPARE TX ---------------- //
exports.prepareTx = async (req, res) => {
  try {
    const { chain } = req.params;
    const { from, to, value, data } = req.body;

    const chainCfg = CHAINS[chain];
    if (!chainCfg) return res.status(400).json({ error: "Unsupported chain" });

    const provider = getProvider(chain);
    const nonce = await provider.getTransactionCount(from, "latest");

    // Build transaction base
    let txRequest = { from, to };
    if (value) txRequest.value = ethers.BigNumber.from(value);
    if (data) txRequest.data = data;

    // Estimate gas safely
    let gasLimit;
    try {
      const estimated = await provider.estimateGas(txRequest);
      gasLimit = estimated.mul(110).div(100);
    } catch (err) {
      console.warn("Gas estimation failed, using fallback:", err.message);
      gasLimit = data?.startsWith("0xa9059cbb")
        ? ethers.BigNumber.from("100000")
        : ethers.BigNumber.from("21000");
    }

    // Fee data (dynamic)
    const feeData = await provider.getFeeData();
    const baseFee =
      feeData.lastBaseFeePerGas !== null
        ? BigInt(feeData.lastBaseFeePerGas.toString())
        : BigInt(ethers.utils.parseUnits("20", "gwei").toString());
    const priority =
      feeData.maxPriorityFeePerGas !== null
        ? BigInt(feeData.maxPriorityFeePerGas.toString())
        : BigInt(ethers.utils.parseUnits("2", "gwei").toString());

    let maxFeePerGas = (baseFee * 15n) / 10n + priority;
    const minGas = BigInt(ethers.utils.parseUnits("20", "gwei").toString());
    if (maxFeePerGas < minGas) maxFeePerGas = minGas;

    const maxPriorityFeePerGas = priority;

    // Final TX object
    const prepared = {
      ...txRequest,
      nonce,
      gasLimit: ethers.BigNumber.from(gasLimit.toString()).toHexString(),
      maxFeePerGas: ethers.BigNumber.from(maxFeePerGas.toString()).toHexString(),
      maxPriorityFeePerGas: ethers.BigNumber.from(maxPriorityFeePerGas.toString()).toHexString(),
      chainId: chainCfg.chainId,
      type: 2, // ✅ EIP-1559
    };

    res.json(prepared);
  } catch (err) {
    console.error("❌ prepareTx error:", err);
    res.status(400).json({ error: err.message || "failed" });
  }
};
