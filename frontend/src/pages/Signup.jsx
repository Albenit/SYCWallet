import React, { useState } from "react";
import monexLogo from '../assets/monexLogo.png';
import { useNavigate } from "react-router-dom";
import PageLayoutBeforeLogin from "../components/layouts/PageLayoutBeforeLogin";

export default function Signup() {
  const [accepted, setAccepted] = useState(false);
  const navigate = useNavigate();

  return (

    <PageLayoutBeforeLogin maxWidth="700px">
      <div className="p-5 p-sm-8 text-center">
        <div className="flex flex-col items-center mb-6">
          <img src={monexLogo} alt="SYC Logo" className="h-12 w-auto" />
        </div>
        <div className="text-[36px] mb-2">Let’s get Started</div>
        <p className="text-gray-400 text-[12px] text-sm mb-6 max-w-[400px] mx-auto">
          Trusted by millions, Monex Protocol is a secure wallet making the world
          of web3 accessible to all.
        </p>

        <div className="flex items-center gap-1 pt-1">
          {/* Circular arrow icon */}
          <button
            type="button"
            onClick={() => navigate("/createnewpassword")}
            className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-[#DE0072] to-[#c9175e] flex items-center justify-center hover:opacity-90 transition cursor-pointer"
            title="Import wallet"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 14L20 9L15 4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M4 20V13C4 11.9391 4.42143 10.9217 5.17157 10.1716C5.92172 9.42143 6.93913 9 8 9H20" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>

          {/* Unlock button */}
          <button
            onClick={() => navigate("/createnewpassword")}
            type="submit"
            className="flex-1 rounded-full bg-gradient-to-r from-[#DE0072] to-[#c9175e] py-3 font-semibold text-white hover:opacity-90 transition disabled:opacity-60 cursor-pointer text-center"
          >
            Create a new wallet
          </button>
        </div>

        <div className="flex items-center gap-1 pt-3">
          {/* Circular arrow icon */}
          <button
            type="button"
            onClick={() => navigate("/import-wallet")}
            className="flex-shrink-0 w-12 h-12 rounded-full bg-[#1A1A1A] flex items-center justify-center hover:opacity-90 transition cursor-pointer"
            title="Import wallet"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 14L4 9L9 4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M20 20V13C20 11.9391 19.5786 10.9217 18.8284 10.1716C18.0783 9.42143 17.0609 9 16 9H4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>

          </button>

          {/* Unlock button */}
          <button
            onClick={() => navigate("/import-wallet")}
            type="submit"
            className="flex-1 rounded-full bg-[#1A1A1A] py-3 font-semibold text-white hover:opacity-90 transition disabled:opacity-60 cursor-pointer text-center"
          >
            Import an existing wallet
          </button>
        </div>
      </div>
    </PageLayoutBeforeLogin>


  );
}
