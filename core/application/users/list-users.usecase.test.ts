import { describe, expect, it } from "vitest";
import { ListUsers } from "./list-users.usecase";
import { buildUser, mockUserRepository } from "./test-helpers";

describe("ListUsers", () => {
  it("returns all users when no filter is given", async () => {
    const repo = mockUserRepository();
    const users = [buildUser({ id: "u1" }), buildUser({ id: "u2" })];
    repo.findAll.mockResolvedValue(users);
    const useCase = new ListUsers(repo);

    const result = await useCase.execute();

    expect(result).toEqual(users);
  });

  it("filters by search across name, email, and phone", async () => {
    const repo = mockUserRepository();
    repo.findAll.mockResolvedValue([
      buildUser({ id: "u1", name: "Maria Silva", email: "maria@example.com", phone: "111" }),
      buildUser({ id: "u2", name: "João Souza", email: "joao@example.com", phone: "222" }),
    ]);
    const useCase = new ListUsers(repo);

    const result = await useCase.execute({ search: "maria" });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("u1");
  });

  it("filters by role, ignoring the 'Todos' sentinel", async () => {
    const repo = mockUserRepository();
    repo.findAll.mockResolvedValue([
      buildUser({ id: "u1", role: "Administrador" }),
      buildUser({ id: "u2", role: "Funcionario" }),
    ]);
    const useCase = new ListUsers(repo);

    expect(await useCase.execute({ role: "Administrador" })).toHaveLength(1);
    expect(await useCase.execute({ role: "Todos" })).toHaveLength(2);
  });

  it("filters by status, ignoring the 'Todos' sentinel", async () => {
    const repo = mockUserRepository();
    repo.findAll.mockResolvedValue([
      buildUser({ id: "u1", status: "Ativo" }),
      buildUser({ id: "u2", status: "Inativo" }),
    ]);
    const useCase = new ListUsers(repo);

    expect(await useCase.execute({ status: "Inativo" })).toHaveLength(1);
    expect(await useCase.execute({ status: "Todos" })).toHaveLength(2);
  });

  it("combines multiple filters", async () => {
    const repo = mockUserRepository();
    repo.findAll.mockResolvedValue([
      buildUser({ id: "u1", role: "Administrador", status: "Ativo" }),
      buildUser({ id: "u2", role: "Administrador", status: "Inativo" }),
    ]);
    const useCase = new ListUsers(repo);

    const result = await useCase.execute({ role: "Administrador", status: "Ativo" });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("u1");
  });
});
