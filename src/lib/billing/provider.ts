import type { BillingProviderName, CheckoutSessionInput } from "@/lib/billing/types";

export type BillingProvider = {
  name: BillingProviderName;
  getCheckoutUrl: (input: CheckoutSessionInput) => Promise<string | null>;
};
