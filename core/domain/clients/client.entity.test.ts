import { describe, expect, it } from "vitest";
import { Client } from "./client.entity";

describe("Client construction", () => {
  it("applies defaults for optional fields", () => {
    const client = new Client({ name: "Maria Silva", email: "maria@example.com", phone: "119" });
    expect(client.status).toBe("Ativo");
    expect(client.cpf).toBe("");
    expect(client.birthDate).toBe("");
    expect(client.id).toBeTruthy();
    expect(client.initials).toBe("MS");
  });

  it("preserves explicit values instead of overwriting with defaults", () => {
    const client = new Client({
      id: "c1",
      name: "Maria Silva",
      email: "maria@example.com",
      phone: "119",
      status: "Inativo",
      initials: "XX",
    });
    expect(client.id).toBe("c1");
    expect(client.status).toBe("Inativo");
    expect(client.initials).toBe("XX");
  });
});

describe("Client.updateStatus", () => {
  it("updates status and bumps updatedAt", () => {
    const client = new Client({ name: "Maria Silva", email: "maria@example.com", phone: "119" });
    const before = client.updatedAt;
    client.updateStatus("Inativo");
    expect(client.status).toBe("Inativo");
    expect(client.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });
});

describe("Client.updateDetails", () => {
  it("regenerates initials when the name changes", () => {
    const client = new Client({ name: "Maria Silva", email: "maria@example.com", phone: "119" });
    client.updateDetails({ name: "João Souza" });
    expect(client.name).toBe("João Souza");
    expect(client.initials).toBe("JS");
  });

  it("only updates the fields provided", () => {
    const client = new Client({
      name: "Maria Silva",
      email: "maria@example.com",
      phone: "119",
      cpf: "123",
    });
    client.updateDetails({ phone: "999" });
    expect(client.phone).toBe("999");
    expect(client.name).toBe("Maria Silva");
    expect(client.cpf).toBe("123");
  });

  it("allows clearing cpf/birthDate with an explicit empty string", () => {
    const client = new Client({
      name: "Maria Silva",
      email: "maria@example.com",
      phone: "119",
      cpf: "123",
    });
    client.updateDetails({ cpf: "" });
    expect(client.cpf).toBe("");
  });
});

describe("Client.generateInitials", () => {
  it("falls back to CL for an empty name", () => {
    expect(Client.generateInitials("  ")).toBe("CL");
  });

  it("uses first two letters for a single-word name", () => {
    expect(Client.generateInitials("Maria")).toBe("MA");
  });
});
