import { describe, expect, it, vi, beforeEach } from "vitest";

const txMock = {
  product: { findUnique: vi.fn(), update: vi.fn() },
  sale: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
};

const prismaMock = {
  sale: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  $transaction: vi.fn((cb: (tx: typeof txMock) => unknown) => cb(txMock)),
};

vi.mock("../client", () => ({ prisma: prismaMock }));

const { PrismaSaleRepository } = await import("./prisma-sale.repository");
const { Sale } = await import("@core/domain/sales/sale.entity");

function makeSale(overrides: Partial<{ id: string; productId: string; quantity: number }> = {}) {
  return new Sale({
    id: overrides.id || "s1",
    productId: overrides.productId || "p1",
    quantity: overrides.quantity ?? 3,
    unitPrice: 10,
    totalPrice: 30,
    paymentMethod: "Pix",
  });
}

describe("PrismaSaleRepository — inventory-affecting transactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation((cb: (tx: typeof txMock) => unknown) => cb(txMock));
  });

  describe("saveWithInventoryUpdate", () => {
    it("throws when the product does not exist", async () => {
      txMock.product.findUnique.mockResolvedValue(null);
      const repo = new PrismaSaleRepository();

      await expect(repo.saveWithInventoryUpdate(makeSale(), -3)).rejects.toThrow(
        /não encontrado/i,
      );
      expect(txMock.sale.create).not.toHaveBeenCalled();
    });

    it("throws when the delta would drive stock negative", async () => {
      txMock.product.findUnique.mockResolvedValue({ id: "p1", quantity: 2 });
      const repo = new PrismaSaleRepository();

      await expect(repo.saveWithInventoryUpdate(makeSale({ quantity: 5 }), -5)).rejects.toThrow(
        /insuficiente/i,
      );
      expect(txMock.sale.create).not.toHaveBeenCalled();
    });

    it("decrements stock and creates the sale atomically", async () => {
      txMock.product.findUnique.mockResolvedValue({ id: "p1", quantity: 10 });
      txMock.sale.create.mockResolvedValue({
        id: "s1",
        productId: "p1",
        quantity: 3,
        unitPrice: 10,
        totalPrice: 30,
        paymentMethod: "Pix",
        createdById: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const repo = new PrismaSaleRepository();

      await repo.saveWithInventoryUpdate(makeSale({ quantity: 3 }), -3);

      expect(txMock.product.update).toHaveBeenCalledWith({
        where: { id: "p1" },
        data: { quantity: 7 },
      });
      expect(txMock.sale.create).toHaveBeenCalled();
    });
  });

  describe("updateWithInventoryRecalculation", () => {
    it("adjusts stock by the difference between old and new quantity", async () => {
      txMock.product.findUnique.mockResolvedValue({ id: "p1", quantity: 10 });
      txMock.sale.update.mockResolvedValue({
        id: "s1",
        productId: "p1",
        quantity: 5,
        unitPrice: 10,
        totalPrice: 50,
        paymentMethod: "Pix",
        createdById: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const repo = new PrismaSaleRepository();

      // old quantity was 2, new quantity is 5 -> stock decreases by 3 more
      await repo.updateWithInventoryRecalculation("s1", makeSale({ quantity: 5 }), 2);

      expect(txMock.product.update).toHaveBeenCalledWith({
        where: { id: "p1" },
        data: { quantity: 7 },
      });
    });

    it("throws when the recalculated stock would go negative", async () => {
      txMock.product.findUnique.mockResolvedValue({ id: "p1", quantity: 1 });
      const repo = new PrismaSaleRepository();

      await expect(
        repo.updateWithInventoryRecalculation("s1", makeSale({ quantity: 10 }), 2),
      ).rejects.toThrow(/insuficiente/i);
    });
  });

  describe("deleteWithInventoryRestore", () => {
    it("throws when the sale does not exist", async () => {
      txMock.sale.findUnique.mockResolvedValue(null);
      const repo = new PrismaSaleRepository();

      await expect(repo.deleteWithInventoryRestore("missing")).rejects.toThrow(/não encontrada/i);
    });

    it("restores stock by the sold quantity and deletes the sale", async () => {
      txMock.sale.findUnique.mockResolvedValue({ id: "s1", productId: "p1", quantity: 3 });
      txMock.product.findUnique.mockResolvedValue({ id: "p1", quantity: 7 });
      const repo = new PrismaSaleRepository();

      await repo.deleteWithInventoryRestore("s1");

      expect(txMock.product.update).toHaveBeenCalledWith({
        where: { id: "p1" },
        data: { quantity: 10 },
      });
      expect(txMock.sale.delete).toHaveBeenCalledWith({ where: { id: "s1" } });
    });
  });
});
