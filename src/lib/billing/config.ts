import type { Plan, PlanId } from "@/lib/billing/types";

const parsedLimit = Number.parseInt(
  process.env.NEXT_PUBLIC_FREE_MONTHLY_LIMIT ?? "5",
  10
);

export const FREE_PLAN_LIMIT = Number.isFinite(parsedLimit)
  ? parsedLimit
  : 5;

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    priceLabel: "$0",
    description: "Launch-ready essentials for getting started.",
    generationLimit: FREE_PLAN_LIMIT,
    features: [
      `${FREE_PLAN_LIMIT} generations per month`,
      "All core platforms",
      "Standard output quality",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    priceLabel: "$49",
    description: "Unlimited output for high-volume creators.",
    generationLimit: null,
    badge: "Most popular",
    features: [
      "Unlimited generations",
      "Premium output quality",
      "Priority processing",
      "Future Canva exports",
    ],
  },
];

export function getPlanById(planId: PlanId): Plan {
  const plan = PLANS.find((item) => item.id === planId);
  if (!plan) {
    return PLANS[0];
  }
  return plan;
}
