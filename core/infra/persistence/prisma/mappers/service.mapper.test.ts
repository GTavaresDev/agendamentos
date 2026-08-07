import { describe, expect, it } from "vitest";
import { ServiceMapper } from "./service.mapper";

const raw = {
  id: "sv1",
  name: "Corte",
  description: null,
  duration: 30,
  price: null,
  status: "Ativo",
  color: null,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-02"),
};

describe("ServiceMapper.toDomain", () => {
  it("defaults null description/price/color/status", () => {
    const service = ServiceMapper.toDomain(raw);

    expect(service.description).toBe("");
    expect(service.price).toBe(0);
    expect(service.color).toBe("");
    expect(service.status).toBe("Ativo");
  });
});

describe("ServiceMapper.toPersistence", () => {
  it("converts empty description/color and zero price back to null", () => {
    const service = ServiceMapper.toDomain(raw);
    const persisted = ServiceMapper.toPersistence(service);

    expect(persisted.description).toBeNull();
    expect(persisted.color).toBeNull();
    expect(persisted.price).toBeNull();
  });
});
