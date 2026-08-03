"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UsersRound,
  Contact,
  Wallet,
  Film,
  Zap,
  Users,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: Contact },
  { href: "/admin/clients", label: "Clients & Projects", icon: Users },
  { href: "/admin/team", label: "Team", icon: UsersRound },
  { href: "/admin/payments", label: "Payments", icon: Wallet },
  { href: "/admin/post-production", label: "Post-Production", icon: Film },
  { href: "/admin/automation", label: "Automation", icon: Zap },
] as const;

export function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-black/5 bg-white">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-900 text-sm font-semibold text-white">
          A
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight text-ink">Aperture Weddings</p>
          <p className="text-[11px] uppercase tracking-wide text-ink/40">Studio Admin</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 pb-4">
        <p className="px-2 pb-2 pt-1 text-[11px] font-medium uppercase tracking-wide text-ink/35">
          Workspace
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
                active ? "bg-brand-50 font-medium text-brand-800" : "text-ink/70 hover:bg-black/[0.03]"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-black/5 px-4 py-4">
        <p className="text-xs font-medium text-ink">{adminName}</p>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-xs text-ink/40 hover:text-ink/60"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
