import { NextResponse } from "next/server";
import { normalizeBrandProfileUpdate } from "@/lib/brand-profiles/normalize";
import {
  deleteBrandProfile,
  updateBrandProfile,
} from "@/lib/supabase/queries";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = normalizeBrandProfileUpdate(await request.json());
    const profile = await updateBrandProfile(supabase, id, payload);
    return NextResponse.json({ data: profile });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to update profile.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await deleteBrandProfile(supabase, id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to delete profile.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
