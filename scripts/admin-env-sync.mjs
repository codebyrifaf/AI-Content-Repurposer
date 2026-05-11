import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourcePath = path.join(root, ".env.local");
const targetPath = path.join(root, "apps", "admin", ".env.local");

if (!existsSync(sourcePath)) {
  console.warn("[admin-env-sync] .env.local not found at repo root. Skipping sync.");
  process.exit(0);
}

const desiredKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ADMIN_PANEL_EMAIL",
  "ADMIN_PANEL_PASSWORD_HASH",
  "ADMIN_PANEL_SESSION_SECRET",
  "ADMIN_PANEL_SESSION_TTL_SECONDS",
  "NEXT_PUBLIC_ADMIN_PANEL_URL",
];

const raw = readFileSync(sourcePath, "utf8");
const map = new Map();

raw.split(/\r?\n/).forEach((line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    return;
  }

  const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (!match) {
    return;
  }

  const [, key, value] = match;
  map.set(key, value);
});

const lines = [
  "# Auto-generated from root .env.local by scripts/admin-env-sync.mjs",
  "# Edit root .env.local, then rerun `npm run dev:admin`.",
  "",
];

desiredKeys.forEach((key) => {
  const value = map.get(key);
  if (typeof value === "string" && value.length > 0) {
    if (key === "ADMIN_PANEL_PASSWORD_HASH") {
      const unquoted = value
        .replace(/^'(.*)'$/s, "$1")
        .replace(/^"(.*)"$/s, "$1");
      const escaped = unquoted.replace(/\$/g, "\\$");
      lines.push(`${key}=${escaped}`);
      return;
    }
    lines.push(`${key}=${value}`);
  }
});

writeFileSync(targetPath, `${lines.join("\n")}\n`, "utf8");
console.log(`[admin-env-sync] Wrote ${targetPath}`);
