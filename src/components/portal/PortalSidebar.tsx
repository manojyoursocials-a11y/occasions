"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Wallet,
  FileText,
  CalendarDays,
  Palette,
  Users,
  FolderOpen,
  Folder,
  MessageCircle,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/portal", label: "Dashboard", icon: LayoutDashboard, locked: false },
  { href: "/portal/quote-payments", label: "Quote & Payments", icon: Wallet, locked: false },
  { href: "/portal/contract", label: "Contract", icon: FileText, locked: false, alert: "red" },
  { href: "/portal/event-schedule", label: "Event Schedule", icon: CalendarDays, locked: false, alert: "amber" },
  { href: "/portal/moodboard", label: "Moodboard", icon: Palette, locked: false },
  { href: "/portal/team", label: "Team", icon: Users, locked: true },
  { href: "/portal/deliverables", label: "Deliverables", icon: FolderOpen, locked: true },
  { href: "/portal/documents", label: "Documents", icon: Folder, locked: false },
  { href: "/portal/whatsapp", label: "WhatsApp Group", icon: MessageCircle, locked: true },
] as const;

export function PortalSidebar({
  companyName,
  projectTitle,
  eventLabel,
  eventDate,
  contractSigned,
}: {
  companyName: string;
  projectTitle: string;
  eventLabel: string;
  eventDate: string;
  contractSigned: boolean;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-black/5 bg-white">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-900 text-sm font-semibold text-white">
          O
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight text-ink">{companyName}</p>
          <p className="text-[11px] uppercase tracking-wide text-ink/40">Client Portal</p>
        </div>
      </div>

      <div className="mx-4 mb-4 rounded-xl border border-black/5 bg-surface p-3">
        <p className="text-[11px] uppercase tracking-wide text-ink/40">Project</p>
        <p className="mt-0.5 text-sm font-semibold text-ink">{projectTitle}</p>
        <p className="text-xs text-ink/50">
          {eventLabel} · {eventDate}
        </p>
      </div>

      {!contractSigned && (
        <div className="mx-4 mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700" />
          <p className="text-xs leading-snug text-amber-800">
            Sign the contract to unlock Team, Deliverables &amp; WhatsApp.
          </p>
        </div>
      )}

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        <p className="px-2 pb-2 pt-1 text-[11px] font-medium uppercase tracking-wide text-ink/35">
          Sections
        </p>
        {NAV.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          const disabled = item.locked && !contractSigned;
          return (
            <Link
              key={item.href}
              href={disabled ? "#" : item.href}
              aria-disabled={disabled}
              className={cn(
                "focus-ring flex items-center justify-between rounded-xl px-2.5 py-2 text-sm transition",
                active
                  ? "bg-brand-50 font-medium text-brand-800"
                  : disabled
                  ? "cursor-not-allowed text-ink/30"
                  : "text-ink/70 hover:bg-black/[0.03]"
              )}
            >
              <span className="flex items-center gap-2.5">
                <Icon className="h-4 w-4" />
                {item.label}
              </span>
              {disabled && <Lock className="h-3.5 w-3.5" />}
              {"alert" in item && item.alert && !disabled && (
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    item.alert === "red" ? "bg-red-500" : "bg-amber-500"
                  )}
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-black/5 px-4 py-4">
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
