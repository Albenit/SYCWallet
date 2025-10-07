const express = require('express');
const router = express.Router();
const swapController = require('../controllers/swapController');

// Support both GET and POST for flexibility from clients
router.get('/estimate', swapController.estimate);
router.post('/estimate', swapController.estimate);

module.exports = router;
