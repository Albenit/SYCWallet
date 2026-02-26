const prisma = require('../config/db');
const crypto = require("crypto");
const { utils } = require("ethers");
const NONCE_TTL_MS = 10 * 60 * 1000;
const nonces = new Map();
const jwt = require("jsonwebtoken");


function isEthAddress(addr) {
  return /^0x[a-fA-F0-9]{40}$/.test(addr || "");
}

function sweepExpired() {
  const now = Date.now();
  for (const [addr, v] of nonces.entries()) {
    if (!v || v.exp <= now) nonces.delete(addr);
  }
}

async function storeUserAddress(address) {
    await prisma.user.upsert({
      where: { address },
      create: { address, lastLogin: new Date(), loginCount: 1 },
      update: {
        lastLogin: new Date(),
        loginCount: { increment: 1 },
      },
    });
}

async function nonce(req, res) {
  try {
    const addressRaw = String(req.body?.address || "");
    if (!isEthAddress(addressRaw)) {
      return res.status(422).json({ error: "invalid_address" });
    }

    const address = addressRaw.toLowerCase();
    const value = crypto.randomBytes(32).toString("hex");
    const exp = Date.now() + NONCE_TTL_MS;

    nonces.set(address, { nonce: value, exp });
    if (nonces.size % 50 === 0) sweepExpired();

    return res.json({ nonce: value });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "server_error" });
  }
}

async function verify(req, res) {
  try {
    const addressRaw = String(req.body?.address || "");
    const message = String(req.body?.message || "");
    const signature = String(req.body?.signature || "");

    if (!isEthAddress(addressRaw) || !message || !signature) {
      return res.status(422).json({ error: "bad_request" });
    }

    const address = addressRaw.toLowerCase();
    const entry = nonces.get(address);
    if (!entry) return res.status(400).json({ error: "nonce_missing" });

    if (entry.exp <= Date.now()) {
      nonces.delete(address);
      return res.status(400).json({ error: "nonce_expired" });
    }

    if (!message.includes(entry.nonce)) {
      return res.status(400).json({ error: "nonce_mismatch" });
    }

    let recovered;
    try {
      recovered = utils.verifyMessage(message, signature);
    } catch {
      return res.status(400).json({ error: "signature_invalid" });
    }

    if (utils.getAddress(recovered) !== utils.getAddress(addressRaw)) {
      return res.status(401).json({ error: "address_mismatch" });
    }

    nonces.delete(address);

    storeUserAddress(address);

    const token = jwt.sign({ address: utils.getAddress(addressRaw) },process.env.JWT_SECRET,{ expiresIn: '2h' }
    );

    return res.json({ ok: true, token });
  } catch (e) {
    return res.status(500).json({ error: "server_error" });
  }
}

module.exports = { nonce, verify };
