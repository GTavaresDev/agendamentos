import { describe, expect, it } from "vitest";
import { UserPermission } from "./user-permission.entity";

describe("UserPermission", () => {
  it("exposes getters from props", () => {
    const permission = new UserPermission({
      id: 1,
      name: "ver_relatorios",
      userId: "u1",
      enabled: true,
    });
    expect(permission.id).toBe(1);
    expect(permission.name).toBe("ver_relatorios");
    expect(permission.userId).toBe("u1");
  });

  it("toJSON returns a plain copy of the props", () => {
    const props = { id: 1, name: "ver_relatorios", userId: "u1", enabled: true };
    const permission = new UserPermission(props);
    expect(permission.toJSON()).toEqual(props);
  });
});
