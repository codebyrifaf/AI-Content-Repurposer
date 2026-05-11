import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = {
  className?: string;
  children: ReactNode;
};

export function Badge({ className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border/60 bg-surface/70 px-3 py-1 text-xs font-medium text-foreground",
        className
      )}
    >
      {children}
    </span>
  );
}
