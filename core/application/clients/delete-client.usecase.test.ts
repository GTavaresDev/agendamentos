import { describe, expect, it } from "vitest";
import { DeleteClient } from "./delete-client.usecase";
import { buildClient, mockClientRepository } from "./test-helpers";

describe("DeleteClient", () => {
  it("throws when the client does not exist", async () => {
    const repo = mockClientRepository();
    repo.findById.mockResolvedValue(null);
    const useCase = new DeleteClient(repo);

    await expect(useCase.execute("missing")).rejects.toThrow(/não encontrado/i);
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it("deletes an existing client", async () => {
    const repo = mockClientRepository();
    repo.findById.mockResolvedValue(buildClient({ id: "c1" }));
    const useCase = new DeleteClient(repo);

    await useCase.execute("c1");

    expect(repo.delete).toHaveBeenCalledWith("c1");
  });
});
