const router = require('express').Router();

const authController = require('../controllers/authController');

router.post('/create-wallet',authController.createWallet);

module.exports = router;