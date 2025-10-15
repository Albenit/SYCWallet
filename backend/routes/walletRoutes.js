const express = require('express');
const auth = require('../middleware/authMiddleware');
const portfolioController = require('../controllers/portfolioController');
const transactionsController = require('../controllers/transectionController');
const partialsController = require('../controllers/partialsController');
const router = express.Router();


router.get('/me', auth, async (req, res) => {
  res.json({ address: req.user.address });
});

// Portfolio (native + tokens)
router.get("/chain/portfolio", auth, portfolioController.getPortfolio);
router.get("/all-tokens", auth, portfolioController.getAllTokens);
router.post("/toggle-token", auth, portfolioController.toggleToken);

// Transactions
router.post("/:chain/sendTransaction", auth, transactionsController.sendTransaction);
router.post("/:chain/estimateGas", auth, transactionsController.estimateGas);
router.post("/:chain/prepareTx", transactionsController.prepareTx);

// Partials
router.get('/chains', partialsController.getChains);
router.get('/tokens/:chain', partialsController.getChainTokens);


module.exports = router;
