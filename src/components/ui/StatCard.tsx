import { Card } from "./Card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type Tone = "brand" | "blue" | "amber" | "green";

const TONE_CLASSES: Record<Tone, { bg: string; icon: string; ring: string }> = {
  brand: { bg: "bg-brand-50", icon: "text-brand-600", ring: "ring-brand-100" },
  blue: { bg: "bg-blue-50", icon: "text-blue-600", ring: "ring-blue-100" },
  amber: { bg: "bg-amber-50", icon: "text-amber-600", ring: "ring-amber-100" },
  green: { bg: "bg-green-50", icon: "text-green-600", ring: "ring-green-100" },
};

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "brand",
  children,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon?: LucideIcon;
  tone?: Tone;
  children?: React.ReactNode;
}) {
  const t = TONE_CLASSES[tone];
  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink/40">{label}</p>
          <p className="font-heading text-2xl font-bold text-ink">{value}</p>
          {sub && <p className="mt-1 text-sm text-ink/45">{sub}</p>}
        </div>
        {Icon && (
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1", t.bg, t.ring)}>
            <Icon className={cn("h-5 w-5", t.icon)} />
          </div>
        )}
      </div>
      {children}
    </Card>
  );
}
