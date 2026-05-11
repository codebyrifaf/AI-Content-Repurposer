import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

const samples = [
  {
    niche: "Realtor",
    headline: "Luxury condo tour for first-time buyers",
    outputs: [
      {
        platform: "Pinterest",
        text: "The condo checklist buyers wish they had before touring",
      },
      {
        platform: "Instagram",
        text: "Touring your first condo? Here are the three details that protect your long-term value.",
      },
      {
        platform: "LinkedIn",
        text: "Market insight: why staged lighting closes listings faster this quarter.",
      },
    ],
  },
  {
    niche: "Gym",
    headline: "4-week strength starter plan",
    outputs: [
      {
        platform: "Pinterest",
        text: "Beginner strength plan you can finish in 30 minutes",
      },
      {
        platform: "Instagram",
        text: "Save this if you want visible progress without living in the gym.",
      },
      {
        platform: "LinkedIn",
        text: "Why consistent 45-minute sessions outperform weekend marathons.",
      },
    ],
  },
  {
    niche: "Restaurant",
    headline: "Weekend chef's special launch",
    outputs: [
      {
        platform: "Pinterest",
        text: "Seasonal menu ideas that sell out every Friday night",
      },
      {
        platform: "Instagram",
        text: "Fresh herbs, slow roast, and one perfect pairing. Reservations open now.",
      },
      {
        platform: "LinkedIn",
        text: "How we design menus that keep guests coming back all quarter.",
      },
    ],
  },
];

const platformColors: Record<string, string> = {
  Pinterest: "bg-pink-500/10 text-pink-100 border-pink-400/40",
  Instagram: "bg-orange-500/10 text-orange-100 border-orange-400/40",
  LinkedIn: "bg-sky-500/10 text-sky-100 border-sky-400/40",
};

export function OutputSamples() {
  return (
    <section id="examples" className="mx-auto w-full max-w-6xl px-6 py-20">
      <div className="flex flex-col gap-8">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Real output samples
          </p>
          <h2 className="font-display text-3xl text-foreground sm:text-4xl">
            See what your social media content AI delivers.
          </h2>
          <p className="text-base text-muted">
            Every output is tailored by niche and ready to post. No fluff, no
            generic AI caption generator language.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {samples.map((sample) => (
            <Card key={sample.niche} className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className="bg-surface-2 text-foreground">
                  {sample.niche}
                </Badge>
                <span className="text-xs text-muted">Sample</span>
              </div>
              <div>
                <p className="text-sm text-muted">Campaign</p>
                <p className="mt-2 text-base text-foreground">
                  {sample.headline}
                </p>
              </div>
              <div className="space-y-3">
                {sample.outputs.map((output) => (
                  <div key={output.platform} className="rounded-xl border border-border/60 bg-surface-2/60 p-3">
                    <Badge className={platformColors[output.platform]}>
                      {output.platform}
                    </Badge>
                    <p className="mt-2 text-sm text-foreground">
                      {output.text}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
