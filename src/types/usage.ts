export type SubscriptionStatus =
  | "free"
  | "pro"
  | "trialing"
  | "past_due"
  | "canceled";

export type UsageSnapshot = {
  monthlyGenerations: number;
  remaining: number | null;
  subscriptionStatus: SubscriptionStatus;
  monthlyResetDate: string;
  limit: number;
};
