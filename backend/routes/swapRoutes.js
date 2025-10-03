const express = require('express');
const router = express.Router();
const swapController = require('../controllers/swapController');

router.get('/estimate',swapController.estimate)

module.exports = router;
