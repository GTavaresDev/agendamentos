import { describe, expect, it, vi, beforeEach } from "vitest";

const prismaMock = {
  service: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

vi.mock("../client", () => ({ prisma: prismaMock }));

const { PrismaServiceRepository } = await import("./prisma-service.repository");

const rawService = {
  id: "sv1",
  name: "Corte",
  description: null,
  duration: 30,
  price: 50,
  status: "Ativo",
  color: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("PrismaServiceRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("findByName performs a case-insensitive lookup", async () => {
    prismaMock.service.findFirst.mockResolvedValue(rawService);
    const repo = new PrismaServiceRepository();

    await repo.findByName("corte");

    expect(prismaMock.service.findFirst).toHaveBeenCalledWith({
      where: { name: { equals: "corte", mode: "insensitive" } },
    });
  });

  it("findByName returns null when not found", async () => {
    prismaMock.service.findFirst.mockResolvedValue(null);
    const repo = new PrismaServiceRepository();

    expect(await repo.findByName("missing")).toBeNull();
  });

  it("findActive filters by status Ativo", async () => {
    prismaMock.service.findMany.mockResolvedValue([rawService]);
    const repo = new PrismaServiceRepository();

    await repo.findActive();

    expect(prismaMock.service.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: "Ativo" } }),
    );
  });

  it("delete calls prisma.service.delete with the given id", async () => {
    const repo = new PrismaServiceRepository();

    await repo.delete("sv1");

    expect(prismaMock.service.delete).toHaveBeenCalledWith({ where: { id: "sv1" } });
  });
});
