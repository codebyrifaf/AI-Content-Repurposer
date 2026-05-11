import { Badge } from "@/components/ui/Badge";

const platforms = [
  "Pinterest",
  "Instagram",
  "LinkedIn",
  "Short-form Video",
  "Hashtags",
  "Canva Ideas",
];

export function PlatformStrip() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-6">
      <div className="rounded-2xl border border-border/60 bg-surface/60 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted">
              Social media content AI
            </p>
            <p className="mt-2 text-sm text-muted">
              An AI content generator optimized for every platform you post on.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {platforms.map((platform) => (
              <Badge key={platform} className="bg-surface-2 text-foreground">
                {platform}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
