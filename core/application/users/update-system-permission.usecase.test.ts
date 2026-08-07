import { describe, expect, it } from "vitest";
import { UpdateSystemPermission } from "./update-system-permission.usecase";
import { mockPermissionRepository } from "./test-helpers";
import { SystemPermission } from "@core/domain/users/system-permission.entity";

describe("UpdateSystemPermission", () => {
  it("forwards the update and returns a plain DTO", async () => {
    const repo = mockPermissionRepository();
    repo.updateSystemPermission.mockResolvedValue(
      new SystemPermission({
        id: 1,
        name: "x",
        category: "general",
        enabled: false,
        requiresHierarchy: false,
      }),
    );
    const useCase = new UpdateSystemPermission(repo);

    const result = await useCase.execute({ id: 1, enabled: false });

    expect(repo.updateSystemPermission).toHaveBeenCalledWith(1, {
      enabled: false,
      description: undefined,
    });
    expect(result.enabled).toBe(false);
  });
});
