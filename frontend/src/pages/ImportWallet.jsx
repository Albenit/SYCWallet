import React, { useState } from "react";
import monexLogo from "../assets/monexLogo.png";
import { useNavigate } from "react-router-dom";
import { Wallet } from "ethers";
import PageLayoutBeforeLogin from "../components/layouts/PageLayoutBeforeLogin";
import CryptoJS from "crypto-js";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

export default function ImportWallet({ onImport }) {
  const { login } = useAuth();
  const [tab, setTab] = useState("seed");
  const [value, setValue] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);


  const placeholder =
    tab === "private"
      ? "Enter your private key here"
      : "Enter your 12/24 - word seed phrase here";

  async function signInWithWalletInstance(walletInstance) {
    const addr = (walletInstance.address || (await walletInstance.getAddress())).toLowerCase();

    const nonceRes = await fetch(`${API}/auth/nonce`, {
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

    if (data?.token) login(data.token);;
    return { addr, data };
  }

  async function handleImport(e) {
    e.preventDefault();
    setError("");
    if (!value || !password) {
      setError("Both the key/phrase and an encryption password are required.");
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
        wallet = Wallet.fromPhrase(phrase);
      }

      const address = wallet.address.toLowerCase();

      const encryptedJson = await wallet.encrypt(password);
      localStorage.setItem("encryptedWallet", encryptedJson);
      localStorage.setItem("wallet_address", address);

      const secret = import.meta.env.VITE_ENCRYPT_KEY;

      const ciphertext = CryptoJS.AES.encrypt(password, secret).toString();

      sessionStorage.setItem("c_aP", ciphertext);


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
    <PageLayoutBeforeLogin maxWidth="700px">
      <div className="px-6 pt-6">
        <div className="flex flex-col items-center mb-6">
          <img src={monexLogo} alt="SYC Logo" className="h-12 w-auto" />
        </div>

        <div className="flex items-center justify-center gap-12 mb-6">
          <button
            type="button"
            onClick={() => setTab("seed")}
            className={`text-lg font-medium transition-colors cursor-pointer ${tab === "seed" ? "text-[#DE0072]" : "text-gray-300/80"
              }`}
            aria-pressed={tab === "seed"}
          >
            <span>Seed Phrase</span>
            <div
              className={`mt-2 h-[2px] mx-auto w-20 transition-all ${tab === "seed" ? "bg-gradient-to-r from-[#DE0072] to-[#c9175e]" : "bg-transparent"
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
            className="w-full h-30 md:h-30 bg-[#121212] backdrop-blur-sm  rounded-xl p-4 text-gray-200 placeholder:text-gray-400 resize-none focus:outline-none transition"
            aria-label={tab === "private" ? "Private Key input" : "Seed Phrase input"}
            spellCheck={false}
          />

          {/* Password to encrypt the wallet JSON locally */}
          <div className="mt-4">
            <label className="block text-gray-300/80 mb-2">Encryption Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="Choose a strong password (min 8 chars)"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#121212] focus:outline-none "
              />
              <button
                type="button"
                className="absolute right-3 top-4 text-gray-400 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              This password encrypts the wallet JSON stored in your browser. Keep it safe — it cannot be recovered without your seed phrase.
            </p>
          </div>

          {error && <div className="text-[#DE0072] text-sm mt-3">{error}</div>}

          <div className="flex items-center gap-1 mt-5">
            {/* Circular arrow icon */}
            <button
              type="submit"
              disabled={loading}
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
              type="submit"
              disabled={loading}
              className="flex-1 rounded-full bg-gradient-to-r from-[#DE0072] to-[#c9175e] py-3 font-semibold text-white hover:opacity-90 transition disabled:opacity-60 cursor-pointer text-center"
            >
              {loading ? "Importing..." : "Import Wallet"}
            </button>
          </div>
          <div className="flex items-center gap-1 pt-3">
            {/* Circular arrow icon */}
            <button
              type="button"
              onClick={() => navigate("/")}
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
              onClick={() => navigate("/")}
              type="submit"
              className="flex-1 rounded-full bg-[#1A1A1A] py-3 font-semibold text-white hover:opacity-90 transition disabled:opacity-60 cursor-pointer text-center"
            >
              Back
            </button>
          </div>

        </form>
      </div>
    </PageLayoutBeforeLogin>
  );
}
