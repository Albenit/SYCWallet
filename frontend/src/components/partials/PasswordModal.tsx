import React, { useState } from "react";

type PasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
};

const PasswordModal = ({ isOpen, onClose, onSubmit }: PasswordModalProps) => {
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    if (password.trim() === "") {
      alert("Password is required");
      return;
    }
    onSubmit(password);
    setPassword("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[#1a1a1a] p-6 rounded-xl w-96">
        <h3 className="text-lg font-semibold text-white mb-4">Enter Wallet Password</h3>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your Wallet Password"
          className="w-full p-3 mb-4 rounded-md text-white bg-[#151928] border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 py-2 rounded-md hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="w-full rounded-md bg-blue-600 py-3 font-semibold hover:bg-blue-700 transition"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordModal;
