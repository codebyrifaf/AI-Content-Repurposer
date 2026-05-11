export const ADMIN_SESSION_COOKIE = "cf_admin_session";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required admin env var: ${name}`);
  }
  return value.trim();
}

export function getAdminPanelEmail(): string {
  return requiredEnv("ADMIN_PANEL_EMAIL").toLowerCase();
}

export function getAdminPanelPasswordHash(): string {
  return requiredEnv("ADMIN_PANEL_PASSWORD_HASH");
}

export function getAdminPanelSessionSecret(): string {
  return requiredEnv("ADMIN_PANEL_SESSION_SECRET");
}

export function getAdminSessionDurationSeconds(): number {
  const raw = process.env.ADMIN_PANEL_SESSION_TTL_SECONDS;
  const parsed = raw ? Number.parseInt(raw, 10) : 60 * 60 * 12;
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 60 * 60 * 12;
  }
  return parsed;
}
