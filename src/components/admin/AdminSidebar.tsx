"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  FolderOpen,
  Film,
  UsersRound,
  Wallet,
  Zap,
  Sparkles,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Enquiries", icon: Search },
  { href: "/admin/clients", label: "Projects", icon: FolderOpen },
  { href: "/admin/post-production", label: "Post Production", icon: Film },
  { href: "/admin/team", label: "Team", icon: UsersRound },
  { href: "/admin/payments", label: "Finances", icon: Wallet },
  { href: "/admin/automation", label: "Automation", icon: Zap },
] as const;

export function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col bg-[#0c0b16] text-white/80">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-semibold text-white">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight text-white">The Occasions</p>
          <p className="text-[10px] uppercase tracking-widest text-white/40">Studio OS</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 pb-4">
        <p className="px-2 pb-2 pt-1 text-[11px] font-medium uppercase tracking-wide text-white/30">
          General
        </p>
        {NAV.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "focus-ring flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition",
                active
                  ? "bg-brand-600/25 font-medium text-white"
                  : "text-white/55 hover:bg-white/5 hover:text-white/80"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <p className="text-xs font-medium text-white/80">{adminName}</p>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-xs text-white/35 hover:text-white/60"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
