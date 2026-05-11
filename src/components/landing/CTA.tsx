import { ButtonLink } from "@/components/ui/Button";

export function CTA() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-24">
      <div className="rounded-3xl border border-border/60 bg-surface/80 px-6 py-12 text-center shadow-[0_30px_80px_rgba(8,15,28,0.35)] backdrop-blur-xl sm:px-12">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">
          Ready to stay consistent
        </p>
        <h2 className="mt-4 font-display text-3xl text-foreground sm:text-4xl">
          Replace your social media workload today.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted">
          Turn one idea into a full month of social posts, captions, and hooks.
          Start free and upgrade when you need unlimited output.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <ButtonLink href="/signup" size="lg">
            Start free
          </ButtonLink>
          <ButtonLink href="/dashboard" variant="secondary" size="lg">
            Explore dashboard
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
