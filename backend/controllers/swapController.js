const express = require('express');
const axios = require("axios");
const { getPrices } = require("../utils/prices");

exports.estimate = async (req, res) => {
    try {
        // Accept both GET (req.query) and POST (req.body.params)
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

            // Primary: ChangeNOW estimate (may not support testnets like sepolia)
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
                // Fallback: approximate using Binance prices (for dev/testnets)
                const symFrom = (from || '').toUpperCase();
                const symTo = (to || '').toUpperCase();

                const toTicker = `${symTo}USDT`;
                const fromTicker = `${symFrom}USDT`;

                const priceMap = await getPrices([toTicker, fromTicker]);
                const pFrom = priceMap[fromTicker];
                const pTo = priceMap[toTicker];

                if (!pFrom || !pTo) {
                    // rethrow original aggregator error if we can't price
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