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
      <div className="bg-[#08071a] p-6 rounded-xl w-96">
        <h3 className="text-lg font-semibold text-white mb-4 text-center">Enter Wallet Password</h3>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your Wallet Password"
          className="w-full p-3 mb-4 rounded-md text-white bg-[#02080E8C] focus:outline-none text-[12px]"
        />
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-md transition cursor-pointer font-[700]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="w-full rounded-md bg-blue-600 py-2 font-semibold hover:bg-blue-700 transition cursor-pointer font-[700]"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordModal;
