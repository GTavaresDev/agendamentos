import { describe, expect, it } from "vitest";
import { SystemPermission } from "./system-permission.entity";

describe("SystemPermission", () => {
  it("exposes getters from props", () => {
    const permission = new SystemPermission({
      id: 1,
      name: "ver_relatorios",
      category: "reports",
      enabled: true,
      requiresHierarchy: false,
    });
    expect(permission.id).toBe(1);
    expect(permission.category).toBe("reports");
    expect(permission.enabled).toBe(true);
    expect(permission.requiresHierarchy).toBe(false);
  });

  it("toJSON returns a plain copy of the props", () => {
    const props = {
      id: 1,
      name: "ver_relatorios",
      category: "reports" as const,
      enabled: true,
      requiresHierarchy: false,
    };
    const permission = new SystemPermission(props);
    expect(permission.toJSON()).toEqual(props);
  });
});
