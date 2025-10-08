const axios = require("axios");

function getBase() {
  const base = process.env.SWAPKIT_BASE_URL || process.env.SWAPKIT_URL || "";
  if (!base) throw new Error("Missing SWAPKIT_BASE_URL env");
  return base.replace(/\/$/, "");
}

function getHeaders() {
  const key = process.env.SWAPKIT_API_KEY || process.env.SWAPKIT_KEY;
  const headers = { "Content-Type": "application/json" };
  if (key) headers["x-api-key"] = key;
  return headers;
}

exports.quote = async (req, res) => {
  try {
    const base = getBase();
    const path = process.env.SWAPKIT_QUOTE_PATH || "/quote";
    const url = `${base}${path}`;
    const { data } = await axios.post(url, req.body, { headers: getHeaders() });
    res.json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.response?.data || err.message });
  }
};

exports.swap = async (req, res) => {
  try {
    const base = getBase();
    const path = process.env.SWAPKIT_SWAP_PATH || "/swap";
    const url = `${base}${path}`;
    const { data } = await axios.post(url, req.body, { headers: getHeaders() });
    res.json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.response?.data || err.message });
  }
};
