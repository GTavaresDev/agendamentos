import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthenticateUser, AuthenticationError } from "./authenticate-user.usecase";
import { hashPassword } from "@core/infra/auth/password";
import { buildUser, mockUserRepository } from "./test-helpers";

describe("AuthenticateUser", () => {
  const originalMasterUserId = process.env.MASTER_ADMIN_USER_ID;
  const originalMasterPassword = process.env.MASTER_ADMIN_PASSWORD;

  beforeEach(() => {
    delete process.env.MASTER_ADMIN_USER_ID;
    delete process.env.MASTER_ADMIN_PASSWORD;
  });

  afterEach(() => {
    process.env.MASTER_ADMIN_USER_ID = originalMasterUserId;
    process.env.MASTER_ADMIN_PASSWORD = originalMasterPassword;
    vi.restoreAllMocks();
  });

  it("throws AuthenticationError for an unknown email without master fallback", async () => {
    const repo = mockUserRepository();
    repo.findByEmail.mockResolvedValue(null);
    const useCase = new AuthenticateUser(repo);

    await expect(useCase.execute("nobody@example.com", "pw")).rejects.toThrow(
      AuthenticationError,
    );
  });

  it("throws AuthenticationError for a user with no password set", async () => {
    const repo = mockUserRepository();
    repo.findByEmail.mockResolvedValue(buildUser({ password: null }));
    const useCase = new AuthenticateUser(repo);

    await expect(useCase.execute("maria@example.com", "pw")).rejects.toThrow(
      AuthenticationError,
    );
  });

  it("throws AuthenticationError for an inactive user even with correct password", async () => {
    const hash = await hashPassword("correct-password");
    const repo = mockUserRepository();
    repo.findByEmail.mockResolvedValue(buildUser({ password: hash, status: "Inativo" }));
    const useCase = new AuthenticateUser(repo);

    await expect(useCase.execute("maria@example.com", "correct-password")).rejects.toThrow(
      /inativo/i,
    );
  });

  it("throws AuthenticationError for a wrong password", async () => {
    const hash = await hashPassword("correct-password");
    const repo = mockUserRepository();
    const user = buildUser({ password: hash, failedLoginAttempts: 0 });
    repo.findByEmail.mockResolvedValue(user);
    repo.findById.mockResolvedValue(user);
    repo.update.mockResolvedValue(buildUser());
    const useCase = new AuthenticateUser(repo);

    await expect(useCase.execute("maria@example.com", "wrong-password")).rejects.toThrow(
      AuthenticationError,
    );
    expect(repo.update).toHaveBeenCalledWith(
      expect.objectContaining({ failedLoginAttempts: 1 }),
    );
  });

  it("locks the account after 5 failed attempts", async () => {
    const hash = await hashPassword("correct-password");
    const repo = mockUserRepository();
    const user = buildUser({ password: hash, failedLoginAttempts: 4 });
    repo.findByEmail.mockResolvedValue(user);
    repo.findById.mockResolvedValue(user);
    repo.update.mockResolvedValue(buildUser());
    const useCase = new AuthenticateUser(repo);

    await expect(useCase.execute("maria@example.com", "wrong-password")).rejects.toThrow(
      /limite de 5 tentativas/,
    );
    expect(repo.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: "Inativo", failedLoginAttempts: 5 }),
    );
  });

  it("succeeds with a correct password and resets failed attempts", async () => {
    const hash = await hashPassword("correct-password");
    const repo = mockUserRepository();
    const user = buildUser({ password: hash, failedLoginAttempts: 3, role: "Administrador" });
    repo.findByEmail.mockResolvedValue(user);
    repo.findById.mockResolvedValue(user);
    repo.update.mockResolvedValue(buildUser());
    const useCase = new AuthenticateUser(repo);

    const result = await useCase.execute("maria@example.com", "correct-password");

    expect(result.email).toBe("maria@example.com");
    expect(result.permissionLevel).toBe(1);
    expect(repo.update).toHaveBeenCalledWith(
      expect.objectContaining({ failedLoginAttempts: 0, lockedUntil: null }),
    );
  });

  it("never exposes the password hash in the returned DTO", async () => {
    const hash = await hashPassword("correct-password");
    const repo = mockUserRepository();
    const user = buildUser({ password: hash });
    repo.findByEmail.mockResolvedValue(user);
    repo.findById.mockResolvedValue(user);
    repo.update.mockResolvedValue(buildUser());
    const useCase = new AuthenticateUser(repo);

    const result = await useCase.execute("maria@example.com", "correct-password");

    expect(result).not.toHaveProperty("password");
    expect(JSON.stringify(result)).not.toContain(hash);
  });

  it("normalizes email casing/whitespace before lookup", async () => {
    const hash = await hashPassword("correct-password");
    const repo = mockUserRepository();
    const user = buildUser({ password: hash });
    repo.findByEmail.mockResolvedValue(user);
    repo.findById.mockResolvedValue(user);
    repo.update.mockResolvedValue(buildUser());
    const useCase = new AuthenticateUser(repo);

    await useCase.execute("  Maria@Example.com  ", "correct-password");

    expect(repo.findByEmail).toHaveBeenCalledWith("maria@example.com");
  });

  it("rehashes a legacy sha256 password on successful login", async () => {
    const repo = mockUserRepository();
    // sha256("correct-password")
    const crypto = await import("node:crypto");
    const legacyHash = crypto.createHash("sha256").update("correct-password").digest("hex");
    const user = buildUser({ password: legacyHash });
    repo.findByEmail.mockResolvedValue(user);
    repo.findById.mockResolvedValue(user);
    repo.update.mockResolvedValue(buildUser());
    const useCase = new AuthenticateUser(repo);

    await useCase.execute("maria@example.com", "correct-password");

    const updateArg = repo.update.mock.calls[0][0];
    expect(updateArg.password).not.toBe(legacyHash);
  });

  describe("master admin fallback", () => {
    it("allows login with master password when DB is unreachable", async () => {
      process.env.MASTER_ADMIN_PASSWORD = "master-secret";
      const repo = mockUserRepository();
      repo.findByEmail.mockRejectedValue(new Error("connection refused"));
      const useCase = new AuthenticateUser(repo);

      const result = await useCase.execute("admin@agendamentos.com", "master-secret");

      expect(result.role).toBe("Administrador");
      expect(result.permissionLevel).toBe(1);
    });

    it("propagates the DB error when master password does not match", async () => {
      process.env.MASTER_ADMIN_PASSWORD = "master-secret";
      const repo = mockUserRepository();
      const dbError = new Error("connection refused");
      repo.findByEmail.mockRejectedValue(dbError);
      const useCase = new AuthenticateUser(repo);

      await expect(useCase.execute("someone@example.com", "wrong")).rejects.toThrow(dbError);
    });

    it("falls back to master admin when user is not found in DB", async () => {
      process.env.MASTER_ADMIN_PASSWORD = "master-secret";
      const repo = mockUserRepository();
      repo.findByEmail.mockResolvedValue(null);
      const useCase = new AuthenticateUser(repo);

      const result = await useCase.execute("nobody@example.com", "master-secret");

      expect(result.role).toBe("Administrador");
    });

    it("does not grant master access when the password does not match", async () => {
      process.env.MASTER_ADMIN_PASSWORD = "master-secret";
      const repo = mockUserRepository();
      repo.findByEmail.mockResolvedValue(null);
      const useCase = new AuthenticateUser(repo);

      await expect(useCase.execute("nobody@example.com", "wrong-guess")).rejects.toThrow(
        AuthenticationError,
      );
    });
  });
});
