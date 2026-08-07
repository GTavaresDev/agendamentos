import { beforeEach, describe, expect, it } from "vitest";
import { buildClient, mockClientRepository } from "@core/application/clients/test-helpers";
import { ClientAccountError } from "./client-account.usecase";
import {
  CompleteClientProfile,
  GetClientProfileStatus,
} from "./complete-client-profile.usecase";

const NOW = new Date("2026-08-07T12:00:00Z");

const valid = {
  clientId: "abc123",
  name: "Maria Silva",
  phone: "(11) 99427-9139",
  birthDate: "1995-01-15",
};

describe("GetClientProfileStatus", () => {
  let repo: ReturnType<typeof mockClientRepository>;

  beforeEach(() => {
    repo = mockClientRepository();
  });

  it("marca como incompleto quem entrou pelo Google", async () => {
    repo.findById.mockResolvedValue(
      buildClient({ id: "abc123", phone: "", birthDate: "" }),
    );

    const status = await new GetClientProfileStatus(repo).execute("abc123", NOW);

    expect(status.complete).toBe(false);
    expect(status.missing).toEqual(["phone", "birthDate"]);
    expect(status.name).toBe("Maria Silva");
  });

  it("marca como completo quem já tem telefone e nascimento", async () => {
    repo.findById.mockResolvedValue(
      buildClient({ id: "abc123", phone: "11994279139", birthDate: "1995-01-15" }),
    );

    const status = await new GetClientProfileStatus(repo).execute("abc123", NOW);
    expect(status.complete).toBe(true);
    expect(status.missing).toEqual([]);
  });

  it("não expõe senha, cpf nem status interno", async () => {
    repo.findById.mockResolvedValue(buildClient({ id: "abc123", password: "$2a$12$h" }));

    const status = await new GetClientProfileStatus(repo).execute("abc123", NOW);
    expect(Object.keys(status).sort()).toEqual([
      "birthDate",
      "complete",
      "email",
      "missing",
      "name",
      "phone",
    ]);
  });
});

describe("CompleteClientProfile", () => {
  let repo: ReturnType<typeof mockClientRepository>;

  beforeEach(() => {
    repo = mockClientRepository();
  });

  it("salva telefone e nascimento mantendo a mesma conta", async () => {
    const client = buildClient({
      id: "abc123",
      email: "maria@gmail.com",
      phone: "",
      birthDate: "",
    });
    repo.findById.mockResolvedValue(client);

    const status = await new CompleteClientProfile(repo).execute(valid, NOW);

    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(repo.save).not.toHaveBeenCalled();
    expect(client.id).toBe("abc123");
    expect(client.birthDate).toBe("1995-01-15");
    expect(status.complete).toBe(true);
  });

  it("nunca troca o e-mail da conta", async () => {
    const client = buildClient({ id: "abc123", email: "maria@gmail.com" });
    repo.findById.mockResolvedValue(client);

    await new CompleteClientProfile(repo).execute(
      { ...valid, name: "Maria Silva Souza" },
      NOW,
    );

    expect(client.email).toBe("maria@gmail.com");
  });

  it("não reativa conta desativada", async () => {
    const client = buildClient({ id: "abc123", status: "Inativo" });
    repo.findById.mockResolvedValue(client);

    await expect(
      new CompleteClientProfile(repo).execute(valid, NOW),
    ).rejects.toBeInstanceOf(ClientAccountError);
    expect(repo.update).not.toHaveBeenCalled();
    expect(client.status).toBe("Inativo");
  });

  it("recusa telefone inválido e data inválida", async () => {
    repo.findById.mockResolvedValue(buildClient({ id: "abc123" }));

    await expect(
      new CompleteClientProfile(repo).execute({ ...valid, phone: "119" }, NOW),
    ).rejects.toThrow(/telefone/i);

    await expect(
      new CompleteClientProfile(repo).execute({ ...valid, birthDate: "2030-01-01" }, NOW),
    ).rejects.toThrow(/nascimento/i);

    await expect(
      new CompleteClientProfile(repo).execute({ ...valid, name: "Ma" }, NOW),
    ).rejects.toThrow(/nome/i);

    expect(repo.update).not.toHaveBeenCalled();
  });

  it("recusa cliente inexistente", async () => {
    repo.findById.mockResolvedValue(null);

    await expect(
      new CompleteClientProfile(repo).execute(valid, NOW),
    ).rejects.toBeInstanceOf(ClientAccountError);
  });
});
