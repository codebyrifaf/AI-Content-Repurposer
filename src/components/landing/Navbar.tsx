"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Examples", href: "#examples" },
  { label: "Demo", href: "#demo" },
  { label: "Pricing", href: "#pricing" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-surface/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-lg text-foreground">ContentFlow</span>
          <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-muted">
            Beta
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="transition hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ButtonLink variant="ghost" href="/login">
            Log in
          </ButtonLink>
          <ButtonLink href="/signup">Start free</ButtonLink>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          aria-label="Toggle navigation"
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className="flex flex-col gap-1">
            <span className="h-0.5 w-5 rounded-full bg-foreground" />
            <span
              className={cn(
                "h-0.5 w-5 rounded-full bg-foreground transition",
                open ? "opacity-40" : "opacity-100"
              )}
            />
            <span className="h-0.5 w-5 rounded-full bg-foreground" />
          </span>
        </Button>
      </div>

      {open ? (
        <div className="border-t border-border/60 bg-surface/90 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4 text-sm text-muted">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="hover:text-foreground">
                {item.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-2">
              <ButtonLink variant="secondary" href="/login">
                Log in
              </ButtonLink>
              <ButtonLink href="/signup">Start free</ButtonLink>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
