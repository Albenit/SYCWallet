import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ClipboardCopy from '../assets/svg/copyToClipBoard.svg';
import PageLayoutBeforeLogin from "../components/layouts/PageLayoutBeforeLogin";
import Steps from "../components/Steps";
import { Copy } from "lucide-react";


export default function SecretPhrases() {
  const navigate = useNavigate();
  const location = useLocation();
  const [copied, setCopied] = useState(false);
  const [isNextButtonEnable, setNextButtonEnable] = useState(false);

  const password = location.state.password;
  const rawPhrase = location.state.phrase;

  const words = useMemo(() => {
    const arr = rawPhrase
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (arr.length < 12) {
      while (arr.length < 12) arr.push("");
    }
    return arr.slice(0, 12);
  }, [rawPhrase]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(words.join(" "));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const showPharse = () => {
    handleCopy();
    setNextButtonEnable(true);
  }

  const handleNext = () => {
    navigate("/confirm-secret-phrase", {
      state: {
        phrase: rawPhrase,
        password: password
      }
    });
  };

  return (
    <PageLayoutBeforeLogin>
      <div className="p-5 p-sm-8">
        <div className="text-[32px] mb-4 text-center">Back up Your Secret Phrases</div>
        <Steps selected={2} />

        <div className="flex gap-2 border border-[#FFC77333] bg-[#1A1A1A] rounded-full ps-3 py-2 mb-6 items-center">
          <span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#FFC773" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M12 8V12" stroke="#FFC773" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M12 16H12.01" stroke="#FFC773" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>

          <p className="text-[#EFEFEF7A] text-[12px]">
            Back up these 12 words on paper and never share them with anyone.
          </p>
        </div>

        <div className="">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 bg-[#1A1A1A] p-3 rounded-xl">
            {words.map((w, i) => (
              <div
                key={i}
                className="flex items-center justify-center px-3 py-2 rounded-full bg-[#121212] border border-[#121212] text-left"
              >
                <span
                  className={`
                        text-sm transition items-center  
                        ${w ? "text-gray-100" : "text-gray-500"} 
                        `}
                >
                  {!isNextButtonEnable ? "*********" : w}
                </span>
              </div>
            ))}
          </div>
          {isNextButtonEnable && (
            <button className="mx-auto mb-2 flex items-center">
              {copied && (
                <span className="text-xs text-[#DE0072]">Copied!</span>
              )}
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 pt-1">
          <button
            onClick={showPharse}
            type="submit"
            className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-[#DE0072] to-[#c9175e] flex items-center justify-center hover:opacity-90 transition cursor-pointer"
            title="Import wallet"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.06202 12.3479C1.97868 12.1234 1.97868 11.8764 2.06202 11.6519C2.87372 9.68373 4.25153 8.00091 6.02079 6.81677C7.79004 5.63263 9.87106 5.00049 12 5.00049C14.129 5.00049 16.21 5.63263 17.9792 6.81677C19.7485 8.00091 21.1263 9.68373 21.938 11.6519C22.0214 11.8764 22.0214 12.1234 21.938 12.3479C21.1263 14.316 19.7485 15.9988 17.9792 17.183C16.21 18.3671 14.129 18.9993 12 18.9993C9.87106 18.9993 7.79004 18.3671 6.02079 17.183C4.25153 15.9988 2.87372 14.316 2.06202 12.3479Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>

          </button>

          {isNextButtonEnable == false ? (
            <button
              onClick={showPharse}
              type="submit"
              className="flex-1 rounded-full bg-gradient-to-r from-[#DE0072] to-[#c9175e] py-3 font-semibold text-white hover:opacity-90 transition disabled:opacity-60 cursor-pointer text-center"
            >
              Show and Copy to Clipboard
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={words.filter(Boolean).length !== 12}
              type="submit"
              className="flex-1 rounded-full bg-gradient-to-r from-[#DE0072] to-[#c9175e] py-3 font-semibold text-white hover:opacity-90 transition disabled:opacity-60 cursor-pointer text-center"
            >
              Next
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 pt-3">
          <button
            onClick={() => navigate("/signup")}
            type="submit"
            className="flex-shrink-0 w-12 h-12 rounded-full bg-[#1A1A1A] flex items-center justify-center hover:opacity-90 transition cursor-pointer"
            title="Import wallet"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 14L4 9L9 4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M20 20V13C20 11.9391 19.5786 10.9217 18.8284 10.1716C18.0783 9.42143 17.0609 9 16 9H4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>

          </button>
          <button
            onClick={() => navigate("/signup")}
            type="submit"
            className="flex-1 rounded-full bg-[#1A1A1A] py-3 font-semibold text-white hover:opacity-90 transition disabled:opacity-60 cursor-pointer text-center"
          >
            Back
          </button>
        </div>
      </div>
    </PageLayoutBeforeLogin>
  );
}
