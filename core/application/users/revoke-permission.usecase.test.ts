import { describe, expect, it } from "vitest";
import { RevokePermission } from "./revoke-permission.usecase";
import { buildUser, mockPermissionRepository, mockUserRepository } from "./test-helpers";

describe("RevokePermission", () => {
  it("throws when the granter does not exist", async () => {
    const userRepo = mockUserRepository();
    const permRepo = mockPermissionRepository();
    userRepo.findById.mockResolvedValue(null);
    const useCase = new RevokePermission(permRepo, userRepo);

    await expect(
      useCase.execute({ granterId: "g1", targetUserId: "t1", permissionName: "x" }),
    ).rejects.toThrow(/Usuário que está revogando/);
  });

  it("throws when the target does not exist", async () => {
    const userRepo = mockUserRepository();
    const permRepo = mockPermissionRepository();
    userRepo.findById.mockImplementation(async (id: string) =>
      id === "g1" ? buildUser({ id: "g1" }) : null,
    );
    const useCase = new RevokePermission(permRepo, userRepo);

    await expect(
      useCase.execute({ granterId: "g1", targetUserId: "missing", permissionName: "x" }),
    ).rejects.toThrow(/Usuário alvo/);
  });

  it("prevents self-revocation", async () => {
    const userRepo = mockUserRepository();
    const permRepo = mockPermissionRepository();
    userRepo.findById.mockResolvedValue(buildUser({ id: "u1" }));
    const useCase = new RevokePermission(permRepo, userRepo);

    await expect(
      useCase.execute({ granterId: "u1", targetUserId: "u1", permissionName: "x" }),
    ).rejects.toThrow(/próprias permissões/);
  });

  it("rejects a Gestor revoking a permission from an Administrador (hierarchy)", async () => {
    const userRepo = mockUserRepository();
    const permRepo = mockPermissionRepository();
    userRepo.findById.mockImplementation(async (id: string) =>
      id === "g1"
        ? buildUser({
            id: "g1",
            role: "Gestor",
            permissions: [
              { id: 1, name: "compartilhar_permissoes", userId: "g1", enabled: true },
              { id: 2, name: "x", userId: "g1", enabled: true },
            ],
          })
        : buildUser({ id: "t1", role: "Administrador" }),
    );
    const useCase = new RevokePermission(permRepo, userRepo);

    await expect(
      useCase.execute({ granterId: "g1", targetUserId: "t1", permissionName: "x" }),
    ).rejects.toThrow(/nível hierárquico/);
    expect(permRepo.revokePermission).not.toHaveBeenCalled();
  });

  it("revokes successfully for a valid Administrador", async () => {
    const userRepo = mockUserRepository();
    const permRepo = mockPermissionRepository();
    userRepo.findById.mockImplementation(async (id: string) =>
      buildUser({ id, role: id === "g1" ? "Administrador" : "Funcionario" }),
    );
    const useCase = new RevokePermission(permRepo, userRepo);

    await useCase.execute({ granterId: "g1", targetUserId: "t1", permissionName: "x" });

    expect(permRepo.revokePermission).toHaveBeenCalledWith("t1", "x");
  });
});
