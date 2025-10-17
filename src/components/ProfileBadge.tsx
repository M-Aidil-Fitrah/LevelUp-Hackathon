import React, { useEffect, useRef, useState } from "react";

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
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const popRef = useRef<HTMLDivElement>(null);
  useOutsideClick(popRef, () => setOpen(false));

  useEffect(() => {
    // Prefer user from localStorage (set during login), fallback to a lightweight fetch if needed
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed);
      }
    } catch {}
  }, []);

  const name = user?.fullname || user?.name || (user?.email ? user.email.split("@")[0] : "Pengguna");
  const email = user?.email || "-";
  const role = user?.role || "user";

  const logout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch {}
    // Hard reload to let app/nav reflect state everywhere
    window.location.replace("/");
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
          <img src={user.avatarUrl} alt={name} className="h-7 w-7 rounded-full object-cover" />
        ) : (
          <div className="h-7 w-7 rounded-full bg-black text-white flex items-center justify-center text-xs font-semibold">
            {getInitials(String(name)) || "U"}
          </div>
        )}
        <div className="text-left">
          <div className="text-sm font-semibold leading-4">{name}</div>
          <div className="text-[11px] text-gray-500 leading-3">{role}</div>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="ml-1 h-4 w-4 text-gray-600"
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
          className={`absolute right-0 mt-2 w-64 rounded-lg border border-black/10 bg-white shadow-lg ${compact ? "" : ""}`}
        >
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="font-semibold">{name}</div>
            <div className="text-sm text-gray-600 truncate">{email}</div>
            <div className="text-xs text-gray-500 mt-0.5">Role: {role}</div>
          </div>
          <div className="py-1">
            <button
              onClick={logout}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileBadge;
