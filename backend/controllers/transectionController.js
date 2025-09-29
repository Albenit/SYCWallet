const {
  ethers
} = require("ethers");
const {
  getProvider
} = require('../chain/providers');
const ERC20_ABIS = require('../abis/erc20.json');
const CHAINS = require("../chain/config");



exports.sendTransaction = async (req, res) => {
  try {
    const {
      signedTx
    } = req.body;
    const {
      chain
    } = req.params;

    const provider = getProvider(chain);
    const txResponse = await provider.sendTransaction(signedTx);

    res.json({
      hash: txResponse.hash
    });
  } catch (err) {
    console.error("Send TX error:", err);
    res.status(400).json({
      error: err.message || "failed"
    });
  }
}

exports.estimateGas = async (req, res) => {
  try {
    const { to,from,amount,token,decimals } = req.body;
    const { chain } = req.params;

    const provider = getProvider(chain);

    const chainCfg = CHAINS[chain];
    if (!chainCfg) {
      return res.status(400).json({
        error: `Unsupported chain: ${chain}`
      });
    }

    let gasLimit;
    if (token) {
      const contract = new ethers.Contract(token, ERC20_ABIS, provider);
      const data = contract.interface.encodeFunctionData("transfer", [
        to,
        ethers.utils.parseUnits(amount, decimals || 18),
      ]);
      gasLimit = await provider.estimateGas({
        to: token,
        from,
        data
      });
    } else {
      gasLimit = await provider.estimateGas({
        to,
        from,
        value: ethers.utils.parseEther(amount),
      });
    }

    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || 0n;
    const totalFee = gasLimit * gasPrice;

    res.json({
      fee: ethers.utils.formatEther(totalFee),
      symbol: chainCfg.nativeSymbol,
    });
  } catch (err) {
    console.error("Estimate gas error:", err);
    res.status(400).json({
      error: err.message || "failed"
    });
  }
};

exports.prepareTx = async (req, res) => {
  try {
    const {
      chain
    } = req.params;
    const {
      from,
      to,
      value,
      data
    } = req.body;

    const chainCfg = CHAINS[chain];
    if (!chainCfg) {
      return res.status(400).json({
        error: "Unsupported chain"
      });
    }

    const provider = getProvider(chain);

    // get nonce for sender
    const nonce = await provider.getTransactionCount(from, "latest");

    // build tx skeleton
    let txRequest = {
      from,
      to
    };

    if (value) {
      txRequest.value = ethers.BigNumber.from(value); // if provided already as hex/wei
    }
    if (data) {
      txRequest.data = data;
    }

    // estimate gas
    let gasLimit;
    try {
      gasLimit = await provider.estimateGas(txRequest);
    } catch (err) {
      // fallback if estimation fails
      gasLimit = ethers.BigNumber.from("21000");
    }

    const feeData = await provider.getFeeData();

    const prepared = {
      ...txRequest,
      nonce,
      gasLimit: gasLimit.toHexString(),
      gasPrice: feeData.gasPrice ? feeData.gasPrice.toHexString() : undefined,
      maxFeePerGas: feeData.maxFeePerGas ? feeData.maxFeePerGas.toHexString() : undefined,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?
        feeData.maxPriorityFeePerGas.toHexString() :
        undefined,
      chainId: chainCfg.chainId, // ✅ ensure correct chain id
    };

    res.json(prepared);
  } catch (err) {
    console.error("prepareTx error:", err);
    res.status(400).json({
      error: err.message || "failed"
    });
  }
};