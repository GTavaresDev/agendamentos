import { describe, expect, it } from "vitest";
import { ProductMapper } from "./product.mapper";

const raw = {
  id: "p1",
  name: "Shampoo",
  category: "Cabelo",
  price: 29.9,
  quantity: 10,
  status: "Ativo",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-02"),
};

describe("ProductMapper", () => {
  it("round-trips domain <-> persistence for the shared fields", () => {
    const product = ProductMapper.toDomain(raw);
    const persisted = ProductMapper.toPersistence(product);

    expect(persisted).toEqual({
      id: "p1",
      name: "Shampoo",
      category: "Cabelo",
      price: 29.9,
      quantity: 10,
      status: "Ativo",
    });
  });
});
