const express = require("express");
const router = express.Router();
const changeNow = require("../controllers/changenowController");

router.post("/quote", changeNow.quote);
router.post("/swap", changeNow.swap);

module.exports = router;
