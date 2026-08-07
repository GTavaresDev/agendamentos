import { describe, expect, it } from "vitest";
import { UpdateService } from "./update-service.usecase";
import { buildService, mockServiceRepository } from "./test-helpers";

describe("UpdateService", () => {
  it("throws when the service does not exist", async () => {
    const repo = mockServiceRepository();
    repo.findById.mockResolvedValue(null);
    const useCase = new UpdateService(repo);

    await expect(useCase.execute({ id: "missing" })).rejects.toThrow(/não encontrado/i);
  });

  it("rejects renaming to a name already used by another service", async () => {
    const repo = mockServiceRepository();
    repo.findById.mockResolvedValue(buildService({ id: "sv1" }));
    repo.findByName.mockResolvedValue(buildService({ id: "sv2", name: "Manicure" }));
    const useCase = new UpdateService(repo);

    await expect(useCase.execute({ id: "sv1", name: "Manicure" })).rejects.toThrow(/já existe/i);
  });

  it("allows renaming to the same name on the same service (no-op rename)", async () => {
    const repo = mockServiceRepository();
    const service = buildService({ id: "sv1", name: "Corte" });
    repo.findById.mockResolvedValue(service);
    repo.findByName.mockResolvedValue(service);
    const useCase = new UpdateService(repo);

    await expect(useCase.execute({ id: "sv1", name: "Corte" })).resolves.toBeDefined();
  });

  it("rejects a zero or negative duration", async () => {
    const repo = mockServiceRepository();
    repo.findById.mockResolvedValue(buildService());
    const useCase = new UpdateService(repo);

    await expect(useCase.execute({ id: "sv1", duration: 0 })).rejects.toThrow(/duração/i);
  });

  it("rejects a negative price", async () => {
    const repo = mockServiceRepository();
    repo.findById.mockResolvedValue(buildService());
    const useCase = new UpdateService(repo);

    await expect(useCase.execute({ id: "sv1", price: -5 })).rejects.toThrow(/preço/i);
  });

  it("updates details and persists the change", async () => {
    const repo = mockServiceRepository();
    const service = buildService({ id: "sv1", price: 50 });
    repo.findById.mockResolvedValue(service);
    const useCase = new UpdateService(repo);

    const result = await useCase.execute({ id: "sv1", price: 80 });

    expect(result.price).toBe(80);
    expect(repo.update).toHaveBeenCalledWith(service);
  });
});
