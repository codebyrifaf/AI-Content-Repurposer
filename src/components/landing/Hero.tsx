import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function Hero() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-20 pt-16 sm:pt-20">
      <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Badge className="bg-surface-2 text-foreground">
            AI content generator for busy businesses
          </Badge>
          <div className="space-y-4">
            <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl lg:text-6xl">
              Generate 30 days of social content in 60 seconds.
            </h1>
            <p className="text-balance text-lg text-muted sm:text-xl">
              ContentFlow is a social media content AI that turns one idea into
              Pinterest titles, AI captions, LinkedIn posts, and video hooks.
              Stay consistent online without the daily workload.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <ButtonLink href="/signup" size="lg">
              Start free
            </ButtonLink>
            <ButtonLink variant="secondary" href="#demo" size="lg">
              See the demo
            </ButtonLink>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-muted">
            <div className="space-y-1">
              <p className="font-display text-xl text-foreground">5</p>
              <p>Free generations every month</p>
            </div>
            <div className="space-y-1">
              <p className="font-display text-xl text-foreground">4</p>
              <p>Niche-specific playbooks</p>
            </div>
            <div className="space-y-1">
              <p className="font-display text-xl text-foreground">1</p>
              <p>Minute to ready-to-post content</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-10 top-10 h-32 w-32 rounded-full bg-brand/30 blur-2xl" />
          <div className="absolute bottom-6 right-0 h-24 w-24 rounded-full bg-brand-2/30 blur-2xl" />
          <div className="animate-fade-up rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-[0_30px_80px_rgba(8,15,28,0.35)] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.3em] text-muted">
                Dashboard preview
              </span>
              <span className="rounded-full bg-brand/20 px-3 py-1 text-xs text-foreground">
                Realtor workflow
              </span>
            </div>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-border/60 bg-surface-2 p-4">
                <p className="text-sm text-muted">Input</p>
                <p className="mt-2 text-base text-foreground">
                  Topic: &quot;Open house weekend for downtown condos&quot;
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-surface-2 p-4">
                <p className="text-sm text-muted">Pinterest title</p>
                <p className="mt-2 text-base text-foreground">
                  The condo tour checklist buyers wish they had earlier
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-surface-2 p-4">
                <p className="text-sm text-muted">Video hook</p>
                <p className="mt-2 text-sm text-foreground">
                  The one photo buyers need before they book a showing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
