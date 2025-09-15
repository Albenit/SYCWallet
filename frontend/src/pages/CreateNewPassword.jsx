import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";

export default function CreateNewPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleNext = async () => {
    // Basic checks
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const strongEnough =
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /\d/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password);
    if (!strongEnough) {
      alert("Please meet the password rules before continuing.");
      return;
    }

    // Create wallet + encrypt with the provided password
    const wallet = ethers.Wallet.createRandom();
    const phrase = wallet.mnemonic?.phrase;     

    if (!phrase) {
      alert("Could not generate a recovery phrase. Please try again.");
      return;
    }

    const encryptedJson = await wallet.encrypt(password);
    localStorage.setItem("encryptedWallet", encryptedJson);
    localStorage.setItem("walletAddress", wallet.address);

    sessionStorage.setItem("tmp_secret_phrase", phrase);

    // Navigate and pass phrase in memory state
    navigate("/secret-phrases", {
      state: { phrase, address: wallet.address },
      replace: true,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#02010C] to-[#030313] text-white">
      <div className="p-8 rounded-[8px] max-w-xl w-full border border-gray-700 bg-[#0A0A1A]">
        <h2 className="text-center text-2xl font-semibold mb-6 text-white">Create New Wallet</h2>
        <div className="flex items-center justify-center  mb-8">
            <div className="flex flex-col items-center">
                <div className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-blue-500 text-blue-500">
                1
                </div>
                <span className="text-blue-400 text-sm mt-2">Set Password</span>
            </div>

            <div className="w-12 h-[1px] bg-gray-600"></div>
            <div className="flex flex-col items-center">
                <div className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-500 text-gray-400">
                2
                </div>
                <span className="text-gray-400 text-sm mt-2">Secure Wallet</span>
            </div>
            <div className="w-12 h-[1px] bg-gray-600"></div>
            <div className="flex flex-col items-center">
                <div className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-500 text-gray-400">
                3
                </div>
                <span className="text-gray-400 text-sm mt-2">Confirm Security<br/>Recovery Phrase</span>
            </div>
        </div>
        <p className="text-gray-400 text-sm mb-6">
          This password is used to protect your wallet and provide access to the browser extension.
        </p>

        <div className="mb-4 text-left">
          <label className="block text-sm mb-2">New Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded bg-[#12122A] border border-gray-700 focus:outline-none"
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-gray-400"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Password Rules */}
          <ul className="text-xs text-gray-400 mt-3 space-y-1">
            <li className={password.length >= 8 ? "text-green-400" : ""}>• 8 or more characters</li>
            <li className={/[A-Z]/.test(password) ? "text-green-400" : ""}>• At least one upper case character</li>
            <li className={/\d/.test(password) ? "text-green-400" : ""}>• At least one digit</li>
            <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "text-green-400" : ""}>• At least one symbol</li>
          </ul>
        </div>

        {/* Confirm Password */}
        <div className="mb-6 text-left">
          <label className="block text-sm mb-2">Confirm New Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 rounded bg-[#12122A] border border-gray-700 focus:outline-none"
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-gray-400"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Terms */}
        <div className="text-sm text-gray-400 mb-6 text-left">
          I have read and agree to the{" "}
          <a href="#" className="text-blue-400 underline">
            Terms of Service
          </a>
          .
        </div>

        {/* Buttons */}
        <div className="flex justify-between">
          <button className="px-6 py-2 cursor-pointer" onClick={() => navigate("/")}>Back</button>
          <button className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-500 cursor-pointer" onClick={() => handleNext()}>Next</button>
        </div>
      </div>
    </div>
  );
}
