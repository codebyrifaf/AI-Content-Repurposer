import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardProps = {
  className?: string;
  children: ReactNode;
};

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-surface/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.25)] backdrop-blur-xl",
        className
      )}
    >
      {children}
    </div>
  );
}
