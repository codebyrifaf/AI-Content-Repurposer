import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];

if (!password) {
  console.error("Usage: npm run admin:hash -- \"your-strong-password\"");
  process.exit(1);
}

const salt = randomBytes(16).toString("base64");
const hash = scryptSync(password, Buffer.from(salt, "base64"), 64).toString("base64");

console.log(`scrypt$${salt}$${hash}`);
