import type { Metadata } from "next";
import Link from "next/link";
import { getClientEmailByResetTokenAction } from "../../_actions/portal-auth-actions";
import { AuthShell } from "../../_components/auth-shell.component";
import { ResetPasswordForm } from "../../_components/reset-password-form.component";

export const metadata: Metadata = {
  title: "Redefinir senha",
};

export default async function ClientResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const email = token ? await getClientEmailByResetTokenAction(token) : null;

  if (!token || !email) {
    return (
      <AuthShell
        title="Link inválido"
        subtitle="Este link de redefinição não é mais válido."
        footer={
          <p>
            <Link href="/cliente/recuperar-senha" className="font-semibold text-zinc-950 hover:underline">
              Solicitar novo link
            </Link>
          </p>
        }
      >
        <p className="text-sm leading-relaxed text-zinc-500">
          Ele pode ter expirado (válido por 5 minutos) ou já ter sido usado. Peça a recuperação
          de senha novamente.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Redefinir senha" subtitle="Escolha uma nova senha para sua conta.">
      <ResetPasswordForm token={token} email={email} />
    </AuthShell>
  );
}
