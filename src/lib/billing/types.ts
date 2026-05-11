import type { SubscriptionStatus } from "@/types/usage";

export type PlanId = "free" | "pro";

export type Plan = {
  id: PlanId;
  name: string;
  priceLabel: string;
  description: string;
  features: string[];
  generationLimit: number | null;
  badge?: string;
};

export type BillingProviderName = "lemonSqueezy" | "paddle" | "stripe";

export type CheckoutSessionInput = {
  userId: string;
  email: string;
  planId: PlanId;
  returnUrl: string;
};

export type BillingState = {
  status: SubscriptionStatus;
  planId: PlanId;
};
