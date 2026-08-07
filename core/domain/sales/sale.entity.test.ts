import { describe, expect, it } from "vitest";
import { Sale, type SaleProps } from "./sale.entity";

const props = (overrides: Partial<SaleProps> = {}): SaleProps => ({
  id: "s1",
  productId: "p1",
  quantity: 2,
  unitPrice: 10,
  totalPrice: 20,
  paymentMethod: "Pix",
  ...overrides,
});

describe("Sale validation", () => {
  it("rejects an empty productId", () => {
    expect(() => new Sale(props({ productId: "" }))).toThrow(/Produto/);
  });

  it("rejects a zero or negative quantity", () => {
    expect(() => new Sale(props({ quantity: 0 }))).toThrow(/Quantidade/);
    expect(() => new Sale(props({ quantity: -1 }))).toThrow(/Quantidade/);
  });

  it("rejects a negative unit price", () => {
    expect(() => new Sale(props({ unitPrice: -1 }))).toThrow(/unitário/);
  });

  it("rejects a negative total price", () => {
    expect(() => new Sale(props({ totalPrice: -1 }))).toThrow(/total/);
  });

  it("rejects a missing payment method", () => {
    expect(() => new Sale(props({ paymentMethod: undefined as unknown as SaleProps["paymentMethod"] }))).toThrow(
      /pagamento/,
    );
  });

  it("accepts valid props", () => {
    expect(() => new Sale(props())).not.toThrow();
  });
});

describe("Sale formatted getters", () => {
  it("formats total and unit price as BRL currency", () => {
    const sale = new Sale(props({ unitPrice: 10, totalPrice: 1234.5 }));
    expect(sale.formattedUnitPrice).toContain("10,00");
    expect(sale.formattedTotal).toContain("1.234,50");
  });

  it("includes both in toJSON", () => {
    const sale = new Sale(props());
    const json = sale.toJSON();
    expect(json.formattedTotal).toBe(sale.formattedTotal);
    expect(json.formattedUnitPrice).toBe(sale.formattedUnitPrice);
  });
});
