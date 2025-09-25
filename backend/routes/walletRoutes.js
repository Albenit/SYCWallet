const express = require('express');
const auth = require('../middleware/authMiddleware');
const walletController = require('../controllers/walletController');
const portfolioController = require('../controllers/portfolioController');
const transactionsController = require('../controllers/transectionController');
const partialsController = require('../controllers/partialsController');

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
router.get("/all-tokens", auth, portfolioController.getAllTokens);
router.post("/toggle-token", auth, portfolioController.toggleToken);

// Transactions
router.post("/:chain/sendTransaction", auth, transactionsController.sendTransaction);
router.post("/:chain/estimateGas", auth, transactionsController.estimateGas);
router.post("/:chain/prepareTx", transactionsController.prepareTx);



router.get('/chain/:chain', partialsController.getChain);

module.exports = router;
