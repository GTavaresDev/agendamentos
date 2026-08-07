import { describe, expect, it } from "vitest";
import { ListSales } from "./list-sales.usecase";
import { buildSale, mockSaleRepository } from "./test-helpers";

describe("ListSales", () => {
  it("returns all sales when no filter is given", async () => {
    const repo = mockSaleRepository();
    const sales = [buildSale({ id: "s1" }), buildSale({ id: "s2" })];
    repo.findAll.mockResolvedValue(sales);
    const useCase = new ListSales(repo);

    expect(await useCase.execute()).toEqual(sales);
  });

  it("filters by payment method", async () => {
    const repo = mockSaleRepository();
    repo.findAll.mockResolvedValue([
      buildSale({ id: "s1", paymentMethod: "Pix" }),
      buildSale({ id: "s2", paymentMethod: "Dinheiro" }),
    ]);
    const useCase = new ListSales(repo);

    const result = await useCase.execute({ paymentMethod: "Pix" });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("s1");
  });
});
