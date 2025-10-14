import React, { useState } from "react";
import sycLogo from '../assets/syclogo.png';
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import PageLayout from "../components/layouts/PageLayout";
import CryptoJS from "crypto-js";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

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
    <PageLayout>
      <div className="p-5 p-sm-8">
        <div className="flex flex-col items-center mb-6">
          <img src={sycLogo} alt="SYC Logo" className="h-16 w-auto" />
        </div>
        <div className="text-center mb-6">
          <span className="text-[23px]">Secure and Trusted SYC Wallet</span>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded bg-[#02080E8C]   focus:outline-none"
            />
            <button
              type="button"
              className="absolute right-3 top-4 text-gray-400 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 py-3 font-semibold hover:bg-blue-700 transition disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Unlocking…" : "Unlock"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-4">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-blue-500 cursor-pointer hover:underline"
          >
            Sign Up
          </span>
        </p>

        <p className="text-center text-sm text-gray-400 mt-4 cursor-pointer" onClick={() => navigate("/import-wallet")}>
          Import Existing Wallet?
        </p>
      </div>
    </PageLayout>
  );
}
