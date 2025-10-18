"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../ui/sidebar";
import { cn } from "@/lib/utils";
import { IconHome2, IconCheck } from "@tabler/icons-react";

export type AdminSection = "home" | "verify";

export interface AdminSidebarProps {
  className?: string;
  onChange?: (next: AdminSection) => void;
  active?: AdminSection;
}

type UserInfo = { fullname?: string; name?: string; email?: string; avatarUrl?: string };
const getInitials = (name: string) => name.trim().split(/\s+/).slice(0,2).map(p=>p[0]?.toUpperCase()||"").join("");

const AdminSidebar: React.FC<AdminSidebarProps> = ({ className, onChange, active = "home" }) => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  useEffect(() => { try { const raw = localStorage.getItem("user"); if (raw) setUser(JSON.parse(raw)); } catch {} }, []);
  const fullname = useMemo(() => user?.fullname || user?.name || (user?.email ? user.email.split("@")[0] : "Admin"), [user]);
  const email = user?.email || "email@example.com";

  const links = [
    { key: "home" as const, label: "Home", icon: <IconHome2 className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" /> },
    { key: "verify" as const, label: "Verifikasi Seller", icon: <IconCheck className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" /> },
  ];

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className={cn("justify-between gap-10", className)}>
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          <div className="flex items-center gap-2 py-1">
            <img src="/logoputih.svg" alt="LevelUp" className="h-6 w-auto shrink-0" />
            {open && (
              <span className="text-sm font-medium text-black dark:text-white">Admin Dashboard</span>
            )}
          </div>
          <div className="mt-8 flex flex-col gap-2">
            {links.map((l) => (
              <SidebarLink
                key={l.key}
                link={{ label: l.label, href: "#", icon: l.icon }}
                onClick={(e: React.MouseEvent) => { e.preventDefault(); onChange?.(l.key); }}
                className={cn("rounded-md px-2", active === l.key ? "bg-white/80 dark:bg-neutral-900" : "")}
              />
            ))}
          </div>
        </div>
        <div className="mt-auto">
          <div className="flex items-center gap-2 py-2">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} className="h-7 w-7 shrink-0 rounded-full object-cover" />
            ) : (
              <div className="h-7 w-7 shrink-0 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-semibold">{getInitials(fullname)}</div>
            )}
            {open && (
              <div className="min-w-0">
                <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{fullname}</div>
                <div className="text-[11px] text-neutral-500 truncate">{email}</div>
              </div>
            )}
          </div>
        </div>
      </SidebarBody>
    </Sidebar>
  );
};

export default AdminSidebar;
