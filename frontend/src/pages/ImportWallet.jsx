// ImportWallet.jsx
import React, { useState } from "react";
import sycLogo from "../assets/syclogo.png";
import { useNavigate } from "react-router-dom";
import { Wallet } from "ethers";

const API = "http://127.0.0.1:5000"; // adjust for prod

export default function ImportWallet({ onImport /* optional callback (type, value) => void */ }) {
  const [tab, setTab] = useState("private"); // "private" | "seed"
  const [value, setValue] = useState("");
  const [password, setPassword] = useState(""); // used to encrypt JSON locally
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const placeholder =
    tab === "private"
      ? "Enter your private key here"
      : "Enter your 12/24 - word seed phrase here";

  // helper: sign-in with wallet instance (nonce -> sign -> verify)
  async function signInWithWalletInstance(walletInstance) {
    const addr = (walletInstance.address || (await walletInstance.getAddress())).toLowerCase();

    const nonceRes = await fetch(`${API}/api/auth/nonce`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: addr }),
      credentials: "include",
    });
    if (!nonceRes.ok) {
      const t = await nonceRes.text().catch(() => "");
      throw new Error(t || "Could not get nonce from server");
    }
    const { nonce } = await nonceRes.json();

    const message = `Sign in to YourApp\nAddress: ${addr}\nNonce: ${nonce}`;
    const signature = await walletInstance.signMessage(message);

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

    if (data?.token) localStorage.setItem("auth_token", data.token);
    return { addr, data };
  }

  async function handleImport(e) {
    e.preventDefault();
    setError("");
    if (!value || !password) {
      setError("Both the key/phrase and an encryption password are required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      let wallet;

      if (tab === "private") {
        const pk = value.trim();
        if (!/^0x[a-fA-F0-9]{64}$/.test(pk)) {
          throw new Error("Invalid private key. It must start with 0x and be 64 hex chars.");
        }
        wallet = new Wallet(pk);
      } else {
        const phrase = value.trim().toLowerCase().split(/\s+/).join(" ");
        const words = phrase.split(" ");
        if (words.length < 12) {
          throw new Error("Seed phrase too short — expected 12 or 24 words.");
        }

        try {
          wallet = Wallet.fromMnemonic ? Wallet.fromMnemonic(phrase) : Wallet.fromPhrase(phrase);
        } catch (err) {
          throw new Error("Invalid seed phrase. Check spelling and order.");
        }
      }

      const address = (wallet.address || (await wallet.getAddress())).toLowerCase();

      const encryptedJson = await wallet.encrypt(password);
      localStorage.setItem("encryptedWallet", encryptedJson);
      localStorage.setItem("wallet_address", address);

      await signInWithWalletInstance(wallet);

      if (typeof onImport === "function") onImport(tab, address);

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err?.message || "Import failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#02010C] to-[#030313] text-white px-4">
      <div className="p-8 rounded-[8px] max-w-xl w-full border border-gray-700 bg-[#0A0A1A]">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <img src={sycLogo} alt="SYC Logo" className="h-16 w-auto" />
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center gap-12 mb-6">
          <button
            type="button"
            onClick={() => setTab("private")}
            className={`text-lg font-medium transition-colors ${
              tab === "private" ? "text-blue-300" : "text-gray-300/80"
            }`}
            aria-pressed={tab === "private"}
          >
            <span>Private Key</span>
            <div
              className={`mt-2 h-[2px] mx-auto w-16 transition-all ${
                tab === "private" ? "bg-gradient-to-r from-[#3B82F6] to-[#5EE2FF]" : "bg-transparent"
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => setTab("seed")}
            className={`text-lg font-medium transition-colors ${
              tab === "seed" ? "text-blue-300" : "text-gray-300/80"
            }`}
            aria-pressed={tab === "seed"}
          >
            <span>Seed Phrase</span>
            <div
              className={`mt-2 h-[2px] mx-auto w-20 transition-all ${
                tab === "seed" ? "bg-gradient-to-r from-[#3B82F6] to-[#5EE2FF]" : "bg-transparent"
              }`}
            />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleImport}>
          <label className="block text-gray-300/80 mb-3">{tab === "private" ? "Private Key" : "Seed Phrase"}</label>

          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full h-30 md:h-30 bg-black/60 backdrop-blur-sm border border-gray-800 rounded-md p-4 text-gray-200 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            aria-label={tab === "private" ? "Private Key input" : "Seed Phrase input"}
            spellCheck={false}
          />

          {/* Password to encrypt the wallet JSON locally */}
          <div className="mt-4">
            <label className="block text-gray-300/80 mb-2">Encryption Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a strong password (min 8 chars)"
              className="w-full bg-black/60 border border-gray-800 rounded-md p-3 text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-2">
              This password encrypts the wallet JSON stored in your browser. Keep it safe — it cannot be recovered without your seed phrase.
            </p>
          </div>

          {error && <div className="text-red-400 text-sm mt-3">{error}</div>}

          <div className="mt-6">
            <button
              type="submit"
              className="w-full py-3 rounded-lg text-md font-semibold bg-gradient-to-r from-[#3045FFCF] to-[#6a64ff] hover:scale-[1.002] active:scale-[0.998] transform transition disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Importing..." : "Import Wallet"}
            </button>
          </div>

          <div className="mt-4 text-center">
            <a onClick={() => navigate("/")} className="text-gray-300/80 hover:text-white cursor-pointer">
              Back to login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
