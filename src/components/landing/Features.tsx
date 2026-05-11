const features = [
  {
    title: "Conversion-first outputs",
    description:
      "Outputs are written to drive clicks, calls, and bookings without sounding like AI.",
  },
  {
    title: "Niche-specific language",
    description:
      "Realtors, gyms, restaurants, and coaches get vocabulary that feels native to their industry.",
  },
  {
    title: "Pinterest content generator",
    description:
      "Searchable titles and descriptions built to capture attention on Pinterest.",
  },
  {
    title: "Campaign consistency",
    description:
      "Save outputs, reuse your best angles, and keep your brand consistent all month.",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto w-full max-w-6xl px-6 py-20">
      <div className="flex flex-col gap-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Features
          </p>
          <h2 className="font-display text-3xl text-foreground sm:text-4xl">
            Premium outputs that save hours every week.
          </h2>
          <p className="text-base text-muted">
            ContentFlow replaces the manual social media workflow with a single
            AI caption generator and planning engine.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-border/60 bg-surface/70 p-6 transition hover:-translate-y-1 hover:border-border hover:bg-surface-2/80"
            >
              <h3 className="font-display text-lg text-foreground">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm text-muted">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
