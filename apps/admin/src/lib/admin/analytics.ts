import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AdminGenerationRow,
  AdminMetrics,
  AdminUserRow,
  AdminUsersPage,
  ChartSeries,
  PlanDistribution,
} from "@/lib/admin/types";

type AdminClient = SupabaseClient;

const DAY_MS = 24 * 60 * 60 * 1000;
const AUTH_LIST_PAGE_SIZE = 200;
const AUTH_LIST_MAX_PAGES = 50;

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

function normalizeAuthUser(raw: unknown): AuthUserRow | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const row = raw as {
    id?: unknown;
    email?: unknown;
    created_at?: unknown;
    last_sign_in_at?: unknown;
  };

  if (typeof row.id !== "string") {
    return null;
  }

  return {
    id: row.id,
    email: typeof row.email === "string" ? row.email : null,
    created_at: typeof row.created_at === "string" ? row.created_at : new Date(0).toISOString(),
    last_sign_in_at: typeof row.last_sign_in_at === "string" ? row.last_sign_in_at : null,
  };
}

async function listAuthUsersPage(
  client: AdminClient,
  page: number,
  perPage: number
): Promise<AuthUserRow[]> {
  const { data, error } = await client.auth.admin.listUsers({ page, perPage });

  if (error || !data?.users) {
    return [];
  }

  return data.users
    .map((user) => normalizeAuthUser(user))
    .filter((user): user is AuthUserRow => user !== null);
}

async function getAuthUsersMapByIds(
  client: AdminClient,
  userIds: string[]
): Promise<Map<string, AuthUserRow>> {
  const targetIds = new Set(userIds);
  const map = new Map<string, AuthUserRow>();

  if (targetIds.size === 0) {
    return map;
  }

  let page = 1;
  while (targetIds.size > 0 && page <= AUTH_LIST_MAX_PAGES) {
    const users = await listAuthUsersPage(client, page, AUTH_LIST_PAGE_SIZE);

    if (users.length === 0) {
      break;
    }

    users.forEach((user) => {
      if (targetIds.has(user.id)) {
        map.set(user.id, user);
        targetIds.delete(user.id);
      }
    });

    if (users.length < AUTH_LIST_PAGE_SIZE) {
      break;
    }

    page += 1;
  }

  return map;
}

async function searchAuthUserIdsByEmail(
  client: AdminClient,
  query: string
): Promise<Set<string>> {
  const normalizedQuery = query.trim().toLowerCase();
  const matchedIds = new Set<string>();

  if (!normalizedQuery) {
    return matchedIds;
  }

  let page = 1;
  while (page <= AUTH_LIST_MAX_PAGES) {
    const users = await listAuthUsersPage(client, page, AUTH_LIST_PAGE_SIZE);

    if (users.length === 0) {
      break;
    }

    users.forEach((user) => {
      const email = user.email?.toLowerCase() ?? "";
      if (email.includes(normalizedQuery)) {
        matchedIds.add(user.id);
      }
    });

    if (users.length < AUTH_LIST_PAGE_SIZE) {
      break;
    }

    page += 1;
  }

  return matchedIds;
}

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
  const generationUserIds = [...new Set(newestGenerationsRows.map((row) => row.user_id))];

  const { data: newestProfilesRaw } = await client
    .from("profiles")
    .select("id, full_name, created_at, monthly_generations, monthly_reset_date, subscription_status")
    .order("created_at", { ascending: false })
    .limit(8);

  const newestProfiles = (newestProfilesRaw ?? []) as ProfileRow[];
  const newestProfileIds = newestProfiles.map((profile) => profile.id);

  const [generationAuthMap, newestAuthMap] = await Promise.all([
    getAuthUsersMapByIds(client, generationUserIds),
    getAuthUsersMapByIds(client, newestProfileIds),
  ]);

  const newestUsers: AdminUserRow[] = newestProfiles.map((profile) => {
    const authUser = newestAuthMap.get(profile.id);
    return {
      id: profile.id,
      email: authUser?.email ?? null,
      plan: profile.subscription_status ?? "free",
      monthlyGenerations: profile.monthly_generations ?? 0,
      monthlyResetDate: profile.monthly_reset_date ?? null,
      signupAt: authUser?.created_at ?? profile.created_at,
      lastSignInAt: authUser?.last_sign_in_at ?? null,
      lastGenerationAt: null,
    };
  });

  const newestGenerations: AdminGenerationRow[] = newestGenerationsRows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    userEmail: generationAuthMap.get(row.user_id)?.email ?? null,
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
  const normalizedQuery = query?.trim() ?? "";

  let usersQuery = client
    .from("profiles")
    .select("id, full_name, created_at, monthly_generations, monthly_reset_date, subscription_status", {
      count: "exact",
    })
    .neq("subscription_status", "free")
    .order("created_at", { ascending: false });

  if (normalizedQuery.length > 0) {
    const matchingIds = await searchAuthUserIdsByEmail(client, normalizedQuery);
    if (matchingIds.size === 0) {
      return {
        users: [],
        total: 0,
        page,
        pageSize,
      };
    }

    usersQuery = usersQuery.in("id", [...matchingIds]);
  }

  const { data: profilesRaw, count } = await usersQuery.range(
    offset,
    offset + pageSize - 1
  );

  const profiles = (profilesRaw ?? []) as ProfileRow[];
  const userIds = profiles.map((profile) => profile.id);

  const [authMap, lastGenRawResult] = await Promise.all([
    getAuthUsersMapByIds(client, userIds),
    client
      .from("generations")
      .select("user_id, created_at")
      .in("user_id", userIds)
      .order("created_at", { ascending: false }),
  ]);

  const lastGenMap = new Map<string, string>();
  (lastGenRawResult.data ?? []).forEach((row) => {
    if (!lastGenMap.has(row.user_id)) {
      lastGenMap.set(row.user_id, row.created_at);
    }
  });

  const users: AdminUserRow[] = profiles.map((profile) => {
    const authUser = authMap.get(profile.id);
    return {
      id: profile.id,
      email: authUser?.email ?? null,
      plan: profile.subscription_status ?? "pro",
      monthlyGenerations: profile.monthly_generations ?? 0,
      monthlyResetDate: profile.monthly_reset_date ?? null,
      signupAt: authUser?.created_at ?? profile.created_at,
      lastSignInAt: authUser?.last_sign_in_at ?? null,
      lastGenerationAt: lastGenMap.get(profile.id) ?? null,
    };
  });

  return {
    users,
    total: count ?? 0,
    page,
    pageSize,
  };
}
