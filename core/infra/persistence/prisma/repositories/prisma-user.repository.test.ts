import { describe, expect, it, vi, beforeEach } from "vitest";

const prismaMock = {
  user: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

vi.mock("../client", () => ({ prisma: prismaMock }));

const { PrismaUserRepository } = await import("./prisma-user.repository");
const { User } = await import("@core/domain/users/user.entity");

const rawUser = {
  id: "u1",
  name: "Maria Silva",
  email: "maria@example.com",
  phone: "119",
  password: "hash",
  role: "Funcionario",
  status: "Ativo",
  last: null,
  initials: "MS",
  failedLoginAttempts: 0,
  lockedUntil: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  permissions: [],
};

describe("PrismaUserRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("findByEmail includes only enabled permissions", async () => {
    prismaMock.user.findUnique.mockResolvedValue(rawUser);
    const repo = new PrismaUserRepository();

    await repo.findByEmail("maria@example.com");

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: "maria@example.com" },
      include: { permissions: { where: { enabled: true } } },
    });
  });

  it("findById returns null when not found", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    const repo = new PrismaUserRepository();

    expect(await repo.findById("missing")).toBeNull();
  });

  it("findAll rethrows on query failure", async () => {
    const error = new Error("db down");
    prismaMock.user.findMany.mockRejectedValue(error);
    const repo = new PrismaUserRepository();

    await expect(repo.findAll()).rejects.toThrow(error);
  });

  it("save omits the password field when none is set (never writes an empty password)", async () => {
    prismaMock.user.create.mockResolvedValue(rawUser);
    const repo = new PrismaUserRepository();
    const user = new User({
      id: "u1",
      name: "Maria Silva",
      email: "maria@example.com",
      phone: "119",
      password: null,
      role: "Funcionario",
      status: "Ativo",
      initials: "MS",
    });

    await repo.save(user);

    const callArgs = prismaMock.user.create.mock.calls[0][0];
    expect(callArgs.data).not.toHaveProperty("password");
  });

  it("save creates a default permission entry matching the user's role", async () => {
    prismaMock.user.create.mockResolvedValue(rawUser);
    const repo = new PrismaUserRepository();
    const user = new User({
      id: "u1",
      name: "Maria Silva",
      email: "maria@example.com",
      phone: "119",
      role: "Gestor",
      status: "Ativo",
      initials: "MS",
    });

    await repo.save(user);

    expect(prismaMock.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ permissions: { create: [{ name: "Gestor" }] } }),
      }),
    );
  });

  it("delete calls prisma.user.delete with the given id", async () => {
    const repo = new PrismaUserRepository();

    await repo.delete("u1");

    expect(prismaMock.user.delete).toHaveBeenCalledWith({ where: { id: "u1" } });
  });
});
