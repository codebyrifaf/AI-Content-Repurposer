import Link, { type LinkProps } from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonBaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonBaseProps;

type ButtonLinkProps = LinkProps &
  AnchorHTMLAttributes<HTMLAnchorElement> &
  ButtonBaseProps;

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:pointer-events-none disabled:opacity-60";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-slate-950 shadow-[0_10px_30px_rgba(106,215,255,0.2)] hover:brightness-105",
  secondary:
    "bg-surface-2 text-foreground border border-border/60 hover:border-border",
  ghost: "bg-transparent text-foreground hover:bg-surface/70",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
};

function getButtonClasses(
  variant: ButtonVariant,
  size: ButtonSize,
  className?: string
) {
  return cn(baseClasses, variantClasses[variant], sizeClasses[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type ?? "button"}
      className={getButtonClasses(variant, size, className)}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  href,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={getButtonClasses(variant, size, className)}
      {...props}
    />
  );
}
