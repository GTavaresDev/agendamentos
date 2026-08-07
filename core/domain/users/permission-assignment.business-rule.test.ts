import { describe, expect, it } from "vitest";
import {
  assertPermissionIsAssignable,
  getActiveSystemPermissionNames,
  getAssignablePermissionNames,
  getGrantablePermissionNames,
  getInactiveAssignedPermissions,
} from "./permission-assignment.business-rule";
import type { SystemPermissionProps } from "./system-permission.entity";
import type { UserPermissionProps } from "./user-permission.entity";

const sysPerm = (overrides: Partial<SystemPermissionProps> = {}): SystemPermissionProps => ({
  id: 1,
  name: "ver_relatorios",
  category: "reports",
  enabled: true,
  requiresHierarchy: false,
  ...overrides,
});

const userPerm = (overrides: Partial<UserPermissionProps> = {}): UserPermissionProps => ({
  id: 1,
  name: "ver_relatorios",
  userId: "u1",
  enabled: true,
  ...overrides,
});

describe("getActiveSystemPermissionNames", () => {
  it("returns a set of all names regardless of enabled flag", () => {
    const names = getActiveSystemPermissionNames([
      sysPerm({ name: "a" }),
      sysPerm({ name: "b", enabled: false }),
    ]);
    expect(names).toEqual(new Set(["a", "b"]));
  });
});

describe("getGrantablePermissionNames", () => {
  it("returns only the granter's own enabled permissions for non-admins", () => {
    const names = getGrantablePermissionNames(
      {
        role: "Gestor",
        permissions: [userPerm({ name: "a" }), userPerm({ name: "b", enabled: false })],
      },
      [sysPerm({ name: "c" })],
    );
    expect(names).toEqual(["a"]);
  });

  it("gives Administrador every active system permission plus their own", () => {
    const names = getGrantablePermissionNames(
      { role: "Administrador", permissions: [userPerm({ name: "a" })] },
      [sysPerm({ name: "c" })],
    );
    expect(new Set(names)).toEqual(new Set(["a", "c"]));
  });

  it("deduplicates overlapping names", () => {
    const names = getGrantablePermissionNames(
      { role: "Administrador", permissions: [userPerm({ name: "c" })] },
      [sysPerm({ name: "c" })],
    );
    expect(names).toEqual(["c"]);
  });
});

describe("getAssignablePermissionNames", () => {
  it("excludes disabled user permissions", () => {
    const names = getAssignablePermissionNames(
      [userPerm({ name: "a" }), userPerm({ name: "b", enabled: false })],
      new Set(["a", "b"]),
    );
    expect(names).toEqual(["a"]);
  });

  it("excludes permissions not in the active system set", () => {
    const names = getAssignablePermissionNames([userPerm({ name: "a" })], new Set(["b"]));
    expect(names).toEqual([]);
  });

  it("handles undefined input", () => {
    expect(getAssignablePermissionNames(undefined, new Set(["a"]))).toEqual([]);
  });
});

describe("getInactiveAssignedPermissions", () => {
  it("returns enabled permissions whose system permission is no longer active", () => {
    const perms = getInactiveAssignedPermissions(
      [userPerm({ name: "a" }), userPerm({ name: "b", enabled: false })],
      new Set(["c"]),
    );
    expect(perms).toEqual([userPerm({ name: "a" })]);
  });
});

describe("assertPermissionIsAssignable", () => {
  it("throws when the permission is not in the active set", () => {
    expect(() => assertPermissionIsAssignable("x", new Set(["y"]))).toThrow(
      /desativada/,
    );
  });

  it("does not throw when active", () => {
    expect(() => assertPermissionIsAssignable("x", new Set(["x"]))).not.toThrow();
  });
});
