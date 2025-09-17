import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ClipboardCopy from '../assets/svg/copyToClipBoard.svg';


export default function SecretPhrases() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isNextButtonEnable, setNextButtonEnable] = useState(false);

  const rawMnemonic =
    (location.state && (location.state).mnemonic) ||
    (typeof window !== "undefined" ? sessionStorage.getItem("tmp_secret_phrase") : "") ||
    "";

  const words = useMemo(() => {
    const arr = rawMnemonic
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (arr.length < 12) {
      while (arr.length < 12) arr.push("");
    }
    return arr.slice(0, 12);
  }, [rawMnemonic]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(words.join(" "));
    } catch (e) {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = words.join(" ");
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  };

  const showPharse = () => {
    setNextButtonEnable(true);
  }

  const handleNext = () => {
    navigate("/confirm-secret-phrase", { state: { mnemonic: words.join(" ") } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#02010C] to-[#030313] text-white">
      <div className="p-8 rounded-[8px] max-w-xl w-full text-center border border-gray-700 bg-[#0A0A1A]">
        {/* Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-gray-500 text-gray-400">1</div>
            <span className="text-gray-400 text-sm mt-2">Set Password</span>
          </div>
          <div className="w-12 h-[1px] bg-gray-600" />
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center rounded-full border border-blue-500 text-blue-500">2</div>
            <span className="text-blue-400 text-sm mt-2">Secure Wallet</span>
          </div>
          <div className="w-12 h-[1px] bg-gray-600" />
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-500 text-gray-400">3</div>
            <span className="text-gray-400 text-sm mt-2">
              Confirm Security<br />Recovery Phrase
            </span>
          </div>
        </div>

        <div className="text-[22px] font-bold mb-2">Back up Your Secret Phrases</div>
        <p className="text-gray-400 text-[18px] mb-6">
          Back up these 12 words on paper and never share them with anyone.
        </p>

        {/* Phrase grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {words.map((w, i) => (
            <div
              key={i}
              className="flex items-center justify-start px-4 py-3 rounded-md bg-[#151528] border border-[#2B2B45] text-left"
            >
              <span className="inline-flex items-center justify-center text-xs font-semibold mr-3 w-6 h-6 rounded-full bg-[#0E0E1F] border border-[#2B2B45] text-gray-300">
                {i + 1}
              </span>
              <span
                className={`
                    text-sm transition 
                    ${w ? "text-gray-100" : "text-gray-500"} 
                    ${!isNextButtonEnable ? "blur-sm select-none" : "blur-0"}
                    `}
              >
                {w || "••••••"}
              </span>
            </div>
          ))}
        </div>

        {/* Copy action */}
        {isNextButtonEnable && (
          <button
            onClick={handleCopy}
            className="mx-auto mb-8 flex items-center gap-2 text-sm text-gray-300 hover:text-white transition cursor-pointer"
          >
            <img src={ClipboardCopy} alt="" />
            Copy to Clipboard
          </button>
        )}

        {/* Nav buttons */}
        <div className="flex justify-between">
          <button
            className="px-6 py-2 w-md rounded text-gray-200 cursor-pointer"
            onClick={() => navigate("/signup")}
          >
            Back
          </button>

          {isNextButtonEnable == false ? (
            <button
              className="px-6 py-2 w-md rounded bg-blue-600 hover:bg-blue-500 cursor-pointer"
              onClick={showPharse}
            >
              Show
            </button>
          ) : (
            <button
              className="px-6 py-2  w-md rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
              onClick={handleNext}
              disabled={words.filter(Boolean).length !== 12}
            >
              Next
            </button>
          )}

        </div>
      </div>
    </div>
  );
}
