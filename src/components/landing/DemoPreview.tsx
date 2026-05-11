"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const demos = [
  {
    id: "realtor",
    label: "Realtor",
    input: {
      niche: "Realtor",
      audience: "First-time buyers",
      topic: "Weekend open house for downtown condos",
      tone: "Confident",
    },
    output: {
      pinterestTitles: [
        "Open house checklist first-time buyers need",
        "The condo tour guide that protects your budget",
      ],
      instagramCaption:
        "Touring condos this weekend? Here are the three details that keep your value protected. Save this before your next showing.",
      linkedinPost:
        "Market update: downtown condo inventory is tightening, so preparation wins. Here is how buyers can tour with confidence and close faster.",
      videoHook: "The one photo buyers need before they book a showing.",
    },
  },
  {
    id: "gym",
    label: "Gym",
    input: {
      niche: "Gym",
      audience: "Busy professionals",
      topic: "4-week strength starter plan",
      tone: "Bold",
    },
    output: {
      pinterestTitles: [
        "4-week strength plan for busy schedules",
        "30-minute gym routine that actually builds muscle",
      ],
      instagramCaption:
        "You do not need a two-hour session to get strong. Try this 4-week starter plan and save it for your next workout.",
      linkedinPost:
        "Performance is built on consistency, not marathon sessions. Here is a 4-week strength block that fits any busy calendar.",
      videoHook: "This 30-minute plan builds more strength than you think.",
    },
  },
  {
    id: "restaurant",
    label: "Restaurant",
    input: {
      niche: "Restaurant",
      audience: "Date-night diners",
      topic: "Chef's weekend tasting menu",
      tone: "Warm",
    },
    output: {
      pinterestTitles: [
        "Weekend tasting menu worth booking early",
        "Seasonal plates guests keep ordering again",
      ],
      instagramCaption:
        "Fresh herbs, slow-roasted flavors, and one perfect pairing. Reservations are open for this weekend's tasting menu.",
      linkedinPost:
        "We design tasting menus that feel intentional and memorable. Here is how we build anticipation and fill weekend seatings.",
      videoHook: "The first bite of this menu sells out seats fast.",
    },
  },
];

export function DemoPreview() {
  const [activeId, setActiveId] = useState(demos[0].id);
  const active = demos.find((demo) => demo.id === activeId) ?? demos[0];

  return (
    <section id="demo" className="mx-auto w-full max-w-6xl px-6 py-20">
      <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <Badge>Interactive demo</Badge>
          <h2 className="font-display text-3xl text-foreground sm:text-4xl">
            Watch an AI content generator build a full batch.
          </h2>
          <p className="text-base text-muted">
            Toggle between niches to see how ContentFlow adapts to each
            business. Every output is tuned for platform, tone, and conversion.
          </p>
          <div className="flex flex-wrap gap-3">
            {demos.map((demo) => (
              <Button
                key={demo.id}
                variant={demo.id === activeId ? "secondary" : "ghost"}
                onClick={() => setActiveId(demo.id)}
              >
                {demo.label}
              </Button>
            ))}
          </div>
          <ul className="space-y-3 text-sm text-muted">
            <li>Pinterest content generator outputs searchable titles.</li>
            <li>AI caption generator builds emotional, save-worthy copy.</li>
            <li>LinkedIn posts stay authoritative and educational.</li>
          </ul>
        </div>
        <div className="rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-[0_30px_90px_rgba(9,16,32,0.35)] backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted">
            <span>{active.label} demo</span>
            <span className="text-foreground">Live</span>
          </div>
          <div className="mt-6 grid gap-4">
            <Card className="space-y-2">
              <p className="text-xs text-muted">Input</p>
              <p className="text-sm text-foreground">
                Niche: {active.input.niche}
              </p>
              <p className="text-sm text-foreground">
                Audience: {active.input.audience}
              </p>
              <p className="text-sm text-foreground">Topic: {active.input.topic}</p>
              <p className="text-sm text-foreground">Tone: {active.input.tone}</p>
            </Card>
            <Card className="space-y-3">
              <p className="text-xs text-muted">Pinterest titles</p>
              {active.output.pinterestTitles.map((title) => (
                <p key={title} className="text-sm text-foreground">
                  {title}
                </p>
              ))}
            </Card>
            <Card className="space-y-2">
              <p className="text-xs text-muted">Instagram caption</p>
              <p className="text-sm text-foreground">
                {active.output.instagramCaption}
              </p>
            </Card>
            <Card className="space-y-2">
              <p className="text-xs text-muted">LinkedIn post</p>
              <p className="text-sm text-foreground">
                {active.output.linkedinPost}
              </p>
            </Card>
            <Card className={cn("space-y-2", "border-amber-400/40")}>
              <p className="text-xs text-muted">Video hook</p>
              <p className="text-sm font-semibold text-foreground">
                {active.output.videoHook}
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
