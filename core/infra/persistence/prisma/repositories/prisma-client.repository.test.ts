import { describe, expect, it, vi, beforeEach } from "vitest";

const prismaMock = {
  client: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

vi.mock("../client", () => ({ prisma: prismaMock }));

const { PrismaClientRepository } = await import("./prisma-client.repository");

const rawClient = {
  id: "c1",
  name: "Maria Silva",
  email: "maria@example.com",
  phone: "119",
  cpf: null,
  birthDate: null,
  status: "Ativo",
  initials: "MS",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("PrismaClientRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("findByEmail returns null when not found", async () => {
    prismaMock.client.findUnique.mockResolvedValue(null);
    const repo = new PrismaClientRepository();

    expect(await repo.findByEmail("nobody@example.com")).toBeNull();
  });

  it("findByEmail rethrows and logs on query failure", async () => {
    const error = new Error("db down");
    prismaMock.client.findUnique.mockRejectedValue(error);
    const repo = new PrismaClientRepository();

    await expect(repo.findByEmail("x@example.com")).rejects.toThrow(error);
  });

  it("findAll orders by name and maps to domain", async () => {
    prismaMock.client.findMany.mockResolvedValue([rawClient]);
    const repo = new PrismaClientRepository();

    const result = await repo.findAll();

    expect(prismaMock.client.findMany).toHaveBeenCalledWith({ orderBy: { name: "asc" } });
    expect(result[0].id).toBe("c1");
  });

  it("delete calls prisma.client.delete with the given id", async () => {
    const repo = new PrismaClientRepository();

    await repo.delete("c1");

    expect(prismaMock.client.delete).toHaveBeenCalledWith({ where: { id: "c1" } });
  });
});
