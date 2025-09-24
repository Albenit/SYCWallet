const express = require('express');
const { ethers } = require("ethers");
const { getProvider } = require('../chain/providers');
const ERC20_ABI = require('../chain/erc20');


exports.getNativeBalance = async (req, res) => {
    try {
        const { chain } = req.params;
        const provider = getProvider(chain);
        const bal = await provider.getBalance(req.user.address);
        return res.json({
        chain,
        address: req.user.address,
        balance_wei: bal.toString(),
        balance: ethers.utils.formatEther(bal),
        unit: 'native',
        });
    } catch (e) {
        return res.status(400).json({ error: e.message || 'failed' });
    }
}

exports.getTokenBalance = async (req, res) => {
      try {
        const { chain } = req.params;
        const { token } = req.query;
        if (!token) return res.status(422).json({ error: 'missing_token' });
    
        const provider = getProvider(chain);
        const contract = new ethers.Contract(token, ERC20_ABI, provider);
    
        const [raw, decimals, symbol] = await Promise.all([
          contract.balanceOf(req.user.address),
          contract.decimals(),
          contract.symbol().catch(() => ''), 
        ]);
    
        const human = ethers.utils.formatUnits(raw, decimals);
        return res.json({
          chain,
          address: req.user.address,
          token,
          symbol,
          decimals,
          balance_raw: raw.toString(),
          balance: human,
        });
      } catch (e) {
        return res.status(400).json({ error: e.message || 'failed' });
      }
}

exports.getAccountBasic = async (req, res) => {
    try {
        const { chain } = req.params;
        const provider = getProvider(chain);

        const [txCount, net, block] = await Promise.all([
        provider.getTransactionCount(req.user.address),
        provider.getNetwork(),
        provider.getBlockNumber(),
        ]);

        return res.json({
        chain,
        address: req.user.address,
        txCount,
        chainId: net.chainId,
        latestBlock: block,
        });
    } catch (e) {
        return res.status(400).json({ error: e.message || 'failed' });
    }
}

