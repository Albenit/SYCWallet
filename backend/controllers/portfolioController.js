const express = require('express');
const { ethers } = require("ethers");
const { getProvider } = require('../chain/providers');
const ERC20_ABI = require('../chain/erc20');
const CHAINS = require("../chain/config");
const prisma = require('../config/db');


exports.getPortfolio = async (req, res) => {
  try {
    const { address } = req.user;
    const userAddr = address.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { address: userAddr },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const selectedTokens = await prisma.userToken.findMany({
      where: { userId: user.id },
    });

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

                return {
                  type: "native",
                  symbol: t.symbol || chainCfg.nativeSymbol,
                  fullName: t.fullName || chainCfg.fullName || chainCfg.label,
                  balance_raw: nativeRaw.toString(),
                  balance: nativeBal,
                  decimals: t.decimals || chainCfg.decimals,
                  binanceSymbol: t.binanceSymbol || chainCfg.binanceSymbol || null,
                  logo: chainCfg.logo
                };
              }

              const tokenAddr = t.tokenAddress.toLowerCase();
              const contract = new ethers.Contract(tokenAddr, ERC20_ABI, provider);
              const raw = await contract.balanceOf(userAddr);
              const humanBal = ethers.utils.formatUnits(raw, t.decimals);

              const tokenMeta = (chainCfg.tokens || []).find(
                (tk) => tk.address.toLowerCase() === tokenAddr
              );

              return {
                type: "token",
                symbol: t.symbol,
                fullName: t.fullName || (tokenMeta ? tokenMeta.fullName : null),
                token: tokenAddr,
                balance_raw: raw.toString(),
                balance: humanBal,
                decimals: t.decimals,
                binanceSymbol: t.binanceSymbol || (tokenMeta ? tokenMeta.binanceSymbol : null),
                logo: tokenMeta ? tokenMeta.logo : null
              };
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
          chainId: chainCfg.chainId,
          items: chainItems,
        };
      })
    );

    const filteredPortfolio = portfolio.filter(Boolean);

    res.json({
      address: userAddr,
      portfolio: filteredPortfolio,
    });
  } catch (e) {
    console.error("getPortfolio error:", e);
    res.status(400).json({ error: e.message || "failed" });
  }
};

exports.getAllTokens = async (req, res) => {
  try {
    const { address } = req.user;
    const user = await prisma.user.findUnique({
      where: { address: address.toLowerCase() },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userTokens = await prisma.userToken.findMany({
      where: { userId: user.id },
    });
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
        fullName: chainCfg.fullName || chainCfg.label,
        decimals: chainCfg.decimals,
        binanceSymbol: chainCfg.binanceSymbol,
        logo: chainCfg.logo,
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
            fullName: t.fullName || null,
            decimals: t.decimals,
            binanceSymbol: t.binanceSymbol,
            address: t.address.toLowerCase(),
            logo: t.logo,
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
    console.error("getAllTokens error:", e);
    res.status(400).json({ error: e.message || "failed" });
  }
};

exports.toggleToken = async (req, res) => {
  try {
    const { address } = req.user;
    const { chain, tokenAddress } = req.body;

    const user = await prisma.user.findUnique({
      where: { address: address.toLowerCase() },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const chainCfg = CHAINS[chain];
    if (!chainCfg) return res.status(400).json({ error: "Invalid chain" });

    const tokenKey = tokenAddress ? tokenAddress.toLowerCase() : null;

    const existing = await prisma.userToken.findFirst({
      where: {
        userId: user.id,
        chain,
        tokenAddress: tokenKey,
      },
    });

    if (existing) {
      await prisma.userToken.delete({ where: { id: existing.id } });
      return res.json({ success: true, active: false });
    }

    let tokenCfg;
    if (!tokenKey) {
      tokenCfg = {
        address: null,
        symbol: chainCfg.nativeSymbol,
        fullName: chainCfg.fullName || chainCfg.label,
        decimals: chainCfg.decimals,
        binanceSymbol: chainCfg.binanceSymbol,
      };
    } else {
      tokenCfg = (chainCfg.tokens || []).find(t => t.address.toLowerCase() === tokenKey);
      if (!tokenCfg) return res.status(400).json({ error: "Token not found" });
    }

    const newToken = await prisma.userToken.create({
      data: {
        userId: user.id,
        chain,
        tokenAddress: tokenCfg.address ? tokenCfg.address.toLowerCase() : null,
        symbol: tokenCfg.symbol,
        decimals: tokenCfg.decimals,
        binanceSymbol: tokenCfg.binanceSymbol,
      },
    });

    return res.json({ success: true, active: true, token: newToken });
  } catch (err) {
    console.error("toggleToken error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
};
