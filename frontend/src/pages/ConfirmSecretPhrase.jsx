import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Wallet } from "ethers"; // v6
import Steps from "../components/Steps";
import PageLayout from "../components/layouts/PageLayout";
import { useAuth } from "../context/AuthContext";

export default function ConfirmSecretPhrase() {
  const { login } = useAuth();  
  const navigate = useNavigate();
  const location = useLocation();

  // original phrase passed from previous step (ephemeral, not persisted server-side)
  const originalPhrase = (location.state && location.state.mnemonic) || "";

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

      try {
        sessionStorage.removeItem("tmp_secret_phrase");
      } catch { /* ignore */ }
      const verifyData = await verifyRes.json()

      login(verifyData.token); 

      setInput("");

      navigate("/dashboard");
    } catch (e) {
      setError(e?.message || "Could not complete wallet registration");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <div className="p-5 p-sm-8">
        <Steps selected={3} />
        <div className="text-[22px] font-bold mb-2 text-center">Confirm Your Secret Phrase</div>
        <p className="text-[#EFEFEF7A] text-sm mb-6 text-center">
          Please type each word in the correct order to verify you have saved your Secret Phrase.
        </p>

        <div className="mb-8 text-left">
          <label className="block text-sm mb-2">Phrase</label>
          <div className="relative">
            <input
              type="text"
              className="w-full p-3 rounded bg-[#02080E8C]  focus:outline-none"
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
            className="px-6 py-2 w-md rounded text-gray-200 font-[700] cursor-pointer disabled:opacity-50"
            onClick={() => navigate("/signup")}
            disabled={submitting}
          >
            Cancel
          </button>

          <button
            className="px-6 py-2 w-md rounded  bg-gradient-to-r from-[#3045FFCF] to-[#3045FF] hover:bg-blue-500 disabled:opacity-50 cursor-pointer font-[700]"
            onClick={handleNext}
            disabled={!input.trim() || submitting}
          >
            {submitting ? "Verifying..." : "Next"}
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
