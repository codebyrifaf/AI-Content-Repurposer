import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, rows = 4, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        "w-full resize-none rounded-xl border border-border/60 bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
