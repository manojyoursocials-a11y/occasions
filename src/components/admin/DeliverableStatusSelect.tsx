"use client";

import { useTransition } from "react";
import { updateDeliverableStatus } from "@/lib/actions/deliverables";

const OPTIONS = ["not_started", "in_progress", "ready", "delivered"];

export function DeliverableStatusSelect({ id, status }: { id: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value;
        startTransition(() => {
          updateDeliverableStatus(id, next);
        });
      }}
      className="focus-ring rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs font-medium text-ink/70 disabled:opacity-50"
    >
      {OPTIONS.map((opt) => (
        <option key={opt} value={opt}>
          {opt.replace("_", " ")}
        </option>
      ))}
    </select>
  );
}
