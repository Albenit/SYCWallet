const { ethers } = require('ethers');

// Use env vars for real keys (Alchemy/Infura/etc.)
const RPC = {
  ethereum: process.env.RPC_ETHEREUM,   // mainnet
  sepolia:  process.env.RPC_SEPOLIA,
  polygon:  process.env.RPC_POLYGON,
  bsc:      process.env.RPC_BSC,
};

function getProvider(chain) {
  const url = RPC[chain];
  if (!url) throw new Error('unsupported_chain');
  return new ethers.providers.JsonRpcProvider(url);
}
module.exports = { getProvider };
