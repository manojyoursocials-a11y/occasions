"use client";

import { useTransition } from "react";
import { updateLeadStatus } from "@/lib/actions/leads";
import { cn } from "@/lib/utils";

const OPTIONS: { value: string; label: string; classes: string }[] = [
  { value: "new", label: "New", classes: "bg-brand-50 text-brand-700 border-brand-200" },
  { value: "contacted", label: "Following Up", classes: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "quoted", label: "Proposal Sent", classes: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "won", label: "Booked", classes: "bg-green-50 text-green-700 border-green-200" },
  { value: "lost", label: "Lost", classes: "bg-red-50 text-red-700 border-red-200" },
];

export function LeadStatusSelect({ leadId, status }: { leadId: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  const current = OPTIONS.find((o) => o.value === status) || OPTIONS[0];

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value;
        startTransition(() => {
          updateLeadStatus(leadId, next);
        });
      }}
      className={cn(
        "focus-ring cursor-pointer rounded-full border px-2.5 py-1 text-xs font-medium transition disabled:opacity-50",
        current.classes
      )}
    >
      {OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
