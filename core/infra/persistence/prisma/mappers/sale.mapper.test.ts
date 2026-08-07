import { describe, expect, it } from "vitest";
import { SaleMapper } from "./sale.mapper";

const raw = {
  id: "s1",
  productId: "p1",
  quantity: 2,
  unitPrice: 10,
  totalPrice: 20,
  paymentMethod: "Pix",
  createdById: "u1",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-02"),
};

describe("SaleMapper", () => {
  it("round-trips domain <-> persistence for the shared fields", () => {
    const sale = SaleMapper.toDomain(raw);
    const persisted = SaleMapper.toPersistence(sale);

    expect(persisted).toEqual({
      id: "s1",
      productId: "p1",
      quantity: 2,
      unitPrice: 10,
      totalPrice: 20,
      paymentMethod: "Pix",
      createdById: "u1",
    });
  });

  it("preserves a null createdById", () => {
    const sale = SaleMapper.toDomain({ ...raw, createdById: null });
    expect(sale.createdById).toBeNull();
  });
});
