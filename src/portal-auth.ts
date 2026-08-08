import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import {
  GOOGLE_PROVIDER,
  PortalOAuthError,
  ResolveOAuthClientAccount,
} from "@core/application/portal/google-account-link.usecase";
import { PrismaClientOAuthAccountRepository } from "@core/infra/persistence/prisma/repositories/prisma-client-oauth-account.repository";
import { PrismaClientRepository } from "@core/infra/persistence/prisma/repositories/prisma-client.repository";
import { PrismaUserRepository } from "@core/infra/persistence/prisma/repositories/prisma-user.repository";
import {
  CLIENT_SESSION_MAX_AGE_SECONDS,
  clientSessionCookieName,
  isSecureClientCookie,
  type ClientSession,
} from "@/lib/client-session-token";

/**
 * Login social do PORTAL DO CLIENTE.
 *
 * Instância própria do Auth.js, separada da instância da equipe (`src/auth.ts`):
 * base path próprio e, principalmente, cookie próprio. O cookie de sessão que
 * ela emite é exatamente o do portal (`clientSessionCookieName`), com o mesmo
 * segredo e o mesmo salt de `client-session-token.ts` — ou seja, entrar pelo
 * Google produz a MESMA sessão de cliente que entrar por e-mail/senha, lida
 * pelo mesmo `getClientSession()`. Nenhum papel interno é concedido aqui.
 *
 * Credenciais vêm só do ambiente: AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET / AUTH_SECRET.
 */
export const PORTAL_AUTH_BASE_PATH = "/api/cliente/auth";
export const PORTAL_LOGIN_PATH = "/cliente";
export const PORTAL_HOME_PATH = "/cliente/painel";

const resolveAccount = new ResolveOAuthClientAccount(
  new PrismaClientRepository(),
  new PrismaClientOAuthAccountRepository(),
  new PrismaUserRepository(),
);

const secureCookies = isSecureClientCookie();

export const { handlers, signIn } = NextAuth({
  basePath: PORTAL_AUTH_BASE_PATH,
  trustHost: true,
  useSecureCookies: secureCookies,
  pages: { signIn: PORTAL_LOGIN_PATH, error: PORTAL_LOGIN_PATH },
  session: { strategy: "jwt", maxAge: CLIENT_SESSION_MAX_AGE_SECONDS },
  cookies: {
    sessionToken: {
      name: clientSessionCookieName(secureCookies),
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: secureCookies,
      },
    },
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: { params: { prompt: "select_account" } },
    }),
  ],
  callbacks: {
    /**
     * Decide QUEM está entrando. Devolver uma string aborta o login do Auth.js
     * e redireciona — nenhum cookie de sessão é emitido no caminho de erro.
     */
    async signIn({ user, account, profile }) {
      if (account?.provider !== GOOGLE_PROVIDER) {
        return `${PORTAL_LOGIN_PATH}?erro=falha`;
      }

      try {
        const resolved = await resolveAccount.execute({
          provider: GOOGLE_PROVIDER,
          providerAccountId: account.providerAccountId,
          email: profile?.email ?? "",
          emailVerified: profile?.email_verified === true,
          name: profile?.name ?? null,
        });

        // O objeto `user` segue para o callback `jwt`; aqui ele passa a ser o
        // Client resolvido, não o perfil bruto do Google.
        user.id = resolved.id;
        user.name = resolved.name;
        user.email = resolved.email;
        user.initials = resolved.initials;
        return true;
      } catch (error) {
        const code = error instanceof PortalOAuthError ? error.code : "falha";
        if (!(error instanceof PortalOAuthError)) {
          console.error("[portal][google] falha ao resolver conta", error);
        }
        return `${PORTAL_LOGIN_PATH}?erro=${code}`;
      }
    },

    /** Emite exatamente o payload que `decodeClientSessionToken` espera. */
    async jwt({ token, user }) {
      if (!user?.id) {
        return token;
      }

      const session: ClientSession = {
        clientId: user.id,
        name: user.name ?? "",
        email: user.email ?? "",
        initials: user.initials ?? "",
      };

      return { ...session, sub: session.clientId };
    },
  },
});
