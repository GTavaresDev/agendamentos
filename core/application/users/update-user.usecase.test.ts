import { describe, expect, it } from "vitest";
import { UpdateUser } from "./update-user.usecase";
import { buildUser, mockUserRepository } from "./test-helpers";

describe("UpdateUser", () => {
  it("throws when the user does not exist", async () => {
    const repo = mockUserRepository();
    repo.findById.mockResolvedValue(null);
    const useCase = new UpdateUser(repo);

    await expect(useCase.execute({ id: "missing" })).rejects.toThrow(/não encontrado/i);
  });

  it("only overrides the fields provided, keeping the rest", async () => {
    const repo = mockUserRepository();
    repo.findById.mockResolvedValue(buildUser({ name: "Maria Silva", phone: "111" }));
    repo.update.mockImplementation(async (u) => u);
    const useCase = new UpdateUser(repo);

    const result = await useCase.execute({ id: "u1", phone: "999" });

    expect(result.phone).toBe("999");
    expect(result.name).toBe("Maria Silva");
  });

  it("regenerates initials when the name changes", async () => {
    const repo = mockUserRepository();
    repo.findById.mockResolvedValue(buildUser({ name: "Maria Silva", initials: "MS" }));
    repo.update.mockImplementation(async (u) => u);
    const useCase = new UpdateUser(repo);

    const result = await useCase.execute({ id: "u1", name: "João Souza" });

    expect(result.initials).toBe("JS");
  });

  it("allows explicitly clearing lockedUntil and last", async () => {
    const repo = mockUserRepository();
    repo.findById.mockResolvedValue(
      buildUser({ lockedUntil: new Date("2026-01-01"), last: "Online" }),
    );
    repo.update.mockImplementation(async (u) => u);
    const useCase = new UpdateUser(repo);

    const result = await useCase.execute({ id: "u1", lockedUntil: null, last: null });

    expect(result.lockedUntil).toBeNull();
    expect(result.last).toBeNull();
  });
});
