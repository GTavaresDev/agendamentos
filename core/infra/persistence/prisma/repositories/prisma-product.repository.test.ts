import { describe, expect, it, vi, beforeEach } from "vitest";

const prismaMock = {
  product: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

vi.mock("../client", () => ({ prisma: prismaMock }));

const { PrismaProductRepository } = await import("./prisma-product.repository");

const rawProduct = {
  id: "p1",
  name: "Shampoo",
  category: "Cabelo",
  price: 29.9,
  quantity: 10,
  status: "Ativo",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("PrismaProductRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("findAll maps records to domain entities", async () => {
    prismaMock.product.findMany.mockResolvedValue([rawProduct]);
    const repo = new PrismaProductRepository();

    const result = await repo.findAll();

    expect(result[0].id).toBe("p1");
  });

  it("findAll rethrows on query failure", async () => {
    const error = new Error("db down");
    prismaMock.product.findMany.mockRejectedValue(error);
    const repo = new PrismaProductRepository();

    await expect(repo.findAll()).rejects.toThrow(error);
  });

  it("findById returns null when not found", async () => {
    prismaMock.product.findUnique.mockResolvedValue(null);
    const repo = new PrismaProductRepository();

    expect(await repo.findById("missing")).toBeNull();
  });

  it("save persists only the domain-owned fields", async () => {
    prismaMock.product.create.mockResolvedValue(rawProduct);
    const repo = new PrismaProductRepository();
    const { Product } = await import("@core/domain/products/product.entity");

    await repo.save(new Product({ id: "p1", name: "Shampoo", category: "Cabelo", price: 29.9, quantity: 10, status: "Ativo" }));

    expect(prismaMock.product.create).toHaveBeenCalledWith({
      data: { id: "p1", name: "Shampoo", category: "Cabelo", price: 29.9, quantity: 10, status: "Ativo" },
    });
  });

  it("delete calls prisma.product.delete with the given id", async () => {
    const repo = new PrismaProductRepository();

    await repo.delete("p1");

    expect(prismaMock.product.delete).toHaveBeenCalledWith({ where: { id: "p1" } });
  });
});
