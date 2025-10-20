const express = require('express');
const router = express.Router();
const swapController = require('../controllers/swapController');

router.get('/estimate', swapController.estimate);
router.post('/estimate', swapController.estimate);

router.post('/check-balance', swapController.checkBalance);

module.exports = router;
