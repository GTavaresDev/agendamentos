import { describe, expect, it } from "vitest";
import {
  PermissionValidationError,
  canAccessReports,
  canManageRole,
  canSharePermissions,
  getRoleHierarchyLevel,
  hasPermission,
  validatePermissionGrant,
} from "./permission-validation.business-rule";

describe("hasPermission", () => {
  it("is true when an enabled permission with the name exists", () => {
    expect(
      hasPermission(
        { role: "Funcionario", permissions: [{ id: 1, name: "x", userId: "u1", enabled: true }] },
        "x",
      ),
    ).toBe(true);
  });

  it("is false when the permission is disabled", () => {
    expect(
      hasPermission(
        { role: "Funcionario", permissions: [{ id: 1, name: "x", userId: "u1", enabled: false }] },
        "x",
      ),
    ).toBe(false);
  });

  it("is false when permissions are missing entirely", () => {
    expect(hasPermission({ role: "Funcionario" }, "x")).toBe(false);
  });
});

describe("canSharePermissions", () => {
  it("is always true for Administrador regardless of explicit permissions", () => {
    expect(canSharePermissions({ role: "Administrador" })).toBe(true);
  });

  it("is true for a non-admin with the explicit sharing permission", () => {
    expect(
      canSharePermissions({
        role: "Gestor",
        permissions: [{ id: 1, name: "compartilhar_permissoes", userId: "u1", enabled: true }],
      }),
    ).toBe(true);
  });

  it("is false for a non-admin without the sharing permission", () => {
    expect(canSharePermissions({ role: "Funcionario" })).toBe(false);
  });
});

describe("canAccessReports", () => {
  it("is always true for Administrador", () => {
    expect(canAccessReports({ role: "Administrador" })).toBe(true);
  });

  it("depends on the explicit permission for non-admins", () => {
    expect(canAccessReports({ role: "Gestor" })).toBe(false);
    expect(
      canAccessReports({
        role: "Gestor",
        permissions: [{ id: 1, name: "ver_relatorios", userId: "u1", enabled: true }],
      }),
    ).toBe(true);
  });
});

describe("validatePermissionGrant — security boundary", () => {
  it("rejects a granter with no sharing ability", () => {
    expect(() =>
      validatePermissionGrant({ role: "Funcionario" }, "Funcionario", "ver_relatorios"),
    ).toThrow(PermissionValidationError);
  });

  it("rejects granting a permission the granter does not already hold", () => {
    expect(() =>
      validatePermissionGrant(
        {
          role: "Gestor",
          permissions: [{ id: 1, name: "compartilhar_permissoes", userId: "u1", enabled: true }],
        },
        "Funcionario",
        "ver_relatorios",
      ),
    ).toThrow(PermissionValidationError);
  });

  it("allows Administrador to grant any permission without holding it explicitly", () => {
    expect(() =>
      validatePermissionGrant({ role: "Administrador" }, "Gestor", "qualquer_permissao"),
    ).not.toThrow();
  });

  it("rejects a Gestor granting a permission to an Administrador (hierarchy escalation)", () => {
    expect(() =>
      validatePermissionGrant(
        {
          role: "Gestor",
          permissions: [
            { id: 1, name: "compartilhar_permissoes", userId: "u1", enabled: true },
            { id: 2, name: "ver_relatorios", userId: "u1", enabled: true },
          ],
        },
        "Administrador",
        "ver_relatorios",
      ),
    ).toThrow(PermissionValidationError);
  });

  it("allows a Gestor granting a permission it holds to a Funcionario (same or lower hierarchy)", () => {
    expect(() =>
      validatePermissionGrant(
        {
          role: "Gestor",
          permissions: [
            { id: 1, name: "compartilhar_permissoes", userId: "u1", enabled: true },
            { id: 2, name: "ver_relatorios", userId: "u1", enabled: true },
          ],
        },
        "Funcionario",
        "ver_relatorios",
      ),
    ).not.toThrow();
  });
});

describe("getRoleHierarchyLevel", () => {
  it.each([
    ["Administrador", 1],
    ["Gestor", 2],
    ["Funcionario", 3],
  ] as const)("returns %d for %s", (role, level) => {
    expect(getRoleHierarchyLevel(role)).toBe(level);
  });
});

describe("canManageRole", () => {
  it("allows managing equal or lower hierarchy roles", () => {
    expect(canManageRole("Administrador", "Gestor")).toBe(true);
    expect(canManageRole("Gestor", "Gestor")).toBe(true);
  });

  it("rejects managing a higher hierarchy role", () => {
    expect(canManageRole("Funcionario", "Administrador")).toBe(false);
  });
});
