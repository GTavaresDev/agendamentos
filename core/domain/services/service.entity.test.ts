import { describe, expect, it } from "vitest";
import { Service } from "./service.entity";

describe("Service construction", () => {
  it("applies defaults for optional fields", () => {
    const service = new Service({ name: "Corte", duration: 30 });
    expect(service.status).toBe("Ativo");
    expect(service.price).toBe(0);
    expect(service.description).toBe("");
    expect(service.color).toBe("");
    expect(service.id).toBeTruthy();
  });

  it("preserves explicit values", () => {
    const service = new Service({ id: "s1", name: "Corte", duration: 30, price: 50, status: "Inativo" });
    expect(service.id).toBe("s1");
    expect(service.price).toBe(50);
    expect(service.status).toBe("Inativo");
  });
});

describe("Service.updateDetails", () => {
  it("only updates provided fields and bumps updatedAt", () => {
    const service = new Service({ name: "Corte", duration: 30, price: 50 });
    const before = service.updatedAt;
    service.updateDetails({ price: 80 });
    expect(service.price).toBe(80);
    expect(service.name).toBe("Corte");
    expect(service.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it("allows clearing description/color with an explicit empty string", () => {
    const service = new Service({ name: "Corte", duration: 30, description: "desc", color: "#fff" });
    service.updateDetails({ description: "", color: "" });
    expect(service.description).toBe("");
    expect(service.color).toBe("");
  });

  it("ignores falsy duration (does not zero it out unintentionally)", () => {
    const service = new Service({ name: "Corte", duration: 30 });
    service.updateDetails({ duration: 0 });
    expect(service.duration).toBe(30);
  });
});

describe("Service.updateStatus", () => {
  it("updates status", () => {
    const service = new Service({ name: "Corte", duration: 30 });
    service.updateStatus("Inativo");
    expect(service.status).toBe("Inativo");
  });
});
