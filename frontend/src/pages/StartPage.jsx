import React, { useState } from "react";
import sycLogo from '../assets/syclogo.png';
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";

export default function StartPage() {
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API = "http://127.0.0.1:5000"; 

  async function signInWithWallet(wallet) {
    try {
      const addr = await wallet.getAddress ? await wallet.getAddress() : wallet.address;

      const nonceRes = await fetch(`${API}/api/auth/nonce`, {
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

      const verifyRes = await fetch(`${API}/api/auth/verify`, {
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

      localStorage.setItem("auth_token", data.token);
      return data;
    } catch (e) {
      throw e;
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    if (!address || !password) {
      setError("Address and password are required.");
      return;
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(address.trim())) {
      setError("Invalid Ethereum address format.");
      return;
    }

    setLoading(true);
    try {

      const encryptedJson = localStorage.getItem("encryptedWallet");
      if (!encryptedJson) {
        throw new Error("No local encrypted wallet found. Did you create this wallet on this browser?");
      }

      const wallet = await ethers.Wallet.fromEncryptedJson(encryptedJson, password);

      const walletAddress = wallet.address || (await wallet.getAddress());
      if (walletAddress.toLowerCase() !== address.trim().toLowerCase()) {
        throw new Error("Password does not match the encrypted wallet for this address.");
      }

      await signInWithWallet(wallet);

      navigate("/dashboard");
    } catch (err) {
        console.error(err);

        let msg = "Login failed. Please try again.";

        if (err.message.includes("No local encrypted wallet")) {
          msg ="⚠️ Wallet not found on this browser. Please create or import a wallet first.";
        } else if (err.message.includes("incorrect password")) {
          msg = "❌ Incorrect password. Please check and try again.";
        } else if (err.message.includes("does not match")) {  
          msg = "⚠️ The address and password you entered do not match.";
        } else if (err.message.toLowerCase().includes("network")) {
          msg = "🌐 Network error. Check your internet connection.";
        }

        setError(msg);
      }finally {
          setLoading(false);
        }
      }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#02010C] to-[#030313] text-white">
      <div className="p-8 rounded-[8px] max-w-xl w-full border border-gray-700 bg-[#0A0A1A]">
        <div className="flex flex-col items-center mb-6">
          <img src={sycLogo} alt="SYC Logo" className="h-16 w-auto" />
        </div>
        <div className="text-center mb-6">
          <span className="text-[23px]">Secure and Trusted SYC Wallet</span>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block mb-1 text-sm text-gray-300">Wallet Address</label>
            <input
              type="text"
              placeholder="0x..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-md bg-[#151928] px-4 py-3 text-sm text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm text-gray-300">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md bg-[#151928] px-4 py-3 text-sm text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && <div className="text-red-400 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 py-3 font-semibold hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? "Logging in…" : "Login"}
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
    </div>
  );
}
