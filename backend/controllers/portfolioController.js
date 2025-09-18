const express = require('express');
const { ethers } = require("ethers");
const { getProvider } = require('../chain/providers');
const ERC20_ABI = require('../chain/erc20');
const CHAINS = require("../chain/config");
const { getPrices } = require("../utils/prices");


exports.getPortfolio = async (req, res) => {
  try {
    const userAddr = req.user.address;

    const ids = new Set();
    for (const [chainKey, cfg] of Object.entries(CHAINS)) {
      if (cfg.binanceSymbol) ids.add(cfg.binanceSymbol);
      cfg.tokens.forEach(t => ids.add(t.binanceSymbol));
    }
    const prices = await getPrices([...ids]);

    const portfolio = [];
    let totalUsdValue = 0;

    for (const [chainKey, chainCfg] of Object.entries(CHAINS)) {
      const provider = getProvider(chainKey);

      // Native balance
      const nativeRaw = await provider.getBalance(userAddr);
      const nativeBal = ethers.utils.formatUnits(nativeRaw, chainCfg.decimals);

      const nativeUsdPrice = prices[chainCfg.binanceSymbol] || 0;
      const nativeUsdValue = parseFloat(nativeBal) * nativeUsdPrice;
      totalUsdValue += nativeUsdValue;

      const chainItems = [
        {
          type: "native",
          symbol: chainCfg.nativeSymbol,
          balance_raw: nativeRaw.toString(),
          balance: nativeBal,
          usdPrice: nativeUsdPrice,
          usdValue: nativeUsdValue,
        },
      ];

      // Tokens
      for (const t of chainCfg.tokens) {
        try {
          const contract = new ethers.Contract(t.address, ERC20_ABI, provider);

          const [raw, decimals, symbol] = await Promise.all([
            contract.balanceOf(userAddr),
            contract.decimals(),
            contract.symbol().catch(() => t.symbol),
          ]);

          const humanBal = ethers.utils.formatUnits(raw, decimals);
          const usdPrice = prices[t.binanceSymbol] || 0;
          const usdValue = parseFloat(humanBal) * usdPrice;
          totalUsdValue += usdValue;

          chainItems.push({
            type: "token",
            symbol: symbol || t.symbol,
            token: t.address,
            balance_raw: raw.toString(),
            balance: humanBal,
            usdPrice,
            usdValue,
          });
        } catch (err) {
          chainItems.push({
            type: "token",
            token: t.address,
            error: err.message,
          });
        }
      }

      portfolio.push({ chain: chainCfg.label, items: chainItems });
    }

    res.json({
      address: userAddr,
      portfolio,
      totalUsdValue: totalUsdValue.toFixed(2),
    });
  } catch (e) {
    res.status(400).json({ error: e.message || "failed" });
  }
};
