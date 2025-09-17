import QRCode from "react-qr-code";
import { Copy } from "lucide-react";

interface ReceiveTabProps {
  address: string | null;
  handleCopy: () => void;
}

export default function ReceiveTab({ address, handleCopy }: ReceiveTabProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <QRCode value={address || "0x..."} size={160} bgColor="#0A0A1A" fgColor="#ffffff" />
      <p className="text-sm text-gray-400">Your Address</p>
      <div className="flex items-center gap-2 bg-[#151928] px-3 py-2 rounded-md">
        <span className="text-xs break-all">{address || "0x..."}</span>
        <button onClick={handleCopy}>
          <Copy size={14} className="opacity-60 hover:opacity-100" />
        </button>
      </div>
    </div>
  );
}
