import React, { useState } from "react";
import sycLogo from '../assets/syclogo.png';
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/layouts/PageLayout";

export default function Signup() {
  const [accepted, setAccepted] = useState(false);
  const navigate = useNavigate();

  return (

    <PageLayout>
      <div className="p-5 p-sm-8 text-center">
        <div className="text-[26px] font-bold mb-2">Let’s get Started</div>
        <p className="text-gray-400 text-[18px] text-sm mb-6 max-w-[500px] mx-auto">
          Trusted by millions, Smart Yield Coin is a secure wallet making the
          world of web3 accessible to all.
        </p>

        <div className="flex flex-col items-center mb-6">
          <img src={sycLogo} alt="SYC Logo" className="h-16 w-auto" />
        </div>

        <div className="flex justify-center space-x-2 mb-6">
          <span className="w-3 h-3 rounded-full bg-white"></span>
          <span className="w-3 h-3 rounded-full border border-white"></span>
          <span className="w-3 h-3 rounded-full border border-white"></span>
        </div>

        <div className="flex items-center justify-center space-x-2 mb-3">
          <input
            id="terms"
            type="checkbox"
            className="w-4 h-4"
            checked={accepted}
            onChange={() => setAccepted(!accepted)}
          />
          <label htmlFor="terms" className="text-[13px] text-gray-300">
            I agree to SYC’s Terms of use
          </label>
        </div>

        <div className="space-y-4 flex flex-col justify-center items-center">
          <button
            onClick={() => navigate("/createnewpassword")}
            disabled={!accepted}
            className={`w-xs py-3 rounded-lg font-medium transition bg-gradient-to-r from-blue-400 to-blue-600 hover:opacity-90 ${!accepted ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            Create a new wallet
          </button>
          <div className="inline-block p-[1px] rounded-lg  border border-[#07F1EF] ">
            <button className="w-xs py-3 rounded-lg font-medium bg-transparent  text-white hover:bg-white/2 transition cursor-pointer" onClick={() => navigate("/import-wallet")}>
              Import an existing wallet
            </button>
          </div>
        </div>
      </div>
    </PageLayout>


  );
}
