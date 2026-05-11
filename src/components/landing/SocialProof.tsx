import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

const niches = ["Realtors", "Gyms", "Restaurants", "Coaches"];

const highlights = [
  {
    title: "Consistent weekly content",
    description:
      "Generate a full content batch in minutes instead of piecing together posts all week.",
  },
  {
    title: "Conversion-ready hooks",
    description:
      "Every output includes a clear CTA and attention-grabbing opening line.",
  },
  {
    title: "Built for business owners",
    description:
      "Stay visible online even when you are focused on clients, listings, or services.",
  },
];

export function SocialProof() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Built for real businesses
          </p>
          <h2 className="font-display text-3xl text-foreground sm:text-4xl">
            Content consistency without the daily grind.
          </h2>
          <p className="text-base text-muted">
            ContentFlow keeps your brand visible across every platform with
            niche-specific language and fast, conversion-focused messaging.
          </p>
          <div className="flex flex-wrap gap-2">
            {niches.map((niche) => (
              <Badge key={niche} className="bg-surface-2 text-foreground">
                {niche}
              </Badge>
            ))}
          </div>
        </div>
        <div className="grid gap-4">
          {highlights.map((item) => (
            <Card key={item.title} className="space-y-2">
              <h3 className="font-display text-lg text-foreground">
                {item.title}
              </h3>
              <p className="text-sm text-muted">{item.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
