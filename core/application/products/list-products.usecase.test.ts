import { describe, expect, it } from "vitest";
import { ListProducts } from "./list-products.usecase";
import { buildProduct, mockProductRepository } from "./test-helpers";

describe("ListProducts", () => {
  it("filters by search across name and category", async () => {
    const repo = mockProductRepository();
    repo.findAll.mockResolvedValue([
      buildProduct({ id: "p1", name: "Shampoo", category: "Cabelo" }),
      buildProduct({ id: "p2", name: "Esmalte", category: "Unha" }),
    ]);
    const useCase = new ListProducts(repo);

    const result = await useCase.execute({ search: "cabelo" });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("p1");
  });

  it("filters by category, ignoring the 'Todas' sentinel", async () => {
    const repo = mockProductRepository();
    repo.findAll.mockResolvedValue([
      buildProduct({ id: "p1", category: "Cabelo" }),
      buildProduct({ id: "p2", category: "Unha" }),
    ]);
    const useCase = new ListProducts(repo);

    expect(await useCase.execute({ category: "Cabelo" })).toHaveLength(1);
    expect(await useCase.execute({ category: "Todas" })).toHaveLength(2);
  });

  it("filters by status, ignoring the 'Todos' sentinel", async () => {
    const repo = mockProductRepository();
    repo.findAll.mockResolvedValue([
      buildProduct({ id: "p1", status: "Ativo" }),
      buildProduct({ id: "p2", status: "Inativo" }),
    ]);
    const useCase = new ListProducts(repo);

    expect(await useCase.execute({ status: "Inativo" })).toHaveLength(1);
    expect(await useCase.execute({ status: "Todos" })).toHaveLength(2);
  });
});
