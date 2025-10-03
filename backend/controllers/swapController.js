const express = require('express');
const axios = require("axios");

exports.estimate = async (req, res) => {
    try {
        const response = await axios.get(`https://vip-api.changenow.io/v1.6/exchange/estimate?fromCurrency=${req.body.params.from}&fromNetwork=${req.body.params.fromNetwork}&fromAmount=${req.body.params.amount}&toCurrency=${req.body.params.to}&toNetwork=${req.body.params.toNetwork}&type=direct&promoCode=&withoutFee=true&isBridge=false`);
         
        return res.json(

            response.data
        );
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.response?.data || err.message || "failed"
        });
    }
};