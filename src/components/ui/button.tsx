import * as React from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-paper hover:bg-black disabled:hover:bg-ink",
  outline: "border border-paper-line bg-paper text-ink hover:border-ink",
  ghost: "text-ink-muted hover:text-ink",
  danger: "border border-paper-line bg-paper text-ink hover:border-red-600 hover:text-red-700",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-sm",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-none font-medium transition-colors duration-150",
        "disabled:cursor-not-allowed disabled:opacity-40",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
});
