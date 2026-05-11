import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AdminGenerationRow,
  AdminMetrics,
  AdminUserRow,
  AdminUsersPage,
  ChartSeries,
  PlanDistribution,
} from "@/lib/admin/types";

type AdminClient = Pick<SupabaseClient, "from" | "schema">;

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function createBucketLabels(days: number): { labels: string[]; map: Map<string, number> } {
  const labels: string[] = [];
  const map = new Map<string, number>();
  const today = startOfDay(new Date());

  for (let i = days - 1; i >= 0; i -= 1) {
    const day = new Date(today.getTime() - i * DAY_MS);
    const label = day.toISOString().slice(0, 10);
    labels.push(label);
    map.set(label, 0);
  }

  return { labels, map };
}

function bucketizeDates(dates: string[], days: number): ChartSeries {
  const { labels, map } = createBucketLabels(days);

  dates.forEach((date) => {
    const label = date.slice(0, 10);
    if (map.has(label)) {
      map.set(label, (map.get(label) ?? 0) + 1);
    }
  });

  return {
    labels,
    values: labels.map((label) => map.get(label) ?? 0),
  };
}

type AuthUserRow = {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  created_at: string;
  monthly_generations: number;
  monthly_reset_date: string | null;
  subscription_status: string;
};

type GenerationRow = {
  id: string;
  user_id: string;
  topic: string;
  created_at: string;
};

export async function getAdminMetrics(
  client: AdminClient
): Promise<AdminMetrics> {
  const now = new Date();
  const monthStart = startOfDay(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)));
  const weekStart = new Date(now.getTime() - 7 * DAY_MS);

  const [{ count: totalUsers }, { count: totalGenerations }] = await Promise.all([
    client.from("profiles").select("id", { count: "exact", head: true }),
    client.from("generations").select("id", { count: "exact", head: true }),
  ]);

  const [{ count: freeUsers }, { count: proUsers }] = await Promise.all([
    client
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("subscription_status", "free"),
    client
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .neq("subscription_status", "free"),
  ]);

  const { count: generationsThisMonth } = await client
    .from("generations")
    .select("id", { count: "exact", head: true })
    .gte("created_at", monthStart.toISOString());

  const { data: activeRows } = await client
    .from("generations")
    .select("user_id")
    .gte("created_at", weekStart.toISOString());

  const activeUsers = new Set((activeRows ?? []).map((row) => row.user_id));

  const { data: newestGenerationsRaw } = await client
    .from("generations")
    .select("id, user_id, topic, created_at")
    .order("created_at", { ascending: false })
    .limit(8);

  const newestGenerationsRows = (newestGenerationsRaw ?? []) as GenerationRow[];
  const generationUserIds = newestGenerationsRows.map((row) => row.user_id);

  const { data: newestUsersRaw } = await client
    .schema("auth")
    .from("users")
    .select("id, email, created_at, last_sign_in_at")
    .order("created_at", { ascending: false })
    .limit(8);

  const newestUsersAuth = (newestUsersRaw ?? []) as AuthUserRow[];

  const { data: profilesRaw } = await client
    .from("profiles")
    .select("id, full_name, created_at, monthly_generations, monthly_reset_date, subscription_status")
    .in("id", [...new Set([...generationUserIds, ...newestUsersAuth.map((user) => user.id)])]);

  const profileMap = new Map(
    (profilesRaw ?? []).map((profile) => [profile.id, profile as ProfileRow])
  );

  const newestUsers: AdminUserRow[] = newestUsersAuth.map((user) => {
    const profile = profileMap.get(user.id);
    return {
      id: user.id,
      email: user.email,
      plan: profile?.subscription_status ?? "free",
      monthlyGenerations: profile?.monthly_generations ?? 0,
      monthlyResetDate: profile?.monthly_reset_date ?? null,
      signupAt: user.created_at,
      lastSignInAt: user.last_sign_in_at,
      lastGenerationAt: null,
    };
  });

  const userEmails = new Map(newestUsersAuth.map((user) => [user.id, user.email]));
  const newestGenerations: AdminGenerationRow[] = newestGenerationsRows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    userEmail: userEmails.get(row.user_id) ?? null,
    topic: row.topic,
    createdAt: row.created_at,
  }));

  const { data: generationDatesRaw } = await client
    .from("generations")
    .select("created_at")
    .gte("created_at", new Date(now.getTime() - 30 * DAY_MS).toISOString());

  const generationDates = (generationDatesRaw ?? []).map((row) => row.created_at as string);

  const { data: signupDatesRaw } = await client
    .from("profiles")
    .select("created_at")
    .gte("created_at", new Date(now.getTime() - 30 * DAY_MS).toISOString());

  const signupDates = (signupDatesRaw ?? []).map((row) => row.created_at as string);

  const generationsSeries = bucketizeDates(generationDates, 14);
  const signupSeries = bucketizeDates(signupDates, 14);

  const planDistribution: PlanDistribution = {
    labels: ["Free", "Pro"],
    values: [freeUsers ?? 0, proUsers ?? 0],
  };

  return {
    totalUsers: totalUsers ?? 0,
    totalGenerations: totalGenerations ?? 0,
    freeUsers: freeUsers ?? 0,
    proUsers: proUsers ?? 0,
    generationsThisMonth: generationsThisMonth ?? 0,
    activeUsersThisWeek: activeUsers.size,
    newestUsers,
    newestGenerations,
    generationsSeries,
    signupSeries,
    planDistribution,
  };
}

export async function getAdminUsersPage(
  client: AdminClient,
  page: number,
  pageSize: number,
  query?: string
): Promise<AdminUsersPage> {
  const offset = (page - 1) * pageSize;

  let usersQuery = client
    .schema("auth")
    .from("users")
    .select("id, email, created_at, last_sign_in_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false });

  if (query && query.trim().length > 0) {
    usersQuery = usersQuery.ilike("email", `%${query.trim()}%`);
  }

  const { data: authUsersRaw, count } = await usersQuery.range(
    offset,
    offset + pageSize - 1
  );

  const authUsers = (authUsersRaw ?? []) as AuthUserRow[];
  const userIds = authUsers.map((user) => user.id);

  const { data: profilesRaw } = await client
    .from("profiles")
    .select("id, monthly_generations, monthly_reset_date, subscription_status, created_at")
    .in("id", userIds);

  const profileMap = new Map(
    (profilesRaw ?? []).map((profile) => [profile.id, profile as ProfileRow])
  );

  const { data: lastGenRaw } = await client
    .from("generations")
    .select("user_id, created_at")
    .in("user_id", userIds)
    .order("created_at", { ascending: false });

  const lastGenMap = new Map<string, string>();
  (lastGenRaw ?? []).forEach((row) => {
    if (!lastGenMap.has(row.user_id)) {
      lastGenMap.set(row.user_id, row.created_at);
    }
  });

  const users: AdminUserRow[] = authUsers.map((user) => {
    const profile = profileMap.get(user.id);
    return {
      id: user.id,
      email: user.email,
      plan: profile?.subscription_status ?? "free",
      monthlyGenerations: profile?.monthly_generations ?? 0,
      monthlyResetDate: profile?.monthly_reset_date ?? null,
      signupAt: user.created_at,
      lastSignInAt: user.last_sign_in_at,
      lastGenerationAt: lastGenMap.get(user.id) ?? null,
    };
  });

  return {
    users,
    total: count ?? 0,
    page,
    pageSize,
  };
}
