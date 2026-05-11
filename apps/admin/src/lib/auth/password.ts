import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const HASH_PREFIX = "scrypt";
const KEY_LENGTH = 64;

function decodeBase64(value: string): Buffer {
  return Buffer.from(value, "base64");
}

function encodeBase64(value: Buffer): string {
  return value.toString("base64");
}

export function createPasswordHash(password: string): string {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, KEY_LENGTH);
  return `${HASH_PREFIX}$${encodeBase64(salt)}$${encodeBase64(derived)}`;
}

export function verifyPassword(password: string, encoded: string): boolean {
  const parts = encoded.split("$");
  if (parts.length !== 3 || parts[0] !== HASH_PREFIX) {
    return false;
  }

  const [, saltB64, hashB64] = parts;
  const salt = decodeBase64(saltB64);
  const expected = decodeBase64(hashB64);
  const derived = scryptSync(password, salt, expected.length);

  if (expected.length !== derived.length) {
    return false;
  }

  return timingSafeEqual(expected, derived);
}
