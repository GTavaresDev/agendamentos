import { beforeEach, describe, expect, it, vi, type Mocked } from "vitest";
import {
  GOOGLE_PROVIDER,
  PortalOAuthError,
  ResolveOAuthClientAccount,
  type OAuthIdentity,
} from "./google-account-link.usecase";
import type { ClientOAuthAccountRepository } from "@core/domain/clients/client-oauth-account.repository";
import { buildClient, mockClientRepository } from "../clients/test-helpers";
import { buildUser, mockUserRepository } from "../users/test-helpers";

function mockOAuthAccountRepository(): Mocked<ClientOAuthAccountRepository> {
  return {
    findClientIdByProviderAccount: vi.fn().mockResolvedValue(null),
    hasLink: vi.fn().mockResolvedValue(false),
    link: vi.fn().mockResolvedValue(undefined),
  } as unknown as Mocked<ClientOAuthAccountRepository>;
}

function googleIdentity(overrides: Partial<OAuthIdentity> = {}): OAuthIdentity {
  return {
    provider: GOOGLE_PROVIDER,
    providerAccountId: "google-sub-1",
    email: "maria@gmail.com",
    emailVerified: true,
    name: "Maria Silva",
    ...overrides,
  };
}

describe("ResolveOAuthClientAccount", () => {
  let clients: ReturnType<typeof mockClientRepository>;
  let oauthAccounts: Mocked<ClientOAuthAccountRepository>;
  let users: ReturnType<typeof mockUserRepository>;
  let useCase: ResolveOAuthClientAccount;

  beforeEach(() => {
    clients = mockClientRepository();
    oauthAccounts = mockOAuthAccountRepository();
    users = mockUserRepository();
    clients.findByEmail.mockResolvedValue(null);
    clients.findById.mockResolvedValue(null);
    users.findByEmail.mockResolvedValue(null);
    useCase = new ResolveOAuthClientAccount(clients, oauthAccounts, users);
  });

  // TESTE 1 — cliente novo pelo Google
  it("cria um único cliente quando o e-mail ainda não existe", async () => {
    const account = await useCase.execute(googleIdentity());

    expect(clients.save).toHaveBeenCalledTimes(1);
    expect(clients.update).not.toHaveBeenCalled();
    expect(users.save).not.toHaveBeenCalled();

    const saved = clients.save.mock.calls[0][0];
    expect(saved.email).toBe("maria@gmail.com");
    expect(saved.status).toBe("Ativo");
    expect(saved.password).toBeNull();
    expect(account.id).toBe(saved.id);
    expect(oauthAccounts.link).toHaveBeenCalledWith({
      clientId: saved.id,
      provider: GOOGLE_PROVIDER,
      providerAccountId: "google-sub-1",
    });
  });

  it("não devolve senha, cpf nem status no retorno", async () => {
    const account = await useCase.execute(googleIdentity());
    expect(Object.keys(account).sort()).toEqual(["email", "id", "initials", "name"]);
  });

  // TESTE 2 — cliente manual já existente entra pelo Google
  it("vincula ao cliente existente sem criar outro cadastro", async () => {
    const existing = buildClient({
      id: "abc123",
      email: "maria@gmail.com",
      password: "$2a$12$hash",
    });
    clients.findByEmail.mockResolvedValue(existing);

    const account = await useCase.execute(googleIdentity());

    expect(account.id).toBe("abc123");
    expect(clients.save).not.toHaveBeenCalled();
    expect(oauthAccounts.link).toHaveBeenCalledWith({
      clientId: "abc123",
      provider: GOOGLE_PROVIDER,
      providerAccountId: "google-sub-1",
    });
    // a senha do cadastro manual continua valendo
    expect(existing.password).toBe("$2a$12$hash");
  });

  // TESTE 4 — diferença de maiúsculas
  it("reconhece a mesma conta com e-mail em outra caixa", async () => {
    const existing = buildClient({ id: "abc123", email: "maria@gmail.com" });
    clients.findByEmail.mockResolvedValue(existing);

    const account = await useCase.execute(
      googleIdentity({ email: "Maria@Gmail.com" }),
    );

    expect(clients.findByEmail).toHaveBeenCalledWith("maria@gmail.com");
    expect(account.id).toBe("abc123");
    expect(clients.save).not.toHaveBeenCalled();
  });

  // TESTE 5 — espaços em volta do e-mail
  it("reconhece a mesma conta com espaços no e-mail", async () => {
    const existing = buildClient({ id: "abc123", email: "maria@gmail.com" });
    clients.findByEmail.mockResolvedValue(existing);

    const account = await useCase.execute(
      googleIdentity({ email: "  maria@gmail.com  " }),
    );

    expect(clients.findByEmail).toHaveBeenCalledWith("maria@gmail.com");
    expect(account.id).toBe("abc123");
    expect(clients.save).not.toHaveBeenCalled();
  });

  // TESTE 6 — login repetido
  it("login repetido reusa o vínculo e não cria nada novo", async () => {
    const existing = buildClient({ id: "abc123", email: "maria@gmail.com" });
    oauthAccounts.findClientIdByProviderAccount.mockResolvedValue("abc123");
    clients.findById.mockResolvedValue(existing);

    const account = await useCase.execute(googleIdentity());

    expect(account.id).toBe("abc123");
    expect(clients.save).not.toHaveBeenCalled();
    expect(clients.findByEmail).not.toHaveBeenCalled();
    expect(oauthAccounts.link).not.toHaveBeenCalled();
  });

  it("segue o vínculo mesmo se o e-mail do Google mudou", async () => {
    const existing = buildClient({ id: "abc123", email: "maria@gmail.com" });
    oauthAccounts.findClientIdByProviderAccount.mockResolvedValue("abc123");
    clients.findById.mockResolvedValue(existing);

    const account = await useCase.execute(
      googleIdentity({ email: "maria.silva@gmail.com" }),
    );

    expect(account.id).toBe("abc123");
    expect(account.email).toBe("maria@gmail.com");
    expect(clients.save).not.toHaveBeenCalled();
  });

  // TESTE 7 — histórico preservado
  it("mantém o mesmo id do cliente, preservando o histórico de agendamentos", async () => {
    const existing = buildClient({ id: "abc123", email: "maria@gmail.com" });
    clients.findByEmail.mockResolvedValue(existing);

    const first = await useCase.execute(googleIdentity());
    oauthAccounts.findClientIdByProviderAccount.mockResolvedValue("abc123");
    clients.findById.mockResolvedValue(existing);
    const second = await useCase.execute(googleIdentity());

    // Os agendamentos são consultados por clientId: mesmo id, mesmo histórico.
    expect(first.id).toBe("abc123");
    expect(second.id).toBe("abc123");
    expect(clients.save).not.toHaveBeenCalled();
  });

  // TESTE 8 — e-mail não verificado
  it("recusa identidade do Google com e-mail não verificado", async () => {
    const existing = buildClient({ id: "abc123", email: "maria@gmail.com" });
    clients.findByEmail.mockResolvedValue(existing);

    await expect(
      useCase.execute(googleIdentity({ emailVerified: false })),
    ).rejects.toMatchObject({ code: "email_nao_verificado" });

    expect(oauthAccounts.link).not.toHaveBeenCalled();
    expect(clients.save).not.toHaveBeenCalled();
  });

  // TESTE 9 — e-mail de usuário interno
  it("não cria cliente nem altera cargo quando o e-mail é de um usuário interno", async () => {
    const staff = buildUser({
      id: "u1",
      email: "gabriel@clinica.com",
      role: "Administrador",
    });
    users.findByEmail.mockResolvedValue(staff);

    await expect(
      useCase.execute(googleIdentity({ email: "gabriel@clinica.com" })),
    ).rejects.toMatchObject({ code: "conta_indisponivel" });

    expect(clients.save).not.toHaveBeenCalled();
    expect(users.update).not.toHaveBeenCalled();
    expect(users.save).not.toHaveBeenCalled();
    expect(oauthAccounts.link).not.toHaveBeenCalled();
    expect(staff.role).toBe("Administrador");
  });

  // TESTE 10 — conta bloqueada
  it("não deixa o Google contornar conta inativa", async () => {
    const blocked = buildClient({
      id: "abc123",
      email: "maria@gmail.com",
      status: "Inativo",
    });
    clients.findByEmail.mockResolvedValue(blocked);

    await expect(useCase.execute(googleIdentity())).rejects.toMatchObject({
      code: "conta_desativada",
    });
    expect(oauthAccounts.link).not.toHaveBeenCalled();
  });

  it("não deixa o Google contornar conta inativa já vinculada", async () => {
    const blocked = buildClient({ id: "abc123", status: "Inativo" });
    oauthAccounts.findClientIdByProviderAccount.mockResolvedValue("abc123");
    clients.findById.mockResolvedValue(blocked);

    await expect(useCase.execute(googleIdentity())).rejects.toMatchObject({
      code: "conta_desativada",
    });
  });

  it("recusa identidade sem sub ou sem e-mail", async () => {
    await expect(
      useCase.execute(googleIdentity({ providerAccountId: "" })),
    ).rejects.toBeInstanceOf(PortalOAuthError);
    await expect(
      useCase.execute(googleIdentity({ email: "" })),
    ).rejects.toBeInstanceOf(PortalOAuthError);
    expect(clients.save).not.toHaveBeenCalled();
  });

  it("usa a parte local do e-mail quando o Google não manda nome", async () => {
    await useCase.execute(googleIdentity({ name: null }));
    expect(clients.save.mock.calls[0][0].name).toBe("maria");
  });
});
