import { NextResponse } from "next/server";
import { assertAdminApiSession } from "@/lib/auth/api";
import { createAdminSupabaseClient } from "@/lib/supabase/client";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await assertAdminApiSession();
  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await params;
  const admin = createAdminSupabaseClient();

  const { error } = await admin
    .from("profiles")
    .update({
      subscription_status: "pro",
      subscription_updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
