const { ethers } = require('ethers');

const RPC = {
  ethereum:  process.env.RPC_ETHEREUM,   
  sepolia:   process.env.RPC_SEPOLIA,   
  polygon:   process.env.RPC_POLYGON,    
  bsc:       process.env.RPC_BSC,        
  arbitrum:  process.env.RPC_ARBITRUM,   
  avalanche: process.env.RPC_AVALANCHE,  
  fantom:    process.env.RPC_FANTOM,     
  gnosis:    process.env.RPC_GNOSIS,     
  base:      process.env.RPC_BASE,       
  lumia:     process.env.RPC_LUMIA,      
  zksync:    process.env.RPC_ZKSYNC,
};

function getProvider(chain) {
  const url = RPC[chain];
  if (!url) throw new Error('unsupported_chain');
  return new ethers.providers.JsonRpcProvider(url);
}
module.exports = { getProvider };
