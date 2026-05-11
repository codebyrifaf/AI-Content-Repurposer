import { createHmac, timingSafeEqual } from "node:crypto";
import {
  getAdminPanelEmail,
  getAdminPanelSessionSecret,
  getAdminSessionDurationSeconds,
} from "@/lib/auth/config";

type SessionPayload = {
  email: string;
  exp: number;
};

function encodeBase64Url(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(message: string): string {
  return createHmac("sha256", getAdminPanelSessionSecret())
    .update(message)
    .digest("base64url");
}

export function createAdminSessionToken(): string {
  const ttlSeconds = getAdminSessionDurationSeconds();
  const payload: SessionPayload = {
    email: getAdminPanelEmail(),
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function readAdminSessionToken(token?: string | null): SessionPayload | null {
  if (!token) {
    return null;
  }

  const [encodedPayload, providedSignature] = token.split(".");
  if (!encodedPayload || !providedSignature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  const providedBuffer = Buffer.from(providedSignature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  if (providedBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(providedBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(encodedPayload)) as SessionPayload;
    if (payload.email.toLowerCase() !== getAdminPanelEmail()) {
      return null;
    }
    if (!Number.isFinite(payload.exp) || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function isAdminSessionValid(token?: string | null): boolean {
  return readAdminSessionToken(token) !== null;
}
