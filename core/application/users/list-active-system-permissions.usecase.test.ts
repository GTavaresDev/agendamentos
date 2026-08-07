import { describe, expect, it } from "vitest";
import { ListActiveSystemPermissions } from "./list-active-system-permissions.usecase";
import { mockPermissionRepository } from "./test-helpers";
import { SystemPermission } from "@core/domain/users/system-permission.entity";

describe("ListActiveSystemPermissions", () => {
  it("returns plain DTOs from the repository's active permissions", async () => {
    const repo = mockPermissionRepository();
    repo.findActiveSystemPermissions.mockResolvedValue([
      new SystemPermission({
        id: 1,
        name: "x",
        category: "general",
        enabled: true,
        requiresHierarchy: false,
      }),
    ]);
    const useCase = new ListActiveSystemPermissions(repo);

    const result = await useCase.execute();

    expect(result).toEqual([
      { id: 1, name: "x", category: "general", enabled: true, requiresHierarchy: false },
    ]);
  });
});
