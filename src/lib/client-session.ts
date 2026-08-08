import { cookies } from "next/headers";
import type { ClientAccountDTO } from "@core/application/portal/client-account.usecase";
import {
  CLIENT_SESSION_MAX_AGE_SECONDS,
  clientSessionCookieName,
  decodeClientSessionToken,
  encodeClientSessionToken,
  isSecureClientCookie,
  type ClientSession,
} from "./client-session-token";

/**
 * Sessão do portal do cliente.
 *
 * Cookie próprio, separado do cookie da equipe: uma sessão interna nunca vale
 * como sessão de cliente e vice-versa. O payload guarda só o necessário para
 * identificar o Client — todo dado sensível é buscado no banco a cada request.
 */
export type { ClientSession };

/**
 * Grava a sessão do portal.
 *
 * `impersonator` só é preenchido pelo "Ver como cliente" da equipe: a sessão
 * passa a ter a identidade efetiva do cliente, mas carrega assinado quem de
 * fato está olhando. O cookie da equipe não é tocado em nenhum caminho — é ele
 * que devolve o administrador ao sistema interno.
 */
export async function createClientSession(
  account: ClientAccountDTO,
  impersonator?: { id: string; name: string },
): Promise<void> {
  const secure = isSecureClientCookie();
  const encoded = await encodeClientSessionToken({
    clientId: account.id,
    name: account.name,
    email: account.email,
    initials: account.initials,
    ...(impersonator
      ? {
          impersonatorId: impersonator.id,
          impersonatorName: impersonator.name,
          impersonationStartedAt: new Date().toISOString(),
        }
      : {}),
  });

  const cookieStore = await cookies();
  cookieStore.set(clientSessionCookieName(secure), encoded, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure,
    expires: new Date(Date.now() + CLIENT_SESSION_MAX_AGE_SECONDS * 1000),
  });
}

export async function destroyClientSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(clientSessionCookieName());
}

export async function getClientSession(): Promise<ClientSession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(clientSessionCookieName())?.value;
  return raw ? decodeClientSessionToken(raw) : null;
}

export class ClientAuthRequiredError extends Error {
  constructor() {
    super("Faça login para continuar.");
    this.name = "ClientAuthRequiredError";
  }
}

/** Toda leitura/escrita do portal passa por aqui antes de tocar em dados. */
export async function requireClientSession(): Promise<ClientSession> {
  const session = await getClientSession();
  if (!session) {
    throw new ClientAuthRequiredError();
  }
  return session;
}
