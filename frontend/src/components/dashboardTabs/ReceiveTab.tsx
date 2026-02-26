import QRCode from "react-qr-code";
import { Copy } from "lucide-react";

interface ReceiveTabProps {
  address: string | null;
  handleCopy: () => void;
  copied: boolean;
}

export default function ReceiveTab({ address, handleCopy, copied}: ReceiveTabProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <p className="text-sm text-[#767676]">Your Ethereum Address</p>

      {/* QR + Address row */}
      <div className="flex items-center gap-5 bg-[#121212] p-4 rounded-2xl">
        {/* QR Code */}
        <div className="shrink-0 rounded-xl overflow-hidden">
          <QRCode value={address || "0x..."} size={120} bgColor="#0A0A1A" fgColor="#ffffff" />
        </div>

        {/* Address + Copy */}
        <div className="flex flex-1 items-center gap-3 min-w-0 bg-[#1A1A1A] p-3 rounded-lg">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#DE0072] mb-1">Your Ethereum Address</p>
            <p className="text-sm text-white break-all leading-relaxed">
              {address || "0x..."}
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="shrink-0 flex items-center justify-center h-9 w-9 rounded-lg bg-[#1A1A1A] hover:bg-[#252525] transition-colors"
          >
            {copied ? (
              <span className="text-[10px] text-[#DE0072]">Done</span>
            ) : (
              <Copy size={18} color="#DE0072" className="opacity-70 hover:opacity-100 cursor-pointer" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
