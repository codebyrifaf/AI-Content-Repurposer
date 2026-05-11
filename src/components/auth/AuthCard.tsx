import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <Card className="w-full max-w-md">
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="font-display text-2xl text-foreground">{title}</h1>
          <p className="text-sm text-muted">{subtitle}</p>
        </div>
        {children}
        {footer ? <div className="text-sm text-muted">{footer}</div> : null}
      </div>
    </Card>
  );
}
