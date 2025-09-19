const CHAINS = require("../chain/config");

exports.getChain = async (req, res) => {
  const chainn = req.params.chain;
  
  const envRPC = {
    ethereum: process.env.RPC_ETHEREUM,
    sepolia: process.env.RPC_SEPOLIA,
    polygon: process.env.RPC_POLYGON,
    bsc: process.env.RPC_BSC,
  };

  const chain = CHAINS[chainn];
  if (!chain) {
    return res.status(404).json({ error: "Chain not found" });
  }

  res.json({
    chainn,
    ...chain,
    rpc: envRPC[chainn] || null,
  });
};