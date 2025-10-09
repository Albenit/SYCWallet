import Swal from "sweetalert2";


export function isCrossChainSupported(fromChainKey: string, toChainKey: string): boolean {
  if (!fromChainKey || !toChainKey) return false;

  if (fromChainKey.toUpperCase() === toChainKey.toUpperCase()) return true;

  const thorchainSupported = ["BTC", "ETH", "BNB", "AVAX", "LTC", "BCH", "DOGE", "ATOM"];

  const fromOK = thorchainSupported.includes(fromChainKey.toUpperCase());
  const toOK = thorchainSupported.includes(toChainKey.toUpperCase());
  return fromOK && toOK;
}

export function ensureSupportedSwap(fromChainKey: string, toChainKey: string): boolean {
  const supported = isCrossChainSupported(fromChainKey, toChainKey);
  if (!supported) {
    Swal.fire({
      title: "Cross-chain route not supported",
      text: `Swapping from ${fromChainKey} → ${toChainKey} is not supported by SwapKit.`,
      icon: "info",
      background: "#02010C",
      color: "#fff",
    });
  }
  return supported;
}
