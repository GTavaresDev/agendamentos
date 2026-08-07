import { describe, expect, it, vi, beforeEach } from "vitest";

const prismaMock = {
  userPermission: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    upsert: vi.fn(),
    updateMany: vi.fn(),
  },
  systemPermission: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn().mockImplementation(function PrismaClient() {
    return prismaMock;
  }),
}));

const { PrismaPermissionRepository } = await import("./prisma-permission.repository");

describe("PrismaPermissionRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("findUserPermissions only requests enabled permissions for the given user", async () => {
    prismaMock.userPermission.findMany.mockResolvedValue([
      { id: 1, name: "x", userId: "u1", enabled: true },
    ]);
    const repo = new PrismaPermissionRepository();

    const result = await repo.findUserPermissions("u1");

    expect(prismaMock.userPermission.findMany).toHaveBeenCalledWith({
      where: { userId: "u1", enabled: true },
    });
    expect(result[0].name).toBe("x");
  });

  it("hasPermission is false when findUserPermission returns null", async () => {
    prismaMock.userPermission.findUnique.mockResolvedValue(null);
    const repo = new PrismaPermissionRepository();

    expect(await repo.hasPermission("u1", "x")).toBe(false);
  });

  it("grantPermission upserts by composite key, enabling on conflict", async () => {
    prismaMock.userPermission.upsert.mockResolvedValue({
      id: 1,
      name: "x",
      userId: "u1",
      enabled: true,
    });
    const repo = new PrismaPermissionRepository();

    await repo.grantPermission("u1", "x");

    expect(prismaMock.userPermission.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_name: { userId: "u1", name: "x" } },
        update: expect.objectContaining({ enabled: true }),
      }),
    );
  });

  it("revokePermission disables the permission instead of deleting it", async () => {
    prismaMock.userPermission.updateMany.mockResolvedValue({ count: 1 });
    const repo = new PrismaPermissionRepository();

    await repo.revokePermission("u1", "x");

    expect(prismaMock.userPermission.updateMany).toHaveBeenCalledWith({
      where: { userId: "u1", name: "x" },
      data: expect.objectContaining({ enabled: false }),
    });
  });

  it("findActiveSystemPermissions filters by enabled", async () => {
    prismaMock.systemPermission.findMany.mockResolvedValue([]);
    const repo = new PrismaPermissionRepository();

    await repo.findActiveSystemPermissions();

    expect(prismaMock.systemPermission.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { enabled: true } }),
    );
  });

  it("findSystemPermission returns null when not found", async () => {
    prismaMock.systemPermission.findUnique.mockResolvedValue(null);
    const repo = new PrismaPermissionRepository();

    expect(await repo.findSystemPermission("missing")).toBeNull();
  });
});
