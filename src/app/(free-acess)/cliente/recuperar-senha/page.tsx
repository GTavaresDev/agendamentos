import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "../../_components/auth-shell";
import { PasswordResetForm } from "../../_components/password-reset-form";

export const metadata: Metadata = {
  title: "Recuperar senha",
};

export default function ClientPasswordResetPage() {
  return (
    <AuthShell
      title="Recuperar senha"
      subtitle="Informe o e-mail cadastrado para receber as instruções."
      footer={
        <p>
          Lembrou a senha?{" "}
          <Link href="/cliente" className="font-semibold text-zinc-950 hover:underline">
            Entrar
          </Link>
        </p>
      }
    >
      <PasswordResetForm />
    </AuthShell>
  );
}
