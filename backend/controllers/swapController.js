const express = require('express');
const axios = require("axios");
const { getPrices } = require("../utils/prices");
const { getProvider } = require('../chain/providers');
const CHAINS = require("../chain/config");
const { ethers } = require("ethers");
const erc20Abi = require("../abis/erc20.json");

exports.estimate = async (req, res) => {
    try {
        const p = req.body?.params || req.query || {};

        const from = (p.from || '').toString();
        const to = (p.to || '').toString();
        const fromNetwork = (p.fromNetwork || '').toString();
        const toNetwork = (p.toNetwork || '').toString();
        const amount = (p.amount || '').toString();

        if (!from || !to || !fromNetwork || !toNetwork || !amount) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameters: from, to, amount, fromNetwork, toNetwork",
            });
        }

            try {
                const url = `https://vip-api.changenow.io/v1.6/exchange/estimate`;
                const response = await axios.get(url, {
                    params: {
                        fromCurrency: from,
                        fromNetwork,
                        fromAmount: amount,
                        toCurrency: to,
                        toNetwork,
                        type: 'direct',
                        promoCode: '',
                        withoutFee: true,
                        isBridge: false,
                    },
                });
                return res.json(response.data);
            } catch (aggErr) {
                const symFrom = (from || '').toUpperCase();
                const symTo = (to || '').toUpperCase();

                const toTicker = `${symTo}USDT`;
                const fromTicker = `${symFrom}USDT`;

                const priceMap = await getPrices([toTicker, fromTicker]);
                const pFrom = priceMap[fromTicker];
                const pTo = priceMap[toTicker];

                if (!pFrom || !pTo) {
                    throw aggErr;
                }

                const amt = parseFloat(amount);
                const estimatedAmount = (amt * (pFrom / pTo)).toString();

                return res.json({
                    estimatedAmount,
                    summary: { estimatedAmount },
                    source: 'binance-fallback',
                });
            }
    } catch (err) {
        const status = err.response?.status || 500;
        return res.status(status).json({
            success: false,
                message: err.response?.data?.message || err.message || "Internal server error",
                details: err.response?.data || undefined,
        });
    }
};

exports.checkBalance = async (req, res) => {
    try {
        const { address, chain, token } = req.body;

        if (!address || !chain) {
            return res.status(400).json({ error: "Missing address or chain" });
        }

        const chainCfg = CHAINS[chain];
        if (!chainCfg) {
            return res.status(400).json({ error: "Unsupported chain" });
        }

        const provider = getProvider(chain);

        if (token && token.address) {
            const contract = new ethers.Contract(token.address, erc20Abi, provider);
            const balanceWei = await contract.balanceOf(address);

            let decimals = token.decimals;
            if (decimals === undefined || decimals === null) {
                const onchainDecimals = await contract.decimals();
                decimals = typeof onchainDecimals === "number" ? onchainDecimals : Number(onchainDecimals);
            }
            const decimalsNum = typeof decimals === "number" ? decimals : Number(decimals) || 18;
            const formatted = ethers.utils.formatUnits(balanceWei, decimalsNum);

            return res.json({
                balance: formatted,
                symbol: token.symbol || token.address,
                rawBalance: balanceWei.toString(),
                decimals: decimalsNum,
            });
        }

        const balanceWei = await provider.getBalance(address);
        const decimals = chainCfg.decimals || 18;
        const formatted = ethers.utils.formatUnits(balanceWei, decimals);

        return res.json({
            balance: formatted,
            symbol: chainCfg.nativeSymbol || "ETH",
            rawBalance: balanceWei.toString(),
            decimals,
        });
    } catch (err) {
        console.error("check-balance error:", err);
        return res.status(500).json({ error: "Failed to check wallet balance" });
    }
};