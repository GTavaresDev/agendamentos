import { decode, encode } from "@auth/core/jwt";

/**
 * Codificação do cookie de sessão do portal do cliente.
 *
 * Separado de client-session.ts porque o middleware (edge) precisa validar o
 * token sem importar `next/headers`.
 */
export const CLIENT_SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

export type ClientSession = {
  clientId: string;
  name: string;
  email: string;
  initials: string;
  /**
   * Preenchido só quando um administrador está vendo o portal como este
   * cliente. Vai dentro do token assinado — o navegador não consegue inventar
   * nem apagar esses campos sem o AUTH_SECRET.
   */
  impersonatorId?: string;
  impersonatorName?: string;
  /** ISO. Início da visualização. */
  impersonationStartedAt?: string;
};

type ClientSessionToken = ClientSession & { sub?: string };

export function isSecureClientCookie(): boolean {
  return process.env.NODE_ENV === "production";
}

export function clientSessionCookieName(
  secure = isSecureClientCookie(),
): string {
  return secure
    ? "__Secure-agendamentos.client-session"
    : "agendamentos.client-session";
}

function requireAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET não configurado");
  }
  return secret;
}

export async function encodeClientSessionToken(
  session: ClientSession,
): Promise<string> {
  return encode({
    token: { ...session, sub: session.clientId } satisfies ClientSessionToken,
    secret: requireAuthSecret(),
    salt: clientSessionCookieName(),
    maxAge: CLIENT_SESSION_MAX_AGE_SECONDS,
  });
}

export async function decodeClientSessionToken(
  raw: string,
): Promise<ClientSession | null> {
  try {
    const payload = await decode<ClientSessionToken>({
      token: raw,
      secret: requireAuthSecret(),
      salt: clientSessionCookieName(),
    });

    if (!payload?.clientId) {
      return null;
    }

    return {
      clientId: payload.clientId,
      name: payload.name,
      email: payload.email,
      initials: payload.initials,
      ...(payload.impersonatorId
        ? {
            impersonatorId: payload.impersonatorId,
            impersonatorName: payload.impersonatorName,
            impersonationStartedAt: payload.impersonationStartedAt,
          }
        : {}),
    };
  } catch {
    return null;
  }
}
