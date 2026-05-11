import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) {
    return false;
  }
  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0) {
    return false;
  }
  return adminEmails.includes(email.toLowerCase());
}

export async function requireAdminUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!isAdminEmail(user.email)) {
    redirect("/dashboard");
  }

  return user;
}

export async function getAdminUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { user, isAdmin: isAdminEmail(user?.email) };
}
