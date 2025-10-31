const { ethers } = require('ethers');

const RPC = {
  ethereum:  process.env.RPC_ETHEREUM,    
  polygon:   process.env.RPC_POLYGON,    
  bsc:       process.env.RPC_BSC,        
  arbitrum:  process.env.RPC_ARBITRUM,   
  avalanche: process.env.RPC_AVALANCHE,      
  base:      process.env.RPC_BASE,     
};

function getProvider(chain) {
  const url = RPC[chain];
  if (!url) throw new Error('unsupported_chain');
  return new ethers.providers.JsonRpcProvider(url);
}
module.exports = { getProvider };
