const router = require("express").Router();
const { nonce, verify } = require("../controllers/authNonce");
const auth = require('../middleware/authMiddleware');

router.get("/verify-token", auth, (req, res) => {
  return res.json({ valid: true });
});

router.post("/nonce", nonce);
router.post("/verify", verify);



module.exports = router;
