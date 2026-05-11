import type { BillingProvider } from "@/lib/billing/provider";
import type { BillingProviderName } from "@/lib/billing/types";
import { createLemonSqueezyProvider } from "@/lib/billing/providers/lemonSqueezy";

const providerName = (process.env.BILLING_PROVIDER ?? "lemonSqueezy") as BillingProviderName;

export function getBillingProvider(): BillingProvider {
  if (providerName === "lemonSqueezy") {
    return createLemonSqueezyProvider();
  }

  return createLemonSqueezyProvider();
}
