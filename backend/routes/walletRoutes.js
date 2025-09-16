const express = require('express');
const { ethers } = require('ethers');
const auth = require('../middleware/authMiddleware');
const { getProvider } = require('../chain/providers');
const ERC20_ABI = require('../chain/erc20');
const walletController = require('../controllers/walletController');

const router = express.Router();

// Who am I?
router.get('/me', auth, async (req, res) => {
  res.json({ address: req.user.address });
});

// Native balance (ETH/MATIC/BNB…)
router.get("/:chain/native-balance", auth, walletController.getNativeBalance);

// ERC-20 token balance
// GET /api/wallet/:chain/token-balance?token=0xTokenAddress
router.get("/:chain/token-balance", auth, walletController.getTokenBalance);


// Account basics (nonce/txCount, chainId, latest block)
router.get("/:chain/account", auth, walletController.getAccountBasic);


module.exports = router;
