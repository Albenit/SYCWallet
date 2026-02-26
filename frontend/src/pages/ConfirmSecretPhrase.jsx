import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Wallet } from "ethers";
import Steps from "../components/Steps";
import PageLayoutBeforeLogin from "../components/layouts/PageLayoutBeforeLogin";
import { useAuth } from "../context/AuthContext";
import CryptoJS from "crypto-js";
import monexLogo from '../assets/monexLogo.png';

export default function ConfirmSecretPhrase() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const originalPhrase = (location.state && location.state.phrase) || "";
  const password = (location.state && location.state.password) || "";

  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const normalize = (s) => s.toLowerCase().trim().split(/\s+/).join(" ");
  const API = import.meta.env.VITE_API_URL;

  const expectedWords = useMemo(
    () => (originalPhrase ? normalize(originalPhrase).split(" ").length : 0),
    [originalPhrase]
  );

  const handleNext = async () => {
    setError("");

    if (!originalPhrase) {
      setError("Missing reference phrase. Go back and generate your wallet again.");
      return;
    }

    const typed = normalize(input);
    const expected = normalize(originalPhrase);

    if (typed.split(" ").length !== expectedWords) {
      setError(`Your phrase must contain exactly ${expectedWords} words.`);
      return;
    }

    try {
      Wallet.fromPhrase(typed);
    } catch {
      setError("This recovery phrase is not valid. Check spelling and order.");
      return;
    }

    if (typed !== expected) {
      setError("Phrase does not match. Check word order and spelling.");
      return;
    }

    setSubmitting(true);
    try {
      const wallet = Wallet.fromPhrase(typed);
      const address = wallet.address;

      const nonceRes = await fetch(`${API}/auth/nonce`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
        credentials: "include",
      });

      if (!nonceRes.ok) {
        const t = await nonceRes.text().catch(() => "");
        throw new Error(t || "Failed to get nonce");
      }
      const { nonce } = await nonceRes.json();

      const message = `Sign in to YourApp\nAddress: ${address}\nNonce: ${nonce}`;
      const signature = await wallet.signMessage(message);

      const verifyRes = await fetch(`${API}/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, message, signature }),
        credentials: "include",
      });

      if (!verifyRes.ok) {
        const t = await verifyRes.text().catch(() => "");
        throw new Error(t || "Verification failed");
      }

      const verifyData = await verifyRes.json()

      login(verifyData.token);

      setInput("");
      const encryptedJson = await wallet.encrypt(password);

      localStorage.setItem("encryptedWallet", encryptedJson);
      localStorage.setItem("walletAddress", wallet.address);

      const secret = import.meta.env.VITE_ENCRYPT_KEY;
      const ciphertext = CryptoJS.AES.encrypt(password, secret).toString();
      sessionStorage.setItem("c_aP", ciphertext);

      navigate("/dashboard");
    } catch (e) {
      setError(e?.message || "Could not complete wallet registration");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayoutBeforeLogin>
      <div className="p-5 p-sm-8">
        <div className="flex flex-col items-center mb-6">
          <img src={monexLogo} alt="SYC Logo" className="h-12 w-auto" />
        </div>
        <div className="text-[32px] mb-4 text-center">Confirm Your Secret Phrase</div>
        <Steps selected={3} />
        <p className="text-[#EFEFEF7A] text-sm mb-6 text-center">
          Please type each word in the correct order to verify you have saved your Secret Phrase.
        </p>

        <div className="mb-8 text-left">
          <label className="block text-sm mb-2">Phrase</label>
          <div className="relative">
            <input
              type="text"
              className="w-full p-3 rounded-full bg-[#1A1A1A]  focus:outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={expectedWords ? `Enter your ${expectedWords}-word phrase` : "Enter your phrase"}
              disabled={submitting}
            />
          </div>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
        <div className="flex items-center gap-1 pt-1">
          {/* Circular arrow icon */}
          <button
            onClick={handleNext}
            disabled={!input.trim() || submitting}
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
            onClick={handleNext}
            disabled={!input.trim() || submitting}
            className="flex-1 rounded-full bg-gradient-to-r from-[#DE0072] to-[#c9175e] py-3 font-semibold text-white hover:opacity-90 transition disabled:opacity-60 cursor-pointer text-center"
          >
            {submitting ? "Verifying..." : "Verify"}
          </button>
        </div>
        <div className="flex items-center gap-1 pt-3">
          {/* Circular arrow icon */}
          <button
            onClick={() => navigate("/signup")}
            disabled={submitting}
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
            disabled={submitting}
            className="flex-1 rounded-full bg-[#1A1A1A] py-3 font-semibold text-white hover:opacity-90 transition disabled:opacity-60 cursor-pointer text-center"
          >
            Back
          </button>
        </div>
      </div>
    </PageLayoutBeforeLogin>
  );
}
