import { describe, expect, it } from "vitest";
import { CreateProduct } from "./create-product.usecase";
import { mockProductRepository } from "./test-helpers";

describe("CreateProduct — stock status derivation", () => {
  it("marks as Inativo when quantity is zero, overriding an explicit status", async () => {
    const repo = mockProductRepository();
    repo.save.mockImplementation(async (p) => p);
    const useCase = new CreateProduct(repo);

    const result = await useCase.execute({
      name: "Shampoo",
      category: "Cabelo",
      price: 10,
      quantity: 0,
      status: "Ativo",
    });

    expect(result.status).toBe("Inativo");
  });

  it("marks as Baixo estoque when quantity is at or below 5 and status is Ativo", async () => {
    const repo = mockProductRepository();
    repo.save.mockImplementation(async (p) => p);
    const useCase = new CreateProduct(repo);

    const result = await useCase.execute({ name: "Shampoo", category: "Cabelo", price: 10, quantity: 5 });

    expect(result.status).toBe("Baixo estoque");
  });

  it("keeps Ativo when quantity is above the low-stock threshold", async () => {
    const repo = mockProductRepository();
    repo.save.mockImplementation(async (p) => p);
    const useCase = new CreateProduct(repo);

    const result = await useCase.execute({ name: "Shampoo", category: "Cabelo", price: 10, quantity: 6 });

    expect(result.status).toBe("Ativo");
  });

  it("defaults status to Ativo when not provided and stock is healthy", async () => {
    const repo = mockProductRepository();
    repo.save.mockImplementation(async (p) => p);
    const useCase = new CreateProduct(repo);

    const result = await useCase.execute({ name: "Shampoo", category: "Cabelo", price: 10, quantity: 100 });

    expect(result.status).toBe("Ativo");
  });
});
