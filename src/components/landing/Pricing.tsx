import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Launch-ready essentials for staying visible online.",
    features: [
      "5 generations per month",
      "Pinterest, Instagram, LinkedIn",
      "Video hooks + hashtags",
      "Basic history",
    ],
    cta: "Start free",
  },
  {
    name: "Pro",
    price: "$49",
    description: "Unlimited output for high-volume marketing teams.",
    features: [
      "Unlimited generations",
      "Premium output quality",
      "Priority processing",
      "Future Canva exports",
    ],
    highlight: true,
    cta: "Upgrade to Pro",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto w-full max-w-6xl px-6 py-20">
      <div className="flex flex-col gap-10">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Pricing</p>
          <h2 className="font-display text-3xl text-foreground sm:text-4xl">
            Pricing built for consistent social growth.
          </h2>
          <p className="text-base text-muted">
            Start free and unlock unlimited generations when you are ready to
            scale.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={plan.highlight ? "border-brand/60" : ""}
            >
              <div className="flex h-full flex-col gap-6">
                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-[0.3em] text-muted">
                    {plan.name}
                  </p>
                  {plan.highlight ? (
                    <Badge className="bg-brand/20 text-foreground">
                      Most popular
                    </Badge>
                  ) : null}
                  <p className="font-display text-4xl text-foreground">
                    {plan.price}
                    <span className="text-base text-muted">/mo</span>
                  </p>
                  <p className="text-sm text-muted">{plan.description}</p>
                </div>
                <ul className="space-y-3 text-sm text-muted">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-brand" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <ButtonLink
                  href="/signup"
                  variant={plan.highlight ? "primary" : "secondary"}
                  className="mt-auto"
                >
                  {plan.cta}
                </ButtonLink>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
