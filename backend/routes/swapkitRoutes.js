const express = require('express');
const router = express.Router();
const swapkit = require('../controllers/swapkitController');

router.post('/quote', swapkit.quote);
router.post('/swap', swapkit.swap);

module.exports = router;
