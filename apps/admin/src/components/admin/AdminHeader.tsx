import { Badge } from "@/components/ui/Badge";
import { LogoutButton } from "@/components/admin/LogoutButton";

export function AdminHeader() {
  return (
    <header className="border-b border-border/60 bg-surface/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Admin</p>
          <h1 className="font-display text-2xl text-foreground">
            ContentFlow Analytics
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-brand/20 text-foreground">Owner Only</Badge>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
