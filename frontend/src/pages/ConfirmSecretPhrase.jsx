import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Wallet } from "ethers"; // v6

export default function ConfirmSecretPhrase() {
  const navigate = useNavigate();
  const location = useLocation();

  // original phrase passed from previous step (ephemeral, not persisted server-side)
  const originalPhrase = (location.state && location.state.mnemonic) || "";

  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const normalize = (s) => s.toLowerCase().trim().split(/\s+/).join(" ");
  const API = "http://127.0.0.1:5000";

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
      // Throws if invalid mnemonic
      Wallet.fromPhrase(typed);
    } catch {
      setError("This recovery phrase is not valid. Check spelling and order.");
      return;
    }

    if (typed !== expected) {
      setError("Phrase does not match. Check word order and spelling.");
      return;
    }

    // ===== SUCCESS PATH =====
    setSubmitting(true);
    try {
      const wallet = Wallet.fromPhrase(typed);
      const address = wallet.address; 

      const nonceRes = await fetch(`${API}/api/auth/nonce`, {
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

      const verifyRes = await fetch(`${API}/api/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, message, signature }),
        credentials: "include",
      });

      if (!verifyRes.ok) {
        const t = await verifyRes.text().catch(() => "");
        throw new Error(t || "Verification failed");
      }

      try {
        sessionStorage.removeItem("tmp_secret_phrase");
      } catch {}
      const verifyData = await verifyRes.json()

      localStorage.setItem("auth_token", verifyData.token);
      
      setInput("");

      navigate("/dashboard");
    } catch (e) {
      setError(e?.message || "Could not complete wallet registration");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#02010C] to-[#030313] text-white">
      <div className="p-8 rounded-[8px] max-w-xl w-full border border-gray-700 bg-[#0A0A1A]">
        <div className="flex items-center justify-center mb-8">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-gray-500 text-gray-400">1</div>
            <span className="text-gray-400 text-sm mt-2">Set Password</span>
          </div>
          <div className="w-12 h-[1px] bg-gray-600"></div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-500 text-gray-400">2</div>
            <span className="text-gray-400 text-sm mt-2">Secure Wallet</span>
          </div>
          <div className="w-12 h-[1px] bg-gray-600"></div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center rounded-full border border-blue-500 text-blue-500">3</div>
            <span className="text-blue-400 text-sm mt-2 text-center">Confirm Security<br/>Recovery Phrase</span>
          </div>
        </div>

        <div className="text-[22px] font-bold mb-2 text-center">Confirm Your Secret Phrase</div>
        <p className="text-gray-400 text-sm mb-6 text-center">
          Please type each word in the correct order to verify you have saved your Secret Phrase.
        </p>

        <div className="mb-4 text-left">
          <label className="block text-sm mb-2">Phrase</label>
          <div className="relative">
            <input
              type="text"
              className="w-full p-3 rounded bg-[#12122A] border border-gray-700 focus:outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={expectedWords ? `Enter your ${expectedWords}-word phrase` : "Enter your phrase"}
              disabled={submitting}
            />
          </div>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>

        <div className="flex justify-between mt-[30px]">
          <button
            className="px-6 py-2 w-md rounded text-gray-200 cursor-pointer disabled:opacity-50"
            onClick={() => navigate("/signup")}
            disabled={submitting}
          >
            Back
          </button>

          <button
            className="px-6 py-2 w-md rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
            onClick={handleNext}
            disabled={!input.trim() || submitting}
          >
            {submitting ? "Verifying..." : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
