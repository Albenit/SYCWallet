import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import PageLayoutBeforeLogin from "../components/layouts/PageLayoutBeforeLogin";
import Steps from "../components/Steps";
import monexLogo from '../assets/monexLogo.png';

export default function CreateNewPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleNext = async () => {
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (!accepted) {
      setError("Please accept the Terms of Service to continue.");
      return;
    }

    const strongEnough = password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!strongEnough) {
      setError("Please meet the password rules before continuing.");
      return;
    }

    const wallet = ethers.Wallet.createRandom();
    const phrase = wallet.mnemonic?.phrase;

    if (!phrase) {
      setError("Could not generate a recovery phrase. Please try again.");
      return;
    }

    navigate("/secret-phrases", {
      state: {
        phrase: phrase,
        password: password
      },
      replace: true,
    });
  };

  return (
    <PageLayoutBeforeLogin >
      <div className="p-5 p-sm-8">
        <div className="flex flex-col items-center mb-6">
          <img src={monexLogo} alt="SYC Logo" className="h-12 w-auto" />
        </div>
        <h2 className="text-center text-[29px] mb-6 text-white">Create New Wallet</h2>
        <Steps selected={1} />
        <p className="text-[#EFEFEF7A] text-[13px] text-center mb-4 w-full">
          This password is used to protect your wallet and provide access to the browser extension.
        </p>

        <div className="mb-6">

          {/* Two Inputs Inline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            {/* New Password */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                New Password
              </label>

              <div className="relative ">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  placeholder="********"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-2 rounded-full 
                     bg-[#1a1525]/80 backdrop-blur-md
                     border border-white/10
                     text-white placeholder-gray-500
                     focus:outline-none focus:border-pink-500/50
                     transition"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2
                     text-[#E91E8C] text-[11px] font-medium cursor-pointer"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Confirm New Password
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  placeholder="********"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-5 py-2 rounded-full 
                     bg-[#1a1525]/80 backdrop-blur-md
                     border border-white/10
                     text-white placeholder-gray-500
                     focus:outline-none focus:border-pink-500/50
                     transition"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2
                     text-[#E91E8C] text-[11px] font-medium cursor-pointer"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

          </div>

          {/* Password Rules */}
          <ul className="text-xs mt-4 space-y-1">
            <li className={password.length >= 8 ? "text-[#DE0072]" : "text-[#EFEFEF7A]"}>
              • 8 or more characters
            </li>
            <li className={/[A-Z]/.test(password) ? "text-[#DE0072]" : "text-[#EFEFEF7A]"}>
              • At least one upper case character
            </li>
            <li className={/\d/.test(password) ? "text-[#DE0072]" : "text-[#EFEFEF7A]"}>
              • At least one digit
            </li>
            <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "text-[#DE0072]" : "text-[#EFEFEF7A]"}>
              • At least one symbol
            </li>
          </ul>

        </div>



        {error && (
          <p className="text-[#DE0072] text-xs text-center mb-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
            {error}
          </p>
        )}

        <div className="flex items-center gap-1 mb-3">

          {/* Custom Circle Checkbox */}
          <button
            type="button"
            onClick={() => setAccepted(!accepted)}
            className={`
      w-4 h-4 rounded-full border flex items-center justify-center
      transition-all duration-200
      ${accepted
                ? "border-[#DE0072] bg-[#DE0072]"
                : "border-gray-500 bg-transparent"
              }
    `}
          >
            {accepted && (
              <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
            )}
          </button>

          {/* Text */}
          <div className="text-[12px] text-gray-400">
            I have read and agree to the{" "}
            <span className="text-[#DE0072] cursor-pointer hover:underline">
              Terms of Service
            </span>
          </div>

        </div>

        <div className="flex items-center gap-1 pt-1">
          {/* Circular arrow icon */}
          <button
            type="button"
            onClick={() => handleNext()}
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
            onClick={() => handleNext()}
            type="submit"
            className="flex-1 rounded-full bg-gradient-to-r from-[#DE0072] to-[#c9175e] py-3 font-semibold text-white hover:opacity-90 transition disabled:opacity-60 cursor-pointer text-center"
          >
            Next
          </button>
        </div>

        <div className="flex items-center gap-1 pt-3">
          {/* Circular arrow icon */}
          <button
            type="button"
            onClick={() => navigate("/signup")}
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
