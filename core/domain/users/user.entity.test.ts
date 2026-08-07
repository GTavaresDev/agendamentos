import { describe, expect, it } from "vitest";
import { User, type UserProps } from "./user.entity";

const props = (overrides: Partial<UserProps> = {}): UserProps => ({
  id: "u1",
  name: "Maria Silva",
  email: "maria@example.com",
  phone: "11999999999",
  password: "hashed-secret",
  role: "Funcionario",
  status: "Ativo",
  initials: "MS",
  ...overrides,
});

describe("User validation", () => {
  it("rejects an empty name", () => {
    expect(() => new User(props({ name: "" }))).toThrow(/Nome/);
  });

  it("rejects a blank name", () => {
    expect(() => new User(props({ name: "   " }))).toThrow(/Nome/);
  });

  it("rejects an email without @", () => {
    expect(() => new User(props({ email: "not-an-email" }))).toThrow(/E-mail/);
  });

  it("accepts valid props", () => {
    expect(() => new User(props())).not.toThrow();
  });
});

describe("User.toJSON — security boundary", () => {
  it("never exposes the password field", () => {
    const user = new User(props({ password: "super-secret-hash" }));
    const json = user.toJSON();
    expect(json.password).toBeUndefined();
    expect(JSON.stringify(json)).not.toContain("super-secret-hash");
  });

  it("still exposes the password when the user has none set", () => {
    const user = new User(props({ password: null }));
    expect(user.toJSON().password).toBeUndefined();
  });
});

describe("User.toPersistenceJSON", () => {
  it("includes the password for persistence purposes", () => {
    const user = new User(props({ password: "super-secret-hash" }));
    expect(user.toPersistenceJSON().password).toBe("super-secret-hash");
  });
});

describe("User getters", () => {
  it("defaults failedLoginAttempts to 0 when not set", () => {
    const user = new User(props({ failedLoginAttempts: undefined }));
    expect(user.failedLoginAttempts).toBe(0);
  });

  it("exposes the raw failedLoginAttempts when set", () => {
    const user = new User(props({ failedLoginAttempts: 3 }));
    expect(user.failedLoginAttempts).toBe(3);
  });
});

describe("User.generateInitials", () => {
  it("uses first+last initial for multi-word names", () => {
    expect(User.generateInitials("Maria Silva")).toBe("MS");
  });

  it("uses first two letters for single-word names", () => {
    expect(User.generateInitials("Maria")).toBe("MA");
  });

  it("falls back to U for an empty/whitespace name", () => {
    expect(User.generateInitials("   ")).toBe("U");
  });

  it("ignores extra whitespace between words", () => {
    expect(User.generateInitials("  Maria   Eduarda  Silva  ")).toBe("MS");
  });
});
