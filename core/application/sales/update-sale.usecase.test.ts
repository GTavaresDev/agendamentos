import { describe, expect, it } from "vitest";
import { UpdateSale } from "./update-sale.usecase";
import { buildSale, mockSaleRepository } from "./test-helpers";
import { mockProductRepository, buildProduct } from "../products/test-helpers";

describe("UpdateSale", () => {
  it("throws when the sale does not exist", async () => {
    const saleRepo = mockSaleRepository();
    const productRepo = mockProductRepository();
    saleRepo.findById.mockResolvedValue(null);
    const useCase = new UpdateSale(saleRepo, productRepo);

    await expect(useCase.execute({ id: "missing" })).rejects.toThrow(/não encontrada/i);
  });

  it("throws when the product no longer exists", async () => {
    const saleRepo = mockSaleRepository();
    const productRepo = mockProductRepository();
    saleRepo.findById.mockResolvedValue(buildSale());
    productRepo.findById.mockResolvedValue(null);
    const useCase = new UpdateSale(saleRepo, productRepo);

    await expect(useCase.execute({ id: "s1", quantity: 3 })).rejects.toThrow(/não encontrado/i);
  });

  it("rejects updating a sale to reference an inactive product", async () => {
    const saleRepo = mockSaleRepository();
    const productRepo = mockProductRepository();
    saleRepo.findById.mockResolvedValue(buildSale());
    productRepo.findById.mockResolvedValue(buildProduct({ status: "Inativo" }));
    const useCase = new UpdateSale(saleRepo, productRepo);

    await expect(useCase.execute({ id: "s1", quantity: 3 })).rejects.toThrow(/inativo/i);
  });

  it("rejects changing the product on a sale", async () => {
    const saleRepo = mockSaleRepository();
    const productRepo = mockProductRepository();
    saleRepo.findById.mockResolvedValue(buildSale({ productId: "p1" }));
    productRepo.findById.mockResolvedValue(buildProduct({ id: "p2" }));
    const useCase = new UpdateSale(saleRepo, productRepo);

    await expect(useCase.execute({ id: "s1", productId: "p2" })).rejects.toThrow(
      /não suportada/,
    );
  });

  it("recalculates totalPrice and delegates inventory recalculation with the old quantity", async () => {
    const saleRepo = mockSaleRepository();
    const productRepo = mockProductRepository();
    saleRepo.findById.mockResolvedValue(buildSale({ productId: "p1", quantity: 2, unitPrice: 10 }));
    productRepo.findById.mockResolvedValue(buildProduct({ id: "p1" }));
    saleRepo.updateWithInventoryRecalculation.mockImplementation(async (_id, sale) => sale);
    const useCase = new UpdateSale(saleRepo, productRepo);

    const result = await useCase.execute({ id: "s1", quantity: 5 });

    expect(result.totalPrice).toBe(50);
    expect(saleRepo.updateWithInventoryRecalculation).toHaveBeenCalledWith(
      "s1",
      expect.objectContaining({ totalPrice: 50 }),
      2,
    );
  });
});
