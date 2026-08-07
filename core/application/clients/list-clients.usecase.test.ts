import { describe, expect, it } from "vitest";
import { ListClients } from "./list-clients.usecase";
import { buildClient, mockClientRepository } from "./test-helpers";

describe("ListClients", () => {
  it("returns all clients from the repository", async () => {
    const repo = mockClientRepository();
    const clients = [buildClient({ id: "c1" }), buildClient({ id: "c2" })];
    repo.findAll.mockResolvedValue(clients);
    const useCase = new ListClients(repo);

    expect(await useCase.execute()).toEqual(clients);
  });
});
