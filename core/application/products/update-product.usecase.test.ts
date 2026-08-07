import { describe, expect, it } from "vitest";
import { UpdateProduct } from "./update-product.usecase";
import { buildProduct, mockProductRepository } from "./test-helpers";

describe("UpdateProduct", () => {
  it("throws when the product does not exist", async () => {
    const repo = mockProductRepository();
    repo.findById.mockResolvedValue(null);
    const useCase = new UpdateProduct(repo);

    await expect(useCase.execute({ id: "missing" })).rejects.toThrow(/não encontrado/i);
  });

  it("recomputes status to Baixo estoque when quantity drops to the threshold", async () => {
    const repo = mockProductRepository();
    repo.findById.mockResolvedValue(buildProduct({ quantity: 20, status: "Ativo" }));
    repo.update.mockImplementation(async (p) => p);
    const useCase = new UpdateProduct(repo);

    const result = await useCase.execute({ id: "p1", quantity: 3 });

    expect(result.status).toBe("Baixo estoque");
  });

  it("recomputes status to Inativo when quantity reaches zero", async () => {
    const repo = mockProductRepository();
    repo.findById.mockResolvedValue(buildProduct({ quantity: 20, status: "Ativo" }));
    repo.update.mockImplementation(async (p) => p);
    const useCase = new UpdateProduct(repo);

    const result = await useCase.execute({ id: "p1", quantity: 0 });

    expect(result.status).toBe("Inativo");
  });

  it("only overrides fields provided, keeping others", async () => {
    const repo = mockProductRepository();
    repo.findById.mockResolvedValue(buildProduct({ name: "Shampoo", price: 10, quantity: 20 }));
    repo.update.mockImplementation(async (p) => p);
    const useCase = new UpdateProduct(repo);

    const result = await useCase.execute({ id: "p1", price: 15 });

    expect(result.price).toBe(15);
    expect(result.name).toBe("Shampoo");
  });
});
