// Sets (or changes) the single owner account in .env.local.
//
//   node scripts/set-owner-password.mjs "your new password" [owner email]
//
// Writes OWNER_PASSWORD_HASH (scrypt), keeps/sets OWNER_EMAIL, and creates a
// SESSION_SECRET if there isn't one. Changing the password also rotates the
// secret, which logs out every existing session.
import { randomBytes, scrypt } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const [password, email] = process.argv.slice(2);
if (!password || password.length < 10) {
  console.error('Usage: node scripts/set-owner-password.mjs "password (10+ chars)" [email]');
  process.exit(1);
}

const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".env.local");
const lines = existsSync(envPath) ? readFileSync(envPath, "utf8").split(/\r?\n/) : [];
const env = new Map(lines.filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]));

const salt = randomBytes(16);
const key = await new Promise((res, rej) => scrypt(password, salt, 64, (e, k) => (e ? rej(e) : res(k))));

env.set("OWNER_PASSWORD_HASH", `scrypt:${salt.toString("base64url")}:${key.toString("base64url")}`);
env.set("SESSION_SECRET", randomBytes(32).toString("base64url"));
if (email) env.set("OWNER_EMAIL", email.trim().toLowerCase());
if (!env.has("OWNER_EMAIL")) {
  console.error("No OWNER_EMAIL yet — pass it as the second argument.");
  process.exit(1);
}
if (!env.has("NEXT_PUBLIC_SITE_URL")) env.set("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");

const out = [
  "# Local secrets for Anime World Fun — never commit this file.",
  "# Change the owner password with: node scripts/set-owner-password.mjs \"new password\"",
  ...[...env].map(([k, v]) => `${k}=${v}`),
  "",
].join("\n");
writeFileSync(envPath, out);
console.log(`Owner account saved to ${envPath} (restart the dev server to pick it up).`);
