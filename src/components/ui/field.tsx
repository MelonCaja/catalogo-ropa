import * as React from "react";

import { cn } from "@/lib/utils";

const control =
  "h-10 w-full border border-paper-line bg-paper px-3 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-ink focus:outline-none disabled:opacity-50";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(control, className)} {...props} />;
  },
);

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(control, "h-auto min-h-28 py-2 leading-relaxed", className)} {...props} />;
});

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, ...props }, ref) {
  return <select ref={ref} className={cn(control, "appearance-none pr-8", className)} {...props} />;
});

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1.5 block text-sm text-ink-muted", className)} {...props} />;
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? <p className="mt-1.5 text-xs text-ink-faint">{hint}</p> : null}
    </div>
  );
}
