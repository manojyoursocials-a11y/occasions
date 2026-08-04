"use client";

import { useTransition } from "react";
import { deleteScheduleItem } from "@/lib/actions/schedule";
import { X } from "lucide-react";

export function DeleteScheduleItemButton({ itemId, projectId }: { itemId: string; projectId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => deleteScheduleItem(itemId, projectId))}
      className="focus-ring text-ink/30 hover:text-red-500 disabled:opacity-50"
      aria-label="Remove schedule item"
    >
      <X className="h-4 w-4" />
    </button>
  );
}
