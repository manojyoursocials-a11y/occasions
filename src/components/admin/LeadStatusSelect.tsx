"use client";

import { useTransition } from "react";
import { updateLeadStatus } from "@/lib/actions/leads";

const OPTIONS = ["new", "contacted", "quoted", "won", "lost"];

export function LeadStatusSelect({ leadId, status }: { leadId: string; status: string }) {
  const [isPending, startTransition] = useTransition();

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
      className="focus-ring rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs font-medium capitalize text-ink/70 disabled:opacity-50"
    >
      {OPTIONS.map((opt) => (
        <option key={opt} value={opt}>
          {opt.replace("_", " ")}
        </option>
      ))}
    </select>
  );
}
