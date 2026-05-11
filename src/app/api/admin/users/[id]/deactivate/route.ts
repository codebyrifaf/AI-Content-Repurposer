import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/supabase";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user, isAdmin } = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminSupabaseClient();
  const { error: banError } = await admin.auth.admin.updateUserById(id, {
    ban_duration: "876000h",
  });

  if (banError) {
    return NextResponse.json({ error: banError.message }, { status: 500 });
  }

  const profileUpdatePayload: Database["public"]["Tables"]["profiles"]["Update"] = {
    subscription_status: "canceled",
    subscription_updated_at: new Date().toISOString(),
  };
  const { error: profileError } = await admin
    .from("profiles")
    .update(profileUpdatePayload)
    .eq("id", id);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
