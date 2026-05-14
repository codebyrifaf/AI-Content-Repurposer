import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { FREE_PLAN_LIMIT } from "@/lib/billing/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { fetchGenerations } from "@/lib/supabase/queries";
import { getUsageStatus } from "@/lib/usage";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  let history = [] as Awaited<ReturnType<typeof fetchGenerations>>;
  try {
    history = await fetchGenerations(supabase, 30);
  } catch {
    history = [];
  }

  let usage;
  try {
    usage = await getUsageStatus(supabase);
  } catch {
    usage = {
      monthlyGenerations: 0,
      remaining: 0,
      subscriptionStatus: "free" as const,
      monthlyResetDate: new Date().toISOString(),
      limit: FREE_PLAN_LIMIT,
    };
  }

  return (
    <DashboardClient
      initialHistory={history}
      initialUsage={usage}
      userEmail={user.email ?? "Account"}
    />
  );
}
