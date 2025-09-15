const router = require("express").Router();
const { nonce, verify } = require("../controllers/authNonce");

router.post("/auth/nonce", nonce);
router.post("/auth/verify", verify);

module.exports = router;
