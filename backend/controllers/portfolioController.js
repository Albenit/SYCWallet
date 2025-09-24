const express = require('express');
const { ethers } = require("ethers");
const { getProvider } = require('../chain/providers');
const ERC20_ABI = require('../chain/erc20');
const CHAINS = require("../chain/config");
const { getPrices } = require("../utils/prices");
const UserToken = require('../models/userToken');
const User = require('../models/User');


exports.getPortfolio = async (req, res) => {
  try {
    const { address } = req.user;
    const user = await User.findOne({ address: address.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userAddr = address.toLowerCase();

    const selectedTokens = await UserToken.find({ user: user._id }).lean();

    const ids = [...new Set(selectedTokens.map((t) => t.binanceSymbol))];
    const prices = await getPrices(ids);

    const portfolio = await Promise.all(
      Object.entries(CHAINS).map(async ([chainKey, chainCfg]) => {
        const provider = getProvider(chainKey);
        const userTokensOnChain = selectedTokens.filter(
          (t) => t.chain === chainKey
        );

        if (userTokensOnChain.length === 0) return null;

        const chainItems = await Promise.all(
          userTokensOnChain.map(async (t) => {
            try {
              if (!t.tokenAddress) {
                const nativeRaw = await provider.getBalance(userAddr);
                const nativeBal = ethers.utils.formatUnits(
                  nativeRaw,
                  chainCfg.decimals
                );

                const usdPrice = prices[t.binanceSymbol] || 0;
                const usdValue = parseFloat(nativeBal) * usdPrice;

                return {
                  type: "native",
                  symbol: t.symbol || chainCfg.nativeSymbol,
                  balance_raw: nativeRaw.toString(),
                  balance: nativeBal,
                  usdPrice,
                  usdValue,
                };
              } else {
                const tokenAddr = t.tokenAddress.toLowerCase();
                const contract = new ethers.Contract(
                  tokenAddr,
                  ERC20_ABI,
                  provider
                );
                const raw = await contract.balanceOf(userAddr);
                const humanBal = ethers.utils.formatUnits(raw, t.decimals);

                const usdPrice = prices[t.binanceSymbol] || 0;
                const usdValue = parseFloat(humanBal) * usdPrice;

                return {
                  type: "token",
                  symbol: t.symbol,
                  token: tokenAddr,
                  balance_raw: raw.toString(),
                  balance: humanBal,
                  usdPrice,
                  usdValue,
                };
              }
            } catch (err) {
              return {
                type: t.tokenAddress ? "token" : "native",
                token: t.tokenAddress || null,
                error: err.message,
              };
            }
          })
        );

        return {
          chain: chainCfg.label,
          items: chainItems,
        };
      })
    );

    const filteredPortfolio = portfolio.filter(Boolean);
    const totalUsdValue = filteredPortfolio
      .flatMap((c) => c.items)
      .reduce((sum, i) => sum + (i.usdValue || 0), 0);

    res.json({
      address: userAddr,
      portfolio: filteredPortfolio,
      totalUsdValue: totalUsdValue.toFixed(2),
    });
  } catch (e) {
    console.error("getPortfolio error:", e);
    res.status(400).json({ error: e.message || "failed" });
  }
};


exports.getAllTokens = async (req, res) => {
  try {
    const { address } = req.user;
    const user = await User.findOne({ address: address.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userTokens = await UserToken.find({ user: user._id }).lean();

    const activeMap = new Set(
      userTokens.map(t => `${t.chain}:${t.tokenAddress || 'native'}`)
    );

    const allTokens = [];

    for (const [chainKey, chainCfg] of Object.entries(CHAINS)) {
      const chainTokens = [];

      chainTokens.push({
        type: "native",
        chain: chainKey,
        chainLabel: chainCfg.label,
        symbol: chainCfg.nativeSymbol,
        decimals: chainCfg.decimals,
        binanceSymbol: chainCfg.binanceSymbol,
        address: null,
        active: activeMap.has(`${chainKey}:native`), 
      });

      if (Array.isArray(chainCfg.tokens)) {
        for (const t of chainCfg.tokens) {
          chainTokens.push({
            type: "token",
            chain: chainKey,
            chainLabel: chainCfg.label,
            symbol: t.symbol,
            decimals: t.decimals,
            binanceSymbol: t.binanceSymbol,
            address: t.address.toLowerCase(),
            active: activeMap.has(`${chainKey}:${t.address.toLowerCase()}`),
          });
        }
      }

      allTokens.push({
        chain: chainKey,
        chainLabel: chainCfg.label,
        tokens: chainTokens,
      });
    }

    res.json(allTokens);
  } catch (e) {
    res.status(400).json({ error: e.message || "failed" });
  }
};

exports.toggleToken = async (req, res) => {
  try {
    const { address } = req.user;
    const { chain, tokenAddress } = req.body;

    
    const user = await User.findOne({ address: address.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const chainCfg = CHAINS[chain];
    if (!chainCfg) return res.status(400).json({ error: "Invalid chain" });

    const tokenKey = tokenAddress ? tokenAddress.toLowerCase() : null;

    const existing = await UserToken.findOne({
      user: user._id,
      chain,
      tokenAddress: tokenKey
    });

  
    if (existing) {
      await UserToken.deleteOne({ _id: existing._id });
      return res.json({ success: true, active: false });
    }

    let tokenCfg;
    if (!tokenKey) {
      tokenCfg = {
        address: null,
        symbol: chainCfg.nativeSymbol,
        decimals: chainCfg.decimals,
        binanceSymbol: chainCfg.binanceSymbol,
      };
    } else {
      tokenCfg = (chainCfg.tokens || []).find(t => t.address.toLowerCase() === tokenKey);
      if (!tokenCfg) return res.status(400).json({ error: "Token not found" });
    }

    const newToken = await UserToken.create({
      user: user._id,
      chain,
      tokenAddress: tokenCfg.address ? tokenCfg.address.toLowerCase() : null,
      symbol: tokenCfg.symbol,
      decimals: tokenCfg.decimals,
      binanceSymbol: tokenCfg.binanceSymbol
    });

    return res.json({ success: true, active: true, token: newToken });
  } catch (err) {
    console.error("toggleToken error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
};
