import { Card } from "@/components/ui/Card";

type StatCardProps = {
  label: string;
  value: string | number;
  trend?: string;
};

export function StatCard({ label, value, trend }: StatCardProps) {
  return (
    <Card className="space-y-2">
      <p className="text-xs uppercase tracking-[0.3em] text-muted">{label}</p>
      <p className="font-display text-3xl text-foreground">{value}</p>
      {trend ? <p className="text-xs text-muted">{trend}</p> : null}
    </Card>
  );
}
