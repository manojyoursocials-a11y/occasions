import { cn } from "@/lib/utils";

type Tone = "green" | "amber" | "red" | "gray" | "brand" | "blue" | "orange";

const toneClasses: Record<Tone, string> = {
  green: "bg-green-50 text-green-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  gray: "bg-black/5 text-ink/60",
  brand: "bg-brand-50 text-brand-700",
  blue: "bg-blue-50 text-blue-700",
  orange: "bg-orange-50 text-orange-700",
};

export function Badge({
  children,
  tone = "gray",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
