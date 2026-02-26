import { useLocation, useNavigate } from "react-router-dom";
import navHome from "../assets/svg/navHome2.svg"
import navHistory from "../assets/svg/navHistory.svg"
import navSettings from "../assets/svg/navSettings2.svg"
export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="mt-2 bg-[#1A1A1A] px-6 py-2 rounded-3xl">
      <div className="grid grid-cols-3 text-center text-xs text-gray-300 max-w-[280px] mx-auto py-2">
        {[
          { path: "/dashboard", label: "Home", icon: navHome },
          { path: "/history", label: "History", icon: navHistory },
          { path: "/settings", label: "Settings", icon: navSettings },
        ].map(({ path, label, icon }) => {
          const active = isActive(path);
          return (
            <div
              key={path}
              className="flex flex-col items-center cursor-pointer gap-1 relative"
              onClick={() => navigate(path)}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl">
                <img
                  src={icon}
                  alt={label}
                  className={`w-5 h-5 transition-all ${active ? "brightness-0 invert-0" : ""}`}
                  style={active ? { filter: "brightness(0) saturate(100%) invert(12%) sepia(95%) saturate(5874%) hue-rotate(327deg) brightness(90%) contrast(107%)" } : {}}
                />
              </div>
              <span className={`text-xs font-medium transition-colors ${active ? "text-[#DE0072]" : "text-gray-400"}`}>
                {label}
              </span>
              {active && (
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-[2px] w-6 rounded-full bg-[#DE0072]" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
