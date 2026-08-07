import { describe, expect, it } from "vitest";
import { ClientMapper } from "./client.mapper";

describe("ClientMapper.toDomain", () => {
  it("defaults missing optional fields", () => {
    const client = ClientMapper.toDomain({
      id: "c1",
      name: "Maria Silva",
      email: "maria@example.com",
      phone: "119",
      cpf: null,
      birthDate: null,
      status: null as unknown as string,
      initials: "MS",
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-02"),
    });

    expect(client.cpf).toBe("");
    expect(client.birthDate).toBe("");
    expect(client.status).toBe("Ativo");
  });
});

describe("ClientMapper.toPersistence", () => {
  it("converts empty strings back to null", () => {
    const client = ClientMapper.toDomain({
      id: "c1",
      name: "Maria Silva",
      email: "maria@example.com",
      phone: "119",
      cpf: null,
      birthDate: null,
      status: "Ativo",
      initials: "MS",
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-02"),
    });

    const raw = ClientMapper.toPersistence(client);

    expect(raw.cpf).toBeNull();
    expect(raw.birthDate).toBeNull();
  });
});
