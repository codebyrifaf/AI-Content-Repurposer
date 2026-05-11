import type { BillingProvider } from "@/lib/billing/provider";
import type { CheckoutSessionInput } from "@/lib/billing/types";

function ensureHttps(value: string) {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  return `https://${value}`;
}

function buildCheckoutUrl(input: CheckoutSessionInput): string | null {
  const checkoutUrl = process.env.LEMON_SQUEEZY_CHECKOUT_URL;
  const storeDomain = process.env.LEMON_SQUEEZY_STORE_DOMAIN;
  const productId = process.env.LEMON_SQUEEZY_PRODUCT_ID;

  const baseUrl = checkoutUrl
    ? checkoutUrl
    : storeDomain && productId
      ? `${ensureHttps(storeDomain)}/checkout/buy/${productId}`
      : null;

  if (!baseUrl) {
    return null;
  }

  const url = new URL(baseUrl);
  url.searchParams.set("checkout[custom][user_id]", input.userId);
  url.searchParams.set("checkout[custom][plan_id]", input.planId);
  url.searchParams.set("checkout[custom][return_url]", input.returnUrl);

  if (input.email) {
    url.searchParams.set("checkout[email]", input.email);
  }

  return url.toString();
}

export function createLemonSqueezyProvider(): BillingProvider {
  return {
    name: "lemonSqueezy",
    async getCheckoutUrl(input: CheckoutSessionInput) {
      return buildCheckoutUrl(input);
    },
  };
}
