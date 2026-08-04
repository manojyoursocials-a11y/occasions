"use client";

import { useTransition } from "react";
import { triggerAutomation } from "@/lib/actions/automation";
import { Button } from "@/components/ui/Button";

export function TriggerAutomationButton({
  template,
  channel,
}: {
  template: string;
  channel: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="secondary"
      disabled={isPending}
      onClick={() => startTransition(() => triggerAutomation(template, channel))}
      className="mt-3 w-full text-xs"
    >
      {isPending ? "Sending…" : "Send Now"}
    </Button>
  );
}
