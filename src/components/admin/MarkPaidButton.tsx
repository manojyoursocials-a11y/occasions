"use client";

import { useTransition } from "react";
import { markInstallmentPaid } from "@/lib/actions/payments";
import { Check } from "lucide-react";

export function MarkPaidButton({ installmentId }: { installmentId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => markInstallmentPaid(installmentId))}
      className="focus-ring inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 transition hover:bg-green-100 disabled:opacity-50"
    >
      <Check className="h-3 w-3" />
      {isPending ? "Marking…" : "Mark Paid"}
    </button>
  );
}
