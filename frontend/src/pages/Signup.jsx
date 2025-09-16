import React, { useState } from "react";
import sycLogo from '../assets/syclogo.png';
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [accepted, setAccepted] = useState(false);
const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#02010C] to-[#030313] text-white">
      <div className="p-8 rounded-[8px] max-w-xl w-full text-center border border-gray-700 bg-[#0A0A1A]">
        {/* Title */}
        <div className="text-[26px] font-bold mb-2">Let’s get Started</div>
        <p className="text-gray-400 text-[18px] text-sm mb-6">
          Trusted by millions, Smart Yield Coin is a secure wallet making the
          world of web3 accessible to all.
        </p>

        {/* Logo */} 
      <div className="flex flex-col items-center mb-6">
        <img src={sycLogo} alt="SYC Logo" className="h-16 w-auto" />
      </div>
        {/* Progress dots */}
        <div className="flex justify-center space-x-2 mb-6">
          <span className="w-3 h-3 rounded-full bg-white"></span>
          <span className="w-3 h-3 rounded-full border border-white"></span>
          <span className="w-3 h-3 rounded-full border border-white"></span>
        </div>

        {/* Terms of use */}
        <div className="flex items-center justify-center space-x-2 mb-6">
          <input
            id="terms"
            type="checkbox"
            className="w-4 h-4"
            checked={accepted}
            onChange={() => setAccepted(!accepted)}
          />
          <label htmlFor="terms" className="text-xs text-gray-300">
            I agree to SYC’s Terms of use
          </label>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate("/createnewpassword")}
            disabled={!accepted}
            className={`w-xs py-3 rounded-lg font-medium transition bg-gradient-to-r from-blue-400 to-blue-600 hover:opacity-90 ${!accepted ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            Create a new wallet
          </button>
          <div className="inline-block p-[1px] rounded-lg bg-gradient-to-r from-[#07F1EF] to-[#2F4AFE]">
            <button className="w-xs py-3 rounded-lg font-medium bg-[#030313] text-white hover:bg-gray-800 transition" onClick={() => navigate("/import-wallet")}>
              Import an existing wallet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
