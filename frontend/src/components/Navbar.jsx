import { useLocation, useNavigate } from "react-router-dom";
import navHome from "../assets/svg/navHome.svg"
import navHistory from "../assets/svg/navHistory.svg"
import navSettings from "../assets/svg/navSettings.svg"
export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="mt-6 rounded-b-xl bg-[#02080E8C] px-6 py-2 rounded-t-4xl">
      <div className="grid grid-cols-3  text-center text-xs text-gray-300 max-w-[280px] mx-auto">
        <div
          className="flex flex-col items-center cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-2xl`}
          >
            <img src={navHome} alt="" />
          </div>
          <span className={isActive("/dashboard") ? "text-blue-400" : ""}>
            Home
          </span>
        </div>

        <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate("/history")}>
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-2xl`}
          >
            <img src={navHistory} alt="" />
          </div>
          <span className={isActive("/history") ? "text-blue-400" : ""}>
            History
          </span>
        </div>

        <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate("/settings")}>
          <div className={`flex h-9 w-9 items-center justify-center rounded-2xl`}>
            <img src={navSettings} alt="" />
          </div>
          <span  className={isActive("/settings") ? "text-blue-400" : ""}>
            Settings
          </span>
        </div>
      </div>
    </div>
  );
}
