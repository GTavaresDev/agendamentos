import { vi, type Mocked } from "vitest";
import { Sale, type SaleProps } from "@core/domain/sales/sale.entity";
import type { SaleRepository } from "@core/domain/sales/sale.repository";

export function buildSale(overrides: Partial<SaleProps> = {}): Sale {
  return new Sale({
    id: "s1",
    productId: "p1",
    quantity: 2,
    unitPrice: 10,
    totalPrice: 20,
    paymentMethod: "Pix",
    ...overrides,
  });
}

export function mockSaleRepository(): Mocked<SaleRepository> {
  return {
    findAll: vi.fn(),
    findById: vi.fn(),
    findByProductId: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    saveWithInventoryUpdate: vi.fn(),
    updateWithInventoryRecalculation: vi.fn(),
    deleteWithInventoryRestore: vi.fn(),
  } as unknown as Mocked<SaleRepository>;
}
