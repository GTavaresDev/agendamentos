import { describe, expect, it } from "vitest";
import { DeleteUser } from "./delete-user.usecase";
import { buildUser, mockUserRepository } from "./test-helpers";

describe("DeleteUser", () => {
  it("throws when the user does not exist", async () => {
    const repo = mockUserRepository();
    repo.findById.mockResolvedValue(null);
    const useCase = new DeleteUser(repo);

    await expect(useCase.execute("missing")).rejects.toThrow(/não encontrado/i);
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it("deletes an existing user", async () => {
    const repo = mockUserRepository();
    repo.findById.mockResolvedValue(buildUser({ id: "u1" }));
    const useCase = new DeleteUser(repo);

    await useCase.execute("u1");

    expect(repo.delete).toHaveBeenCalledWith("u1");
  });
});
