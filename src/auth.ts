import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";

/**
 * Sessão JWT via Auth.js. O login com senha autentica no Server Action
 * (AuthenticateUser → repositório) e grava o cookie em createAuthSession.
 * O provider Credentials existe só para o Auth.js tipar a estratégia; não
 * autentica via /api/auth.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize() {
        return null;
      },
    }),
  ],
});
