import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type UserInfo = {
  fullname?: string;
  name?: string;
  email?: string;
  role?: string;
  avatarUrl?: string;
};

export interface ProfileBadgeProps {
  variant?: "desktop" | "mobile";
}

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || "").join("");
};

type RefLike<T> = { current: T | null };
const useOutsideClick = <T extends HTMLElement>(ref: RefLike<T>, onClose: () => void) => {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onClose]);
};

export const ProfileBadge: React.FC<ProfileBadgeProps> = ({ variant = "desktop" }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const popRef = useRef<HTMLDivElement>(null);
  useOutsideClick(popRef, () => setOpen(false));

  useEffect(() => {
    const loadUser = () => {
      try {
        const raw = localStorage.getItem("user");
        if (raw) {
          const parsed = JSON.parse(raw);
          setUser(parsed);
        }
      } catch (err) {
        console.error("Error loading user:", err);
      }
    };

    loadUser();

    // Listen for auth changes
    const handleAuthChange = () => loadUser();
    window.addEventListener('auth-changed', handleAuthChange as any);
    
    return () => {
      window.removeEventListener('auth-changed', handleAuthChange as any);
    };
  }, []);

  // Get fullname, fallback to name or email prefix
  const fullname = user?.fullname || user?.name || (user?.email ? user.email.split("@")[0] : "Pengguna");
  const email = user?.email || "email@example.com";
  const role = user?.role || "buyer";
  const isBuyer = role === "buyer";

  const logout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch {}
    window.dispatchEvent(new Event('auth-changed'));
    window.location.replace("/");
  };

  const handleUpgradeToSeller = () => {
    setOpen(false);
    navigate("/upgrade-to-seller");
  };

  const compact = variant === "mobile";

  return (
    <div className="relative" ref={popRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 shadow-sm hover:bg-gray-50 transition ${compact ? "w-full justify-start" : ""}`}
      >
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} alt={fullname} className="h-7 w-7 rounded-full object-cover" />
        ) : (
          <div className="h-7 w-7 rounded-full bg-black text-white flex items-center justify-center text-xs font-semibold">
            {getInitials(fullname) || "U"}
          </div>
        )}
        <div className="text-left">
          <div className="text-sm font-semibold leading-4 truncate max-w-[120px]">{fullname}</div>
          <div className="text-[11px] text-gray-500 leading-3 truncate max-w-[120px]">{email}</div>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="ml-1 h-4 w-4 text-gray-600 flex-shrink-0"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div
          className={`absolute right-0 mt-2 w-72 rounded-lg border border-black/10 bg-white shadow-lg ${compact ? "" : ""}`}
        >
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={fullname} className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold">
                  {getInitials(fullname) || "U"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 truncate">{fullname}</div>
                <div className="text-xs text-gray-500 truncate">{email}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                {role === "buyer" && "Buyer"}
                {role === "seller" && "Seller"}
                {role === "admin" && "Admin"}
              </span>
            </div>
          </div>

          {/* Menu Options */}
          <div className="py-1">
            {isBuyer && (
              <button
                onClick={handleUpgradeToSeller}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 text-[#FF2000] font-medium transition"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path d="M13 7H7v6h6V7z" />
                  <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
                </svg>
                Verifikasi Menjadi Seller
              </button>
            )}
            <button
              onClick={logout}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700 transition"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileBadge;