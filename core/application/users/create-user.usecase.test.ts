import { describe, expect, it } from "vitest";
import { CreateUser } from "./create-user.usecase";
import { buildUser, mockUserRepository } from "./test-helpers";

describe("CreateUser", () => {
  it("rejects a duplicate email", async () => {
    const repo = mockUserRepository();
    repo.findByEmail.mockResolvedValue(buildUser());
    const useCase = new CreateUser(repo);

    await expect(
      useCase.execute({ name: "Novo", email: "maria@example.com" }),
    ).rejects.toThrow(/já existe/i);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it("normalizes email and applies defaults", async () => {
    const repo = mockUserRepository();
    repo.findByEmail.mockResolvedValue(null);
    repo.save.mockImplementation(async (u) => u);
    const useCase = new CreateUser(repo);

    const result = await useCase.execute({ name: "João Souza", email: "  Joao@Example.com  " });

    expect(result.email).toBe("joao@example.com");
    expect(result.role).toBe("Funcionario");
    expect(result.status).toBe("Ativo");
    expect(result.initials).toBe("JS");
    expect(result.failedLoginAttempts).toBe(0);
  });

  it("passes through an explicit role, status, and password", async () => {
    const repo = mockUserRepository();
    repo.findByEmail.mockResolvedValue(null);
    repo.save.mockImplementation(async (u) => u);
    const useCase = new CreateUser(repo);

    const result = await useCase.execute({
      name: "Admin",
      email: "admin@example.com",
      role: "Administrador",
      status: "Inativo",
      password: "hashedvalue",
    });

    expect(result.role).toBe("Administrador");
    expect(result.status).toBe("Inativo");
    expect(result.password).toBe("hashedvalue");
    expect(result.toJSON().password).toBeUndefined();
  });
});
