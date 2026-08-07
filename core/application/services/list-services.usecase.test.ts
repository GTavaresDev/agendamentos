import { describe, expect, it } from "vitest";
import { ListServices } from "./list-services.usecase";
import { buildService, mockServiceRepository } from "./test-helpers";

describe("ListServices", () => {
  it("returns all services from the repository", async () => {
    const repo = mockServiceRepository();
    const services = [buildService({ id: "sv1" }), buildService({ id: "sv2" })];
    repo.findAll.mockResolvedValue(services);
    const useCase = new ListServices(repo);

    expect(await useCase.execute()).toEqual(services);
  });
});
