import { describe, expect, it } from "vitest";
import {
  hashPassword,
  hashPasswordSha256Legacy,
  isBcryptHash,
  isLegacySha256Hash,
  needsRehash,
  verifyPassword,
} from "./password";

describe("hashPassword", () => {
  it("produces a bcrypt hash", async () => {
    const hash = await hashPassword("secret123");
    expect(isBcryptHash(hash)).toBe(true);
    expect(hash).not.toBe("secret123");
  });
});

describe("isBcryptHash", () => {
  it.each(["$2a$12$abc", "$2b$12$abc", "$2y$12$abc"])("recognizes %s as bcrypt", (hash) => {
    expect(isBcryptHash(hash)).toBe(true);
  });

  it("rejects non-bcrypt strings", () => {
    expect(isBcryptHash("plaintext")).toBe(false);
    expect(isBcryptHash(hashPasswordSha256Legacy("secret"))).toBe(false);
  });
});

describe("isLegacySha256Hash", () => {
  it("recognizes a 64-char hex digest", () => {
    expect(isLegacySha256Hash(hashPasswordSha256Legacy("secret"))).toBe(true);
  });

  it("rejects bcrypt hashes and arbitrary strings", () => {
    expect(isLegacySha256Hash("$2a$12$abcabcabcabcabcabcabcabc")).toBe(false);
    expect(isLegacySha256Hash("short")).toBe(false);
  });
});

describe("verifyPassword", () => {
  it("accepts a matching bcrypt hash", async () => {
    const hash = await hashPassword("secret123");
    expect(await verifyPassword("secret123", hash)).toBe(true);
  });

  it("rejects a non-matching bcrypt hash", async () => {
    const hash = await hashPassword("secret123");
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("accepts a matching legacy sha256 hash", async () => {
    const legacy = hashPasswordSha256Legacy("secret123");
    expect(await verifyPassword("secret123", legacy)).toBe(true);
  });

  it("rejects a non-matching legacy sha256 hash", async () => {
    const legacy = hashPasswordSha256Legacy("secret123");
    expect(await verifyPassword("wrong-password", legacy)).toBe(false);
  });

  it("rejects unrecognized hash formats instead of throwing", async () => {
    expect(await verifyPassword("secret123", "not-a-real-hash")).toBe(false);
  });
});

describe("needsRehash", () => {
  it("is false for bcrypt hashes", async () => {
    const hash = await hashPassword("secret123");
    expect(needsRehash(hash)).toBe(false);
  });

  it("is true for legacy sha256 hashes", () => {
    expect(needsRehash(hashPasswordSha256Legacy("secret123"))).toBe(true);
  });
});
