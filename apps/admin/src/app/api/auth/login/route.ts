import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  getAdminPanelEmail,
  getAdminPanelPasswordHash,
  getAdminSessionDurationSeconds,
} from "@/lib/auth/config";
import { verifyPassword } from "@/lib/auth/password";
import { createAdminSessionToken } from "@/lib/auth/session";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = (await request.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  const validEmail = email === getAdminPanelEmail();
  const validPassword = verifyPassword(password, getAdminPanelPasswordHash());

  if (!validEmail || !validPassword) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: createAdminSessionToken(),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: getAdminSessionDurationSeconds(),
  });

  return response;
}
