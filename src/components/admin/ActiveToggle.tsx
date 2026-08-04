"use client";

import { useTransition } from "react";
import { toggleTeamMemberActive } from "@/lib/actions/team";
import { Badge } from "@/components/ui/Badge";

export function ActiveToggle({ memberId, active }: { memberId: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => toggleTeamMemberActive(memberId, !active))}
      className="focus-ring disabled:opacity-50"
    >
      <Badge tone={active ? "green" : "gray"}>{active ? "Active" : "Inactive"}</Badge>
    </button>
  );
}
