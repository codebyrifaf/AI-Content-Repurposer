import { NextResponse } from "next/server";
import { normalizeBrandProfileInput } from "@/lib/brand-profiles/normalize";
import {
  createBrandProfile,
  fetchBrandProfiles,
} from "@/lib/supabase/queries";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const profiles = await fetchBrandProfiles(supabase);
    return NextResponse.json({ data: profiles });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch profiles.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = normalizeBrandProfileInput(await req.json());
    const profile = await createBrandProfile(supabase, user.id, payload);
    return NextResponse.json({ data: profile });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create profile.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
