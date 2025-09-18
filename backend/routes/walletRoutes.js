const express = require('express');
const auth = require('../middleware/authMiddleware');
const walletController = require('../controllers/walletController');
const portfolioController = require('../controllers/portfolioController');
const transactionsController = require('../controllers/transectionController');

const router = express.Router();

// Who am I?
router.get('/me', auth, async (req, res) => {
  res.json({ address: req.user.address });
});


router.get("/:chain/native-balance", auth, walletController.getNativeBalance);

router.get("/:chain/token-balance", auth, walletController.getTokenBalance);

router.get("/:chain/account", auth, walletController.getAccountBasic);


// Portfolio (native + tokens)
router.get("/chain/portfolio", auth, portfolioController.getPortfolio);

// Transactions
router.get("/save-transactions-history", auth, transactionsController.saveTransactionHistory);


module.exports = router;
