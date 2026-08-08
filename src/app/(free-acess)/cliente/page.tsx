import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "../_components/auth-shell";
import { GoogleSignIn } from "../_components/google-sign-in";
import { LoginForm } from "../_components/login-form";
import { portalOAuthErrorMessage } from "../_components/portal-oauth-error";

export const metadata: Metadata = {
  title: "Entrar",
};

export default async function ClientLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;
  const oauthError = erro ? portalOAuthErrorMessage(erro) : null;

  return (
    <AuthShell
      title="Acesse sua conta"
      subtitle="Entre para agendar e acompanhar seus atendimentos."
      footer={
        <>
          <p>
            Não tem uma conta?{" "}
            <Link href="/cliente/cadastro" className="font-semibold text-zinc-950 hover:underline">
              Criar conta
            </Link>
          </p>
          <p className="mt-2">
            <Link
              href="/cliente/recuperar-senha"
              className="font-medium text-zinc-600 hover:underline"
            >
              Esqueci minha senha
            </Link>
          </p>
        </>
      }
    >
      {oauthError ? (
        <p
          role="alert"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {oauthError}
        </p>
      ) : null}

      <LoginForm />
      <GoogleSignIn />
    </AuthShell>
  );
}
