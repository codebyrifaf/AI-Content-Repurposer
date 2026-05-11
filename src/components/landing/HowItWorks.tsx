const steps = [
  {
    step: "01",
    title: "Enter a topic",
    description:
      "Drop in your niche, audience, topic, and tone. ContentFlow handles the structure.",
  },
  {
    step: "02",
    title: "Generate content",
    description:
      "Get Pinterest titles, AI captions, LinkedIn posts, hashtags, and hooks in one run.",
  },
  {
    step: "03",
    title: "Post everywhere",
    description:
      "Copy, schedule, and stay consistent without the daily content scramble.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto w-full max-w-6xl px-6 py-20">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            How it works
          </p>
          <h2 className="font-display text-3xl text-foreground sm:text-4xl">
            Replace your social workload in three steps.
          </h2>
          <p className="text-base text-muted">
            ContentFlow compresses planning, writing, and repurposing into a
            single workflow.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.step}
              className="rounded-2xl border border-border/60 bg-surface/70 p-5 transition hover:-translate-y-1 hover:border-border"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-muted">
                {step.step}
              </p>
              <h3 className="mt-3 font-display text-lg text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-muted">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
