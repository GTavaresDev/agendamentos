import { describe, expect, it } from "vitest";
import { DeleteSale } from "./delete-sale.usecase";
import { buildSale, mockSaleRepository } from "./test-helpers";

describe("DeleteSale", () => {
  it("throws when the sale does not exist", async () => {
    const repo = mockSaleRepository();
    repo.findById.mockResolvedValue(null);
    const useCase = new DeleteSale(repo);

    await expect(useCase.execute("missing")).rejects.toThrow(/não encontrada/i);
    expect(repo.deleteWithInventoryRestore).not.toHaveBeenCalled();
  });

  it("deletes and restores inventory for an existing sale", async () => {
    const repo = mockSaleRepository();
    repo.findById.mockResolvedValue(buildSale({ id: "s1" }));
    const useCase = new DeleteSale(repo);

    await useCase.execute("s1");

    expect(repo.deleteWithInventoryRestore).toHaveBeenCalledWith("s1");
  });
});
