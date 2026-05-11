"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { GenerationInput } from "@/types/generation";

export type OnboardingSample = {
  label: string;
  input: GenerationInput;
};

type OnboardingModalProps = {
  open: boolean;
  samples: OnboardingSample[];
  onClose: () => void;
  onLoadSample: (sample: OnboardingSample) => void;
};

export function OnboardingModal({
  open,
  samples,
  onClose,
  onLoadSample,
}: OnboardingModalProps) {
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
      <Card className="relative w-full max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted">
              Welcome to ContentFlow
            </p>
            <h3 className="mt-2 font-display text-2xl text-foreground">
              Build your first weekly marketing workflow in under a minute.
            </h3>
          </div>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-surface/70 p-4">
            <Badge className="bg-surface-2 text-foreground">Step 1</Badge>
            <p className="mt-3 text-sm text-foreground">Set your weekly focus</p>
            <p className="mt-1 text-xs text-muted">
              Add niche, audience, topic, and weekly goal for connected output.
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-surface/70 p-4">
            <Badge className="bg-surface-2 text-foreground">Step 2</Badge>
            <p className="mt-3 text-sm text-foreground">Apply profile + template</p>
            <p className="mt-1 text-xs text-muted">
              Brand profile and template align voice, CTA style, and structure.
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-surface/70 p-4">
            <Badge className="bg-surface-2 text-foreground">Step 3</Badge>
            <p className="mt-3 text-sm text-foreground">Publish with confidence</p>
            <p className="mt-1 text-xs text-muted">
              Use one strategic weekly plan across carousel, reel, CTA, and captions.
            </p>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Try a sample niche
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {samples.map((sample) => (
              <Button
                key={sample.label}
                variant="secondary"
                onClick={() => onLoadSample(sample)}
              >
                {sample.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted">
            Tip: if you are new, start with one sample then customize the weekly goal.
          </p>
          <Button onClick={onClose}>Got it</Button>
        </div>
      </Card>
    </div>
  );
}
