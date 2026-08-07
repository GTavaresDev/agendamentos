import { vi, type Mocked } from "vitest";
import { Product, type ProductProps } from "@core/domain/products/product.entity";
import type { ProductRepository } from "@core/domain/products/product.repository";

export function buildProduct(overrides: Partial<ProductProps> = {}): Product {
  return new Product({
    id: "p1",
    name: "Shampoo",
    category: "Cabelo",
    price: 29.9,
    quantity: 10,
    status: "Ativo",
    ...overrides,
  });
}

export function mockProductRepository(): Mocked<ProductRepository> {
  return {
    findAll: vi.fn(),
    findById: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  } as unknown as Mocked<ProductRepository>;
}
