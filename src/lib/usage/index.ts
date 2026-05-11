import type { SupabaseClient } from "@supabase/supabase-js";
import { FREE_PLAN_LIMIT } from "@/lib/billing/config";
import type { Database } from "@/types/supabase";
import type { SubscriptionStatus, UsageSnapshot } from "@/types/usage";

type UsageClient = Pick<SupabaseClient<Database>, "rpc">;

const DEFAULT_STATUS: SubscriptionStatus = "free";

type UsageRow = {
  monthly_generations: number;
  remaining: number | null;
  subscription_status: string;
  monthly_reset_date: string;
};

type ConsumeRow = UsageRow & {
  allowed: boolean;
};

function normalizeStatus(value: string | null | undefined): SubscriptionStatus {
  if (value === "pro" || value === "trialing" || value === "past_due" || value === "canceled") {
    return value;
  }
  return DEFAULT_STATUS;
}

function mapUsage(row: UsageRow, limit: number): UsageSnapshot {
  return {
    monthlyGenerations: row.monthly_generations ?? 0,
    remaining: row.remaining ?? null,
    subscriptionStatus: normalizeStatus(row.subscription_status),
    monthlyResetDate: row.monthly_reset_date,
    limit,
  };
}

export async function getUsageStatus(
  client: UsageClient,
  limit = FREE_PLAN_LIMIT
): Promise<UsageSnapshot> {
  const { data, error } = await client
    .rpc("get_usage_status", { p_limit: limit })
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to fetch usage status.");
  }

  return mapUsage(data as UsageRow, limit);
}

export async function consumeUsage(
  client: UsageClient,
  limit = FREE_PLAN_LIMIT
): Promise<{ allowed: boolean; usage: UsageSnapshot }> {
  const { data, error } = await client
    .rpc("consume_generation", { p_limit: limit })
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to consume usage.");
  }

  const row = data as ConsumeRow;
  return {
    allowed: row.allowed,
    usage: mapUsage(row, limit),
  };
}

export async function refundUsage(client: UsageClient) {
  await client.rpc("refund_generation");
}
