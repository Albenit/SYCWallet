import { useLocation, useNavigate } from "react-router-dom";
import { Home, Clock, Settings } from "lucide-react";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="mt-6 rounded-b-xl bg-gradient-to-t from-[#0A0F17] to-[#0A0A1A] px-6 py-4">
      <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-300">
        {/* Home */}
        <div
          className="flex flex-col items-center gap-2 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-2xl`}
          >
            <Home size={18} />
          </div>
          <span className={isActive("/dashboard") ? "text-blue-400" : ""}>
            Home
          </span>
        </div>

        {/* History */}
        <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => navigate("/history")}>
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-2xl`}
          >
            <Clock size={18} />
          </div>
          <span className={isActive("/history") ? "text-blue-400" : ""}>
            History
          </span>
        </div>

        {/* Settings */}
        <div
          className="flex flex-col items-center gap-2 cursor-pointer"
          onClick={() => navigate("/settings")}
        >
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-2xl`}
          >
            <Settings size={18} />
          </div>
          <span className={isActive("/settings") ? "text-blue-400" : ""}>
            Settings
          </span>
        </div>
      </div>
    </div>
  );
}
