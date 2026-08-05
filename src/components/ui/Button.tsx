import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const variants: Record<Variant, string> = {
  primary: "bg-brand-700 text-white shadow-sm shadow-brand-900/10 hover:bg-brand-800 hover:shadow-md active:scale-[0.98]",
  secondary: "bg-black/[0.04] text-ink hover:bg-black/[0.07] active:scale-[0.98]",
  ghost: "text-ink/60 hover:bg-black/5 active:scale-[0.98]",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        "focus-ring inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
