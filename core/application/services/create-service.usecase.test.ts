import { describe, expect, it } from "vitest";
import { CreateService } from "./create-service.usecase";
import { buildService, mockServiceRepository } from "./test-helpers";

describe("CreateService", () => {
  it("rejects a duplicate name", async () => {
    const repo = mockServiceRepository();
    repo.findByName.mockResolvedValue(buildService());
    const useCase = new CreateService(repo);

    await expect(useCase.execute({ name: "Corte", duration: 30 })).rejects.toThrow(/já existe/i);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it("rejects a zero or negative duration", async () => {
    const repo = mockServiceRepository();
    repo.findByName.mockResolvedValue(null);
    const useCase = new CreateService(repo);

    await expect(useCase.execute({ name: "Corte", duration: 0 })).rejects.toThrow(/duração/i);
  });

  it("rejects a negative price", async () => {
    const repo = mockServiceRepository();
    repo.findByName.mockResolvedValue(null);
    const useCase = new CreateService(repo);

    await expect(useCase.execute({ name: "Corte", duration: 30, price: -1 })).rejects.toThrow(
      /preço/i,
    );
  });

  it("saves a valid service", async () => {
    const repo = mockServiceRepository();
    repo.findByName.mockResolvedValue(null);
    const useCase = new CreateService(repo);

    const result = await useCase.execute({ name: "Corte", duration: 30, price: 50 });

    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(result.name).toBe("Corte");
  });
});
