import { describe, expect, it } from "vitest";
import { resolvePermissionLevel, roleFromPermissionLevel } from "./resolve-permission-level.business-rule";

describe("resolvePermissionLevel", () => {
  it.each([
    ["Administrador", 1],
    ["Gestor", 2],
    ["Funcionario", 3],
  ] as const)("maps role %s to level %d", (role, level) => {
    expect(resolvePermissionLevel({ role })).toBe(level);
  });
});

describe("roleFromPermissionLevel", () => {
  it.each([
    [1, "Administrador"],
    [2, "Gestor"],
    [3, "Funcionario"],
  ] as const)("maps level %d to role %s", (level, role) => {
    expect(roleFromPermissionLevel(level)).toBe(role);
  });

  it("round-trips with resolvePermissionLevel", () => {
    for (const role of ["Administrador", "Gestor", "Funcionario"] as const) {
      const level = resolvePermissionLevel({ role });
      expect(roleFromPermissionLevel(level)).toBe(role);
    }
  });
});
