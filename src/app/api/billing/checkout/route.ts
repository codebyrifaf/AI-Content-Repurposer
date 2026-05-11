import { NextResponse } from "next/server";
import { getPlanById } from "@/lib/billing/config";
import { getBillingProvider } from "@/lib/billing";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { PlanId } from "@/lib/billing/types";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({ planId: "pro" }));
  const planId = (body?.planId ?? "pro") as PlanId;
  const plan = getPlanById(planId);

  if (plan.id !== "pro") {
    return NextResponse.json(
      { error: "Only Pro upgrades are available." },
      { status: 400 }
    );
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const provider = getBillingProvider();
  const origin = new URL(request.url).origin;
  const checkoutUrl = await provider.getCheckoutUrl({
    userId: user.id,
    email: user.email ?? "",
    planId: plan.id,
    returnUrl: `${origin}/dashboard`,
  });

  if (!checkoutUrl) {
    return NextResponse.json(
      { error: "Billing is not configured yet." },
      { status: 501 }
    );
  }

  return NextResponse.json({ url: checkoutUrl });
}
