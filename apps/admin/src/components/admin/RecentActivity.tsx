import { Card } from "@/components/ui/Card";
import type { AdminGenerationRow, AdminUserRow } from "@/lib/admin/types";

const formatDate = (value: string) => value.slice(0, 10);

type RecentActivityProps = {
  newestUsers: AdminUserRow[];
  newestGenerations: AdminGenerationRow[];
};

export function RecentActivity({
  newestUsers,
  newestGenerations,
}: RecentActivityProps) {
  return (
    <Card className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted">
          Recent activity
        </p>
        <p className="mt-2 text-sm text-muted">
          Latest signups and generations.
        </p>
      </div>
      <div className="space-y-3 text-sm text-muted">
        {newestUsers.map((user) => (
          <div key={user.id} className="flex items-center justify-between">
            <span className="text-foreground">New signup</span>
            <span>{user.email ?? "Unknown"} - {formatDate(user.signupAt)}</span>
          </div>
        ))}
        {newestGenerations.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <span className="text-foreground">Generation</span>
            <span>{item.userEmail ?? "User"} - {formatDate(item.createdAt)}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
