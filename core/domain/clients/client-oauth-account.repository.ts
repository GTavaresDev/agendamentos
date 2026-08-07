/**
 * Identidades externas (Google) apontando para um Client já existente.
 *
 * Não é uma conta paralela: o Client continua sendo a única identidade do
 * cliente. Aqui só guardamos "este `sub` do provedor é aquele Client", para
 * que o vínculo sobreviva a uma troca de e-mail no Google e para que a
 * unicidade (provider, providerAccountId) seja garantida pelo banco.
 */
export const GOOGLE_PROVIDER = "google";

export interface ClientOAuthAccountRepository {
  findClientIdByProviderAccount(
    provider: string,
    providerAccountId: string,
  ): Promise<string | null>;

  hasLink(clientId: string, provider: string): Promise<boolean>;

  /** Idempotente: repetir o login não cria vínculo duplicado. */
  link(input: {
    clientId: string;
    provider: string;
    providerAccountId: string;
  }): Promise<void>;
}
