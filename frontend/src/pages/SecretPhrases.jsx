import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ClipboardCopy from '../assets/svg/copyToClipBoard.svg';
import PageLayout from "../components/layouts/PageLayout";
import Steps from "../components/Steps";


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
    } catch {
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
    <PageLayout>
      <div className="p-5 p-sm-8">
        <Steps selected={2} />

        <div className="text-[22px] font-bold mb-2 text-center">Back up Your Secret Phrases</div>
        <p className="text-[#EFEFEF7A] text-[16px] mb-6 text-center">
          Back up these 12 words on paper and never share them with anyone.
        </p>
        <div className="px-13">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {words.map((w, i) => (
              <div
                key={i}
                className="flex items-center justify-start px-3 py-2 rounded-md bg-[#2E2E2FB2] border border-[#2B2B45] text-left"
              >
                <span className="inline-flex items-center justify-center text-xs font-semibold mr-1 w-6 h-6 text-gray-300">
                  {i + 1} .
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

          {isNextButtonEnable && (
            <button
              onClick={handleCopy}
              className="mx-auto mb-8 flex items-center gap-2 text-sm text-gray-300 hover:text-white transition cursor-pointer"
            >
              <img src={ClipboardCopy} alt="" />
              Copy to Clipboard
            </button>
          )}

        </div>

        <div className="flex justify-between">
          <button
            className="px-6 py-2 w-md rounded text-gray-200 font-[700] cursor-pointer"
            onClick={() => navigate("/signup")}
          >
            Cancel
          </button>

          {isNextButtonEnable == false ? (
            <button
              className="px-6 py-2 w-md rounded bg-blue-600 hover:bg-blue-500 cursor-pointer font-[700]"
              onClick={showPharse}
            >
              Show
            </button>
          ) : (
            <button
              className="px-6 py-2 w-md rounded bg-gradient-to-r from-[#3045FFCF] to-[#3045FF] hover:bg-blue-500 disabled:opacity-50 cursor-pointer font-[700]"
              onClick={handleNext}
              disabled={words.filter(Boolean).length !== 12}
            >
              Next
            </button>
          )}

        </div>
      </div>
    </PageLayout>
  );
}
