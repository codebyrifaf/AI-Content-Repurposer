"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PLANS } from "@/lib/billing/config";
import type { Plan, PlanId } from "@/lib/billing/types";
import { cn } from "@/lib/utils";

const planStyles: Record<PlanId, string> = {
  free: "border-border/60 bg-surface/70",
  pro: "border-brand/60 bg-surface-2/80",
};

type UpgradeModalProps = {
  open: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  loading?: boolean;
};

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <Card className={cn("flex h-full flex-col gap-4", planStyles[plan.id])}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            {plan.name}
          </p>
          <p className="mt-2 font-display text-3xl text-foreground">
            {plan.priceLabel}
            <span className="text-base text-muted">/mo</span>
          </p>
        </div>
        {plan.badge ? (
          <Badge className="bg-brand/20 text-foreground">{plan.badge}</Badge>
        ) : null}
      </div>
      <p className="text-sm text-muted">{plan.description}</p>
      <ul className="space-y-2 text-sm text-muted">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand" />
            {feature}
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function UpgradeModal({ open, onClose, onUpgrade, loading }: UpgradeModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6 py-10">
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur"
        aria-hidden
        onClick={onClose}
      />
      <div className="relative w-full max-w-3xl space-y-6 rounded-3xl border border-border/60 bg-surface/90 p-6 shadow-[0_40px_120px_rgba(5,10,20,0.4)]">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">
              Upgrade
            </p>
            <h3 className="font-display text-2xl text-foreground">
              Keep your content engine running.
            </h3>
            <p className="text-sm text-muted">
              Unlock unlimited generations, premium outputs, and upcoming Canva
              exports.
            </p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-muted">
            You will be redirected to a secure checkout.
          </p>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={onClose}>
              Not now
            </Button>
            <Button onClick={onUpgrade} disabled={loading}>
              {loading ? "Redirecting..." : "Upgrade to Pro"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
