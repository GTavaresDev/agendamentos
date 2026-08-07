import { describe, expect, it } from "vitest";
import { GrantPermission } from "./grant-permission.usecase";
import { buildUser, mockPermissionRepository, mockUserRepository } from "./test-helpers";
import { UserPermission } from "@core/domain/users/user-permission.entity";
import { SystemPermission } from "@core/domain/users/system-permission.entity";

describe("GrantPermission", () => {
  it("throws when the granter does not exist", async () => {
    const userRepo = mockUserRepository();
    const permRepo = mockPermissionRepository();
    userRepo.findById.mockResolvedValue(null);
    const useCase = new GrantPermission(permRepo, userRepo);

    await expect(
      useCase.execute({ granterId: "g1", targetUserId: "t1", permissionName: "x" }),
    ).rejects.toThrow(/Usuário que está concedendo/);
  });

  it("throws when the target does not exist", async () => {
    const userRepo = mockUserRepository();
    const permRepo = mockPermissionRepository();
    userRepo.findById.mockImplementation(async (id: string) =>
      id === "g1" ? buildUser({ id: "g1" }) : null,
    );
    const useCase = new GrantPermission(permRepo, userRepo);

    await expect(
      useCase.execute({ granterId: "g1", targetUserId: "missing", permissionName: "x" }),
    ).rejects.toThrow(/Usuário alvo/);
  });

  it("prevents self-granting (self-promotion)", async () => {
    const userRepo = mockUserRepository();
    const permRepo = mockPermissionRepository();
    userRepo.findById.mockResolvedValue(buildUser({ id: "u1" }));
    const useCase = new GrantPermission(permRepo, userRepo);

    await expect(
      useCase.execute({ granterId: "u1", targetUserId: "u1", permissionName: "x" }),
    ).rejects.toThrow(/próprias permissões/);
  });

  it("rejects granting a disabled system permission", async () => {
    const userRepo = mockUserRepository();
    const permRepo = mockPermissionRepository();
    userRepo.findById.mockImplementation(async (id: string) =>
      buildUser({ id, role: "Administrador" }),
    );
    permRepo.findSystemPermission.mockResolvedValue(
      new SystemPermission({
        id: 1,
        name: "x",
        category: "general",
        enabled: false,
        requiresHierarchy: false,
      }),
    );
    const useCase = new GrantPermission(permRepo, userRepo);

    await expect(
      useCase.execute({ granterId: "g1", targetUserId: "t1", permissionName: "x" }),
    ).rejects.toThrow(/desativada/);
  });

  it("rejects granting an unknown system permission", async () => {
    const userRepo = mockUserRepository();
    const permRepo = mockPermissionRepository();
    userRepo.findById.mockImplementation(async (id: string) =>
      buildUser({ id, role: "Administrador" }),
    );
    permRepo.findSystemPermission.mockResolvedValue(null);
    const useCase = new GrantPermission(permRepo, userRepo);

    await expect(
      useCase.execute({ granterId: "g1", targetUserId: "t1", permissionName: "x" }),
    ).rejects.toThrow(/desativada/);
  });

  it("rejects a non-admin, non-sharing granter (privilege escalation attempt)", async () => {
    const userRepo = mockUserRepository();
    const permRepo = mockPermissionRepository();
    userRepo.findById.mockImplementation(async (id: string) =>
      buildUser({ id, role: "Funcionario", permissions: [] }),
    );
    permRepo.findSystemPermission.mockResolvedValue(
      new SystemPermission({
        id: 1,
        name: "x",
        category: "general",
        enabled: true,
        requiresHierarchy: false,
      }),
    );
    const useCase = new GrantPermission(permRepo, userRepo);

    await expect(
      useCase.execute({ granterId: "g1", targetUserId: "t1", permissionName: "x" }),
    ).rejects.toThrow(/não possui permissão/);
    expect(permRepo.grantPermission).not.toHaveBeenCalled();
  });

  it("grants successfully for a valid Administrador", async () => {
    const userRepo = mockUserRepository();
    const permRepo = mockPermissionRepository();
    userRepo.findById.mockImplementation(async (id: string) =>
      buildUser({ id, role: id === "g1" ? "Administrador" : "Funcionario" }),
    );
    permRepo.findSystemPermission.mockResolvedValue(
      new SystemPermission({
        id: 1,
        name: "x",
        category: "general",
        enabled: true,
        requiresHierarchy: false,
      }),
    );
    permRepo.grantPermission.mockResolvedValue(
      new UserPermission({ id: 1, name: "x", userId: "t1", enabled: true }),
    );
    const useCase = new GrantPermission(permRepo, userRepo);

    const result = await useCase.execute({
      granterId: "g1",
      targetUserId: "t1",
      permissionName: "x",
    });

    expect(result.name).toBe("x");
    expect(permRepo.grantPermission).toHaveBeenCalledWith("t1", "x");
  });
});
