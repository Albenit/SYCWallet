import { useState } from "react";
import { ArrowRight, ChevronRight, MoveRight, ArrowBigRight } from "lucide-react";
import SwapChainModal from "./partials/SwapChainModal";
import SwapTokenModal from "./partials/SwapTokenModal";

export default function SwapTab() {
  const [fromChain, setFromChain] = useState({
    key: "ethereum", 
    label: "Ethereum",
    nativeSymbol: "ETH",
    decimals: 18,  
    chainId: 1,
    logo: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
  });

  const [toChain, setToChain] = useState({
    key: "polygon", 
    label: "Polygon",
    nativeSymbol: "MATIC",
    decimals: 18, 
    chainId: 137,
    logo: "https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png",
  });


  const [fromToken, setFromToken] = useState({
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    symbol: "USDT",
    decimals: 6,
    binanceSymbol: "USDTUSDT",     
    logo: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
  });

  const [toToken, setToToken] = useState({
    address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",        
    symbol: "USDC",
    decimals: 6,
    binanceSymbol: "USDCUSDT  ",     
    logo: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png",
  });


  const [fromAmount, setFromAmount] = useState(""); 
  const [toAmount, setToAmount] = useState("");
  const [swapping, setSwapping] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [selecting, setSelecting] = useState<"from" | "to" | null>(null);

  const handleSwap = () => {
    setSwapping(true);
    setTimeout(() => {
      setToAmount(fromAmount);
      setSwapping(false);
    }, 1000);
  };

  const swapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);

    setFromChain(toChain)
    setToChain(fromChain)

    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  return (
    <div className="space-y-4 max-w-sm mx-auto">
      <div className="bg-[#02080E8C] rounded-xl p-4 mb-0">
        <div className="flex items-center gap-2 mb-3 ">
          <p className="text-sm text-gray-400">From</p>
          <img src={fromChain.logo} alt="" width={15} height={15} />
          <div className="flex items-center cursor-pointer"
            onClick={() => {
              setSelecting("from");
              setIsModalOpen(true);
            }}>
            <span>{fromChain.label}</span>
            <ChevronRight size={20} className="opacity-60 pt-1" />      
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
              <img src={fromToken.logo} alt="" width={25} height={25}/>
                <div className="flex items-center cursor-pointer"
                  onClick={() => {  
                    setSelecting("from");
                    setIsTokenModalOpen(true);
                  }}>
                  <span>{fromToken.symbol}</span>
                  <ChevronRight 
                    size={18}
                    className="opacity-60 group-hover:opacity-100"
                  />
              </div>
          </div>
          <input
            type="number"
            placeholder="0"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
            className="w-24 text-right bg-transparent text-white text-sm focus:outline-none"
          />
        </div>
      </div>

      <div className="flex justify-center -my-2 z-10 relative">
        <button
          className="bg-[#02080E8C] p-2 rounded-full border border-white/10 hover:bg-white/2 transition cursor-pointer"
          onClick={swapTokens}
        >
          ⇅
        </button>
      </div>

      {/* TO */}
      <div className="bg-[#02080E8C] rounded-xl p-4 ">
        <div className="flex items-center gap-2 mb-3">
          <p className="text-sm text-gray-400">To</p>
          <img src={toChain.logo} alt="" width={15} height={15} />
          <div className="flex items-center cursor-pointer"
            onClick={() => {
              setSelecting("to");
              setIsModalOpen(true);
            }}>
            <span>{toChain.label}</span>
            <ChevronRight size={20} className="opacity-60 pt-1" />      
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={toToken.logo} alt="" width={25} height={25} />
              <div className="flex items-center cursor-pointer"
                onClick={() => {
                  setSelecting("to");
                  setIsTokenModalOpen(true);
                }}>
                <span>{toToken.symbol}</span>
                <ChevronRight
                  size={18}
                  className="opacity-60 group-hover:opacity-100"
                />
              </div>
          </div>
          <input
            type="number"
            placeholder="0"
            value={toAmount}
            readOnly
            className="w-24 text-right bg-transparent text-gray-400 text-sm focus:outline-none"
          />
        </div>
      </div>  

      <button
        disabled={!fromAmount || swapping}
        onClick={handleSwap}
        className={`w-full rounded-full py-3 transition bg-blue-600 hover:bg-blue-700 cursor-pointer font-[700] `}
      >
        {swapping ? "Swapping..." : "Swap"}
      </button>

      <SwapChainModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(chain: any) => {
          if (selecting === "from") setFromChain(chain);
          if (selecting === "to") setToChain(chain);
        }}
      />

      <SwapTokenModal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        chainKey={selecting === "from" ? fromChain.key : toChain.key}
        onSelect={(token: any) => {
          if (selecting === "from") setFromToken(token);
          if (selecting === "to") setToToken(token);
        }}
      />
    </div>
  );
}
