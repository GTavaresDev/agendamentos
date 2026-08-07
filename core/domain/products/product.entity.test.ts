import { describe, expect, it } from "vitest";
import { Product, type ProductProps } from "./product.entity";

const props = (overrides: Partial<ProductProps> = {}): ProductProps => ({
  id: "p1",
  name: "Shampoo",
  category: "Cabelo",
  price: 29.9,
  quantity: 10,
  status: "Ativo",
  ...overrides,
});

describe("Product validation", () => {
  it("rejects an empty name", () => {
    expect(() => new Product(props({ name: "" }))).toThrow(/Nome/);
  });

  it("rejects a negative price", () => {
    expect(() => new Product(props({ price: -1 }))).toThrow(/Preço/);
  });

  it("rejects a negative quantity", () => {
    expect(() => new Product(props({ quantity: -1 }))).toThrow(/Quantidade/);
  });

  it("accepts a zero price and zero quantity", () => {
    expect(() => new Product(props({ price: 0, quantity: 0 }))).not.toThrow();
  });
});

describe("Product.formattedPrice", () => {
  it("formats as BRL currency", () => {
    const product = new Product(props({ price: 1234.5 }));
    expect(product.formattedPrice).toContain("1.234,50");
  });

  it("is included in toJSON", () => {
    const product = new Product(props({ price: 10 }));
    expect(product.toJSON().formattedPrice).toBe(product.formattedPrice);
  });
});
