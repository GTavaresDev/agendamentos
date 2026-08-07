import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "../../_components/auth-shell";
import { LoginForm } from "../../_components/login-form";

export const metadata: Metadata = {
  title: "Entrar",
};

export default function ClientLoginPage() {
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
      <LoginForm />
    </AuthShell>
  );
}
