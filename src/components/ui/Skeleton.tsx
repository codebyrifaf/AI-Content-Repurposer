import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]",
        className
      )}
    />
  );
}
