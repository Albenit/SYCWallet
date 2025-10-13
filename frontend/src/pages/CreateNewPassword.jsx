import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import PageLayout from "../components/layouts/PageLayout";
import Steps from "../components/Steps";

export default function CreateNewPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleNext = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const strongEnough = password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!strongEnough) {
      alert("Please meet the password rules before continuing.");
      return;
    }

    const wallet = ethers.Wallet.createRandom();
    const phrase = wallet.mnemonic?.phrase;

    if (!phrase) {
      alert("Could not generate a recovery phrase. Please try again.");
      return;
    }

    navigate("/secret-phrases", {
      state: { 
        phrase:phrase,
        password: password
      },
      replace: true,
    });
  };

  return (
    <PageLayout>
      <div className="p-5 p-sm-8">
        <h2 className="text-center text-2xl font-semibold mb-6 text-white">Create New Wallet</h2>
        <Steps selected={1}/>
        <p className="text-[#EFEFEF7A] text-sm text-center mb-6">
          This password is used to protect your wallet and provide access to the browser extension.
        </p>

        <div className="mb-4 text-left">
          <label className="block text-[16px] font-[700] mb-2">New Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded bg-[#02080E8C]   focus:outline-none"
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-gray-400"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <ul className="text-xs text-gray-400 mt-3 space-y-1">
            <li className={password.length >= 8 ? "text-green-400" : "text-[#EFEFEF7A]"}>• 8 or more characters</li>
            <li className={/[A-Z]/.test(password) ? "text-green-400" : "text-[#EFEFEF7A]"}>• At least one upper case character</li>
            <li className={/\d/.test(password) ? "text-green-400" : "text-[#EFEFEF7A]"}>• At least one digit</li>
            <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "text-green-400" : "text-[#EFEFEF7A]"}>• At least one symbol</li>
          </ul>
        </div>

        <div className="mb-6 text-left">
          <label className="block text-[16px] font-[700] mb-2">Confirm New Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 rounded bg-[#02080E8C] focus:outline-none"
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

        <div className="text-[15px] text-gray-400 mb-6 text-center">
          I have read and agree to the{" "}
          <a href="#" className="text-blue-400 underline">
            Terms of Service
          </a>
          .
        </div>

        <div className="flex justify-between w-full">
          <button className="px-6 py-2 cursor-pointer w-full font-[700]" onClick={() => navigate("/signup")}>Back</button>
          <button className="px-6 py-2 rounded bg-gradient-to-r from-[#3045FFCF] to-[#3045FF] hover:bg-blue-500 cursor-pointer w-full font-[700]" onClick={() => handleNext()}>Next</button>
        </div>
      </div>
    </PageLayout>
  );
}
