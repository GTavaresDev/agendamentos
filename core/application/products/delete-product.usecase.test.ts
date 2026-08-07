import { describe, expect, it } from "vitest";
import { DeleteProduct } from "./delete-product.usecase";
import { buildProduct, mockProductRepository } from "./test-helpers";

describe("DeleteProduct", () => {
  it("throws when the product does not exist", async () => {
    const repo = mockProductRepository();
    repo.findById.mockResolvedValue(null);
    const useCase = new DeleteProduct(repo);

    await expect(useCase.execute("missing")).rejects.toThrow(/não encontrado/i);
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it("deletes an existing product", async () => {
    const repo = mockProductRepository();
    repo.findById.mockResolvedValue(buildProduct({ id: "p1" }));
    const useCase = new DeleteProduct(repo);

    await useCase.execute("p1");

    expect(repo.delete).toHaveBeenCalledWith("p1");
  });
});
