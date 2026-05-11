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

  const { error: banError } = await admin.auth.admin.updateUserById(id, {
    ban_duration: "876000h",
  });

  if (banError) {
    return NextResponse.json({ error: banError.message }, { status: 500 });
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      subscription_status: "canceled",
      subscription_updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
