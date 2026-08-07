import { Client } from "@core/domain/clients/client.entity";
import { ClientOAuthAccountRepository } from "@core/domain/clients/client-oauth-account.repository";
import { ClientRepository } from "@core/domain/clients/client.repository";
import { UserRepository } from "@core/domain/users/user.repository";
import {
  normalizeEmail,
  toClientAccountDTO,
  type ClientAccountDTO,
} from "./client-account.usecase";

export { GOOGLE_PROVIDER } from "@core/domain/clients/client-oauth-account.repository";

/**
 * Falhas do login social, em código. O texto para o cliente é montado na UI —
 * assim nada de interno (nome de tabela, id, motivo exato) chega ao navegador.
 */
export type PortalOAuthErrorCode =
  | "email_nao_verificado"
  | "conta_desativada"
  | "conta_indisponivel"
  | "falha";

export class PortalOAuthError extends Error {
  constructor(public readonly code: PortalOAuthErrorCode) {
    super(code);
    this.name = "PortalOAuthError";
  }
}

/** Identidade devolvida pelo provedor. Nunca vem do navegador. */
export interface OAuthIdentity {
  provider: string;
  /** `sub` do provedor: estável mesmo se a pessoa trocar de e-mail. */
  providerAccountId: string;
  email: string;
  emailVerified: boolean;
  name?: string | null;
}

function displayName(identity: OAuthIdentity, email: string): string {
  const fromProvider = identity.name?.trim();
  if (fromProvider) return fromProvider;
  return email.split("@")[0] || "Cliente";
}

/**
 * Resolve QUAL cliente está entrando pelo Google.
 *
 * Regra central: método de autenticação != identidade. O Google é só mais uma
 * porta para o mesmo Client — nunca cria um segundo cadastro para quem já
 * existe, nunca concede papel interno, nunca contorna conta inativa.
 *
 * Ordem de resolução:
 *   1. vínculo já registrado (provider + sub) → aquele Client;
 *   2. e-mail verificado igual ao de um Client → vincula ao existente;
 *   3. e-mail de um usuário interno sem Client → recusa (não cria paralelo);
 *   4. ninguém → cria um Client novo, sempre como cliente comum.
 */
export class ResolveOAuthClientAccount {
  constructor(
    private clientRepository: ClientRepository,
    private oauthAccountRepository: ClientOAuthAccountRepository,
    private userRepository: UserRepository,
  ) {}

  async execute(identity: OAuthIdentity): Promise<ClientAccountDTO> {
    const email = normalizeEmail(identity.email ?? "");
    const providerAccountId = identity.providerAccountId?.trim() ?? "";

    if (!providerAccountId || !email.includes("@")) {
      throw new PortalOAuthError("falha");
    }

    // O provedor precisa afirmar que o e-mail é dele. Sem isso, uma identidade
    // não verificada poderia reivindicar a conta de outra pessoa.
    if (!identity.emailVerified) {
      throw new PortalOAuthError("email_nao_verificado");
    }

    const linkedClientId =
      await this.oauthAccountRepository.findClientIdByProviderAccount(
        identity.provider,
        providerAccountId,
      );

    if (linkedClientId) {
      const linked = await this.clientRepository.findById(linkedClientId);
      if (linked) {
        return this.assertActive(linked);
      }
    }

    const byEmail = await this.clientRepository.findByEmail(email);
    if (byEmail) {
      const account = this.assertActive(byEmail);
      await this.oauthAccountRepository.link({
        clientId: byEmail.id,
        provider: identity.provider,
        providerAccountId,
      });
      return account;
    }

    // E-mail da equipe interna: preserva a conta e o cargo existentes e não
    // cria um cliente com o mesmo e-mail por baixo dos panos.
    const internal = await this.userRepository.findByEmail(email);
    if (internal) {
      throw new PortalOAuthError("conta_indisponivel");
    }

    const created = new Client({
      name: displayName(identity, email),
      email,
      phone: "",
      password: null,
      status: "Ativo",
    });

    await this.clientRepository.save(created);
    await this.oauthAccountRepository.link({
      clientId: created.id,
      provider: identity.provider,
      providerAccountId,
    });

    return toClientAccountDTO(created);
  }

  private assertActive(client: Client): ClientAccountDTO {
    if (client.status !== "Ativo") {
      throw new PortalOAuthError("conta_desativada");
    }
    return toClientAccountDTO(client);
  }
}
