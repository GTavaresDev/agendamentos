import { describe, expect, it } from "vitest";
import { ListSystemPermissions } from "./list-system-permissions.usecase";
import { mockPermissionRepository } from "./test-helpers";
import { SystemPermission } from "@core/domain/users/system-permission.entity";

describe("ListSystemPermissions", () => {
  it("returns plain DTOs from all system permissions, including disabled ones", async () => {
    const repo = mockPermissionRepository();
    repo.findAllSystemPermissions.mockResolvedValue([
      new SystemPermission({
        id: 1,
        name: "x",
        category: "general",
        enabled: false,
        requiresHierarchy: false,
      }),
    ]);
    const useCase = new ListSystemPermissions(repo);

    const result = await useCase.execute();

    expect(result).toEqual([
      { id: 1, name: "x", category: "general", enabled: false, requiresHierarchy: false },
    ]);
  });
});
