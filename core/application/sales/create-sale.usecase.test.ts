import { describe, expect, it } from "vitest";
import { CreateSale } from "./create-sale.usecase";
import { mockSaleRepository } from "./test-helpers";
import { mockProductRepository, buildProduct } from "../products/test-helpers";

describe("CreateSale", () => {
  it("throws when the product does not exist", async () => {
    const saleRepo = mockSaleRepository();
    const productRepo = mockProductRepository();
    productRepo.findById.mockResolvedValue(null);
    const useCase = new CreateSale(saleRepo, productRepo);

    await expect(
      useCase.execute({ productId: "missing", quantity: 1, unitPrice: 10, paymentMethod: "Pix" }),
    ).rejects.toThrow(/não encontrado/i);
  });

  it("rejects selling an inactive product", async () => {
    const saleRepo = mockSaleRepository();
    const productRepo = mockProductRepository();
    productRepo.findById.mockResolvedValue(buildProduct({ status: "Inativo" }));
    const useCase = new CreateSale(saleRepo, productRepo);

    await expect(
      useCase.execute({ productId: "p1", quantity: 1, unitPrice: 10, paymentMethod: "Pix" }),
    ).rejects.toThrow(/inativo/i);
  });

  it("rejects a quantity exceeding available stock", async () => {
    const saleRepo = mockSaleRepository();
    const productRepo = mockProductRepository();
    productRepo.findById.mockResolvedValue(buildProduct({ quantity: 5 }));
    const useCase = new CreateSale(saleRepo, productRepo);

    await expect(
      useCase.execute({ productId: "p1", quantity: 10, unitPrice: 10, paymentMethod: "Pix" }),
    ).rejects.toThrow(/estoque/i);
  });

  it("rejects a zero or negative quantity", async () => {
    const saleRepo = mockSaleRepository();
    const productRepo = mockProductRepository();
    productRepo.findById.mockResolvedValue(buildProduct({ quantity: 5 }));
    const useCase = new CreateSale(saleRepo, productRepo);

    await expect(
      useCase.execute({ productId: "p1", quantity: 0, unitPrice: 10, paymentMethod: "Pix" }),
    ).rejects.toThrow(/maior que zero/);
  });

  it("computes totalPrice and decrements inventory by the sold quantity", async () => {
    const saleRepo = mockSaleRepository();
    const productRepo = mockProductRepository();
    productRepo.findById.mockResolvedValue(buildProduct({ quantity: 10 }));
    saleRepo.saveWithInventoryUpdate.mockImplementation(async (sale) => sale);
    const useCase = new CreateSale(saleRepo, productRepo);

    const result = await useCase.execute({
      productId: "p1",
      quantity: 3,
      unitPrice: 15,
      paymentMethod: "Crédito",
    });

    expect(result.totalPrice).toBe(45);
    expect(saleRepo.saveWithInventoryUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ totalPrice: 45 }),
      -3,
    );
  });
});
