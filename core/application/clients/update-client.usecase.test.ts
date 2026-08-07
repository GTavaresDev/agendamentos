import { describe, expect, it } from "vitest";
import { UpdateClient } from "./update-client.usecase";
import { buildClient, mockClientRepository } from "./test-helpers";

describe("UpdateClient", () => {
  it("throws when the client does not exist", async () => {
    const repo = mockClientRepository();
    repo.findById.mockResolvedValue(null);
    const useCase = new UpdateClient(repo);

    await expect(useCase.execute({ id: "missing" })).rejects.toThrow(/não encontrado/i);
  });

  it("updates only the provided fields", async () => {
    const repo = mockClientRepository();
    const client = buildClient({ phone: "111" });
    repo.findById.mockResolvedValue(client);
    const useCase = new UpdateClient(repo);

    const result = await useCase.execute({ id: "c1", phone: "999" });

    expect(result.phone).toBe("999");
    expect(repo.update).toHaveBeenCalledWith(client);
  });
});
