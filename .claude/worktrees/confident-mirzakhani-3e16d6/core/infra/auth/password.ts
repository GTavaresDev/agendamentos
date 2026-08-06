import crypto from "node:crypto";
import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export function isBcryptHash(hash: string): boolean {
  return hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$");
}

export function isLegacySha256Hash(hash: string): boolean {
  return /^[a-f0-9]{64}$/i.test(hash);
}

export function hashPasswordSha256Legacy(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  if (isBcryptHash(storedHash)) {
    return bcrypt.compare(password, storedHash);
  }

  if (isLegacySha256Hash(storedHash)) {
    const legacy = hashPasswordSha256Legacy(password);
    return legacy === storedHash;
  }

  return false;
}

export function needsRehash(storedHash: string): boolean {
  return !isBcryptHash(storedHash);
}
