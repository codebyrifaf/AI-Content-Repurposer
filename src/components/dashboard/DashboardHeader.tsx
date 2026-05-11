import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ButtonLink } from "@/components/ui/Button";

type DashboardHeaderProps = {
  userEmail: string;
};

export function DashboardHeader({ userEmail }: DashboardHeaderProps) {
  return (
    <header className="border-b border-border/60 bg-surface/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-display text-lg text-foreground">
            ContentFlow
          </Link>
          <span className="text-xs uppercase tracking-[0.3em] text-muted">
            Dashboard
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted md:inline">
            {userEmail}
          </span>
          <ButtonLink variant="ghost" href="/">
            Back to site
          </ButtonLink>
          <ButtonLink href="/signup">Upgrade</ButtonLink>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
