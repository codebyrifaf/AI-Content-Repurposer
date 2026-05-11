import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth/config";
import { isAdminSessionValid } from "@/lib/auth/session";

export async function requireAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!isAdminSessionValid(token)) {
    redirect("/login");
  }
}

export async function getAdminSessionState(): Promise<{ isAuthed: boolean }> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return { isAuthed: isAdminSessionValid(token) };
}
