import React, { useState } from "react";
import monexLogo from '../assets/monexLogo.png';
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import PageLayoutBeforeLogin from "../components/layouts/PageLayoutBeforeLogin";
import CryptoJS from "crypto-js";
import { useAuth } from "../context/AuthContext";

export default function StartPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);


  const API = import.meta.env.VITE_API_URL;

  async function signInWithWallet(wallet) {
    const addr = (wallet.getAddress ? await wallet.getAddress() : wallet.address);

    const nonceRes = await fetch(`${API}/auth/nonce`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: addr }),
      credentials: "include",
    });

    if (!nonceRes.ok) {
      const t = await nonceRes.text().catch(() => "");
      throw new Error(t || "Could not get nonce");
    }
    const { nonce } = await nonceRes.json();

    const message = `Sign in to YourApp\nAddress: ${addr}\nNonce: ${nonce}`;
    const signature = await wallet.signMessage(message);

    const verifyRes = await fetch(`${API}/auth/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: addr, message, signature }),
      credentials: "include",
    });

    if (!verifyRes.ok) {
      const t = await verifyRes.text().catch(() => "");
      throw new Error(t || "Verification failed");
    }
    const data = await verifyRes.json();

    login(data.token);

    return data;
  }

  async function handleLogin(e) {
    e.preventDefault();
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    setLoading(true);
    try {
      const encryptedJson = localStorage.getItem("encryptedWallet");
      if (!encryptedJson) {
        throw new Error("No local encrypted wallet found. Did you create this wallet on this browser?");
      }

      const wallet = await ethers.Wallet.fromEncryptedJson(encryptedJson, password);

      //Password trolling with this name
      const secret = import.meta.env.VITE_ENCRYPT_KEY;
      // fixed secret key
      const ciphertext = CryptoJS.AES.encrypt(password, secret).toString();
      sessionStorage.setItem("c_aP", ciphertext);

      await signInWithWallet(wallet);

      navigate("/dashboard");
    } catch (err) {

      let msg = "Login failed. Please try again.";

      if (err.message.includes("No local encrypted wallet")) {
        msg = "⚠️ Wallet not found on this browser. Please create or import a wallet first.";
      } else if (err.message.includes("incorrect password")) {
        msg = "❌ Incorrect password. Please check and try again.";
      } else if (err.message.includes("does not match")) {
        msg = "⚠️ The address and password you entered do not match.";
      } else if (err.message.toLowerCase().includes("network")) {
        msg = "🌐 Network error. Check your internet connection.";
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageLayoutBeforeLogin maxWidth="700px">
      <div className="p-8 sm:p-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src={monexLogo} alt="SYC Logo" className="h-12 w-auto" />
        </div>

        {/* Title */}
        <h1 className="text-center text-2xl sm:text-[34px] font-semibold tracking-wide mb-8">
          Secure and Trusted Monex Wallet
        </h1>

        <form className="space-y-5" onSubmit={handleLogin}>
          {/* Password label */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="********"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-[30px] bg-[#1A1A1A] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 transition"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#E91E8C] text-sm hover:text-[#E91E8C]-300 transition cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && <div className="text-[#DE0072] text-sm">{error}</div>}

          {/* Unlock button row */}
          <div className="flex items-center gap-1 pt-1">
            {/* Circular arrow icon */}
            <button
              type="submit"
              disabled={loading}
              className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-[#DE0072] to-[#c9175e] flex items-center justify-center hover:opacity-90 transition cursor-pointer"
              title="Import wallet"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 14L20 9L15 4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M4 20V13C4 11.9391 4.42143 10.9217 5.17157 10.1716C5.92172 9.42143 6.93913 9 8 9H20" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>

            </button>

            {/* Unlock button */}
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-full bg-gradient-to-r from-[#DE0072] to-[#c9175e] py-3 font-semibold text-white hover:opacity-90 transition disabled:opacity-60 cursor-pointer text-center"
            >
              {loading ? "Unlocking…" : "Unlock"}
            </button>
          </div>
        </form>

        {/* Bottom link */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Can't login? You can{" "}

          <span
            onClick={() => navigate("/signup")}
            className="text-[#E91E8C] cursor-pointer hover:underline"
          >
            SignUp
          </span>
          {" "}or{" "}
          <span
            onClick={() => navigate("/import-wallet")}
            className="text-[#E91E8C] cursor-pointer hover:underline"
          >
            Import
          </span>{" "}
          your wallet
        </p>
      </div>
    </PageLayoutBeforeLogin>
  );
}
