import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = "text", ...props }, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "w-full rounded-xl border border-border/60 bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";
