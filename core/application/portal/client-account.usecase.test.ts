import { describe, expect, it, vi, type Mocked } from "vitest";
import { buildClient, mockClientRepository } from "@core/application/clients/test-helpers";
import type { ClientOAuthAccountRepository } from "@core/domain/clients/client-oauth-account.repository";
import { hashPassword, verifyPassword } from "@core/infra/auth/password";
import {
  AuthenticateClient,
  ClientAccountError,
  RegisterClientAccount,
  SetClientPassword,
} from "./client-account.usecase";

function oauthAccountsLinkedToGoogle(linked: boolean): Mocked<ClientOAuthAccountRepository> {
  return {
    findClientIdByProviderAccount: vi.fn().mockResolvedValue(null),
    hasLink: vi.fn().mockResolvedValue(linked),
    link: vi.fn(),
  } as unknown as Mocked<ClientOAuthAccountRepository>;
}

const input = {
  name: "Maria Silva",
  email: " Maria@Example.com ",
  phone: "(11) 99999-9999",
  password: "senha-super-secreta",
};

describe("RegisterClientAccount", () => {
  it("cria um novo cliente com senha em hash e e-mail normalizado", async () => {
    const repo = mockClientRepository();
    repo.findByEmail.mockResolvedValue(null);

    const account = await new RegisterClientAccount(repo).execute(input);

    expect(repo.save).toHaveBeenCalledTimes(1);
    const saved = repo.save.mock.calls[0][0];
    expect(saved.email).toBe("maria@example.com");
    expect(saved.password).not.toBe(input.password);
    expect(saved.password).toMatch(/^\$2[aby]\$/);
    expect(account).toEqual({
      id: saved.id,
      name: "Maria Silva",
      email: "maria@example.com",
      initials: "MS",
    });
  });

  it("não duplica cliente: assume o cadastro existente sem senha", async () => {
    const repo = mockClientRepository();
    repo.findByEmail.mockResolvedValue(
      buildClient({ id: "c1", email: "maria@example.com", phone: "11999999999" }),
    );

    const account = await new RegisterClientAccount(repo).execute(input);

    expect(repo.save).not.toHaveBeenCalled();
    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(repo.update.mock.calls[0][0].password).toMatch(/^\$2[aby]\$/);
    expect(account.id).toBe("c1");
  });

  it("recusa assumir cadastro existente quando o telefone não confere", async () => {
    const repo = mockClientRepository();
    repo.findByEmail.mockResolvedValue(
      buildClient({ email: "maria@example.com", phone: "11888888888" }),
    );

    await expect(new RegisterClientAccount(repo).execute(input)).rejects.toThrow(
      ClientAccountError,
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("recusa e-mail que já tem conta no portal", async () => {
    const repo = mockClientRepository();
    repo.findByEmail.mockResolvedValue(
      buildClient({ email: "maria@example.com", password: "$2a$12$hash" }),
    );

    await expect(new RegisterClientAccount(repo).execute(input)).rejects.toThrow(
      /já possui uma conta/i,
    );
  });

  // TESTE 3 — conta criada primeiro pelo Google, cadastro manual depois
  it("não duplica conta criada pelo Google: manda entrar pelo Google", async () => {
    const repo = mockClientRepository();
    repo.findByEmail.mockResolvedValue(
      buildClient({ id: "c1", email: "maria@example.com", phone: "", password: null }),
    );

    await expect(
      new RegisterClientAccount(repo, oauthAccountsLinkedToGoogle(true)).execute(input),
    ).rejects.toThrow(/Continuar com Google/i);

    expect(repo.save).not.toHaveBeenCalled();
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("recusa senha curta", async () => {
    const repo = mockClientRepository();
    repo.findByEmail.mockResolvedValue(null);

    await expect(
      new RegisterClientAccount(repo).execute({ ...input, password: "123" }),
    ).rejects.toThrow(/pelo menos 8/i);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it("recusa telefone inválido", async () => {
    const repo = mockClientRepository();
    repo.findByEmail.mockResolvedValue(null);

    await expect(
      new RegisterClientAccount(repo).execute({ ...input, phone: "123" }),
    ).rejects.toThrow(/telefone/i);
  });
});

describe("AuthenticateClient", () => {
  async function activeClient() {
    return buildClient({
      id: "c1",
      email: "maria@example.com",
      password: await hashPassword("senha-super-secreta"),
    });
  }

  it("autentica com a senha correta e devolve apenas dados públicos", async () => {
    const repo = mockClientRepository();
    repo.findByEmail.mockResolvedValue(await activeClient());

    const account = await new AuthenticateClient(repo).execute(
      "MARIA@example.com",
      "senha-super-secreta",
    );

    expect(Object.keys(account).sort()).toEqual(["email", "id", "initials", "name"]);
    expect(repo.findByEmail).toHaveBeenCalledWith("maria@example.com");
  });

  it("recusa senha incorreta", async () => {
    const repo = mockClientRepository();
    repo.findByEmail.mockResolvedValue(await activeClient());

    await expect(
      new AuthenticateClient(repo).execute("maria@example.com", "outra-senha"),
    ).rejects.toThrow(/inválidos/i);
  });

  it("recusa cliente cadastrado internamente que nunca criou senha", async () => {
    const repo = mockClientRepository();
    repo.findByEmail.mockResolvedValue(buildClient({ password: null }));

    await expect(
      new AuthenticateClient(repo).execute("maria@example.com", "senha-super-secreta"),
    ).rejects.toThrow(/inválidos/i);
  });

  it("recusa e-mail inexistente sem revelar o motivo", async () => {
    const repo = mockClientRepository();
    repo.findByEmail.mockResolvedValue(null);

    await expect(
      new AuthenticateClient(repo).execute("ninguem@example.com", "senha-super-secreta"),
    ).rejects.toThrow(/inválidos/i);
  });

  it("recusa cliente inativo", async () => {
    const repo = mockClientRepository();
    const client = await activeClient();
    client.updateStatus("Inativo");
    repo.findByEmail.mockResolvedValue(client);

    await expect(
      new AuthenticateClient(repo).execute("maria@example.com", "senha-super-secreta"),
    ).rejects.toThrow(/inativa/i);
  });
});

describe("SetClientPassword", () => {
  it("define a senha de quem entrou pelo Google, mantendo a mesma conta", async () => {
    const repo = mockClientRepository();
    const client = buildClient({ id: "abc123", password: null });
    repo.findById.mockResolvedValue(client);

    await new SetClientPassword(repo).execute("abc123", "senha-super-secreta");

    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(repo.save).not.toHaveBeenCalled();
    expect(client.id).toBe("abc123");
    expect(await verifyPassword("senha-super-secreta", client.password!)).toBe(true);
  });

  it("não troca senha existente sem provar posse", async () => {
    const repo = mockClientRepository();
    repo.findById.mockResolvedValue(buildClient({ password: "$2a$12$hash" }));

    await expect(
      new SetClientPassword(repo).execute("abc123", "outra-senha-longa"),
    ).rejects.toBeInstanceOf(ClientAccountError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("recusa cliente inativo e cliente inexistente", async () => {
    const repo = mockClientRepository();
    repo.findById.mockResolvedValue(buildClient({ status: "Inativo", password: null }));
    await expect(
      new SetClientPassword(repo).execute("abc123", "senha-super-secreta"),
    ).rejects.toBeInstanceOf(ClientAccountError);

    repo.findById.mockResolvedValue(null);
    await expect(
      new SetClientPassword(repo).execute("sumiu", "senha-super-secreta"),
    ).rejects.toBeInstanceOf(ClientAccountError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("recusa senha curta", async () => {
    const repo = mockClientRepository();
    repo.findById.mockResolvedValue(buildClient({ password: null }));

    await expect(
      new SetClientPassword(repo).execute("abc123", "123"),
    ).rejects.toThrow(/pelo menos 8/i);
    expect(repo.update).not.toHaveBeenCalled();
  });
});
