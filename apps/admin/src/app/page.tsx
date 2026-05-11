import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminCharts } from "@/components/admin/Charts";
import { RecentActivity } from "@/components/admin/RecentActivity";
import { StatCard } from "@/components/admin/StatCard";
import { UserTable } from "@/components/admin/UserTable";
import { getAdminMetrics, getAdminUsersPage } from "@/lib/admin/analytics";
import { requireAdminSession } from "@/lib/auth/guard";
import { createAdminSupabaseClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams?: Promise<{ q?: string; page?: string; pageSize?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  await requireAdminSession();
  const adminClient = createAdminSupabaseClient();
  const params = (await searchParams) ?? {};

  const query = params.q ?? "";
  const page = Number(params.page ?? "1");
  const pageSize = Number(params.pageSize ?? "20");

  const [metrics, userPage] = await Promise.all([
    getAdminMetrics(adminClient),
    getAdminUsersPage(adminClient, page, pageSize, query),
  ]);

  return (
    <div className="min-h-screen">
      <AdminHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Total users" value={metrics.totalUsers} />
          <StatCard label="Total generations" value={metrics.totalGenerations} />
          <StatCard label="Free users" value={metrics.freeUsers} />
          <StatCard label="Pro users" value={metrics.proUsers} />
          <StatCard label="Generations this month" value={metrics.generationsThisMonth} />
          <StatCard label="Active users this week" value={metrics.activeUsersThisWeek} />
        </div>

        <AdminCharts
          generations={metrics.generationsSeries}
          signups={metrics.signupSeries}
          planDistribution={metrics.planDistribution}
        />

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <UserTable pageData={userPage} />
          <RecentActivity
            newestUsers={metrics.newestUsers}
            newestGenerations={metrics.newestGenerations}
          />
        </div>
      </main>
    </div>
  );
}
