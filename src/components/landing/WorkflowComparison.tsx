import { Card } from "@/components/ui/Card";

const before = [
  "Outline a week of posts manually",
  "Write separate captions for each platform",
  "Rework hashtags and hooks repeatedly",
  "Lose momentum when schedules slip",
];

const after = [
  "Generate 30 days of content in seconds",
  "Get Pinterest, Instagram, LinkedIn outputs at once",
  "Copy-ready hashtags and video hooks included",
  "Save workflows to stay consistent",
];

export function WorkflowComparison() {
  return (
    <section id="workflow" className="mx-auto w-full max-w-6xl px-6 py-20">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Before</p>
          <h3 className="font-display text-2xl text-foreground">
            Manual social workload
          </h3>
          <ul className="space-y-3 text-sm text-muted">
            {before.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                {item}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="space-y-4 border-brand/60">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">After</p>
          <h3 className="font-display text-2xl text-foreground">
            ContentFlow workflow
          </h3>
          <ul className="space-y-3 text-sm text-muted">
            {after.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand" />
                {item}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </section>
  );
}
