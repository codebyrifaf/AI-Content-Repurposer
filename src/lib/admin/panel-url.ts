export function getAdminPanelBaseUrl(): string {
  return process.env.NEXT_PUBLIC_ADMIN_PANEL_URL?.trim() || "http://localhost:3001";
}

export function buildAdminPanelUrl(pathname = "/"): string {
  const base = getAdminPanelBaseUrl();
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return new URL(normalizedPath, base).toString();
}
