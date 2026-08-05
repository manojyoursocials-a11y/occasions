import { cn } from "@/lib/utils";

type Tone = "green" | "amber" | "red" | "gray" | "brand" | "blue" | "orange";

const toneClasses: Record<Tone, string> = {
  green: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/10",
  amber: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/10",
  red: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10",
  gray: "bg-black/5 text-ink/60 ring-1 ring-inset ring-black/5",
  brand: "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-600/10",
  blue: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/10",
  orange: "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/10",
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
