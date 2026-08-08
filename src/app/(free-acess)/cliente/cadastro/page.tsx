import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "../../_components/auth-shell";
import { GoogleSignIn } from "../../_components/google-sign-in";
import { RegisterForm } from "../../_components/register-form";

export const metadata: Metadata = {
  title: "Criar conta",
};

export default function ClientSignUpPage() {
  return (
    <AuthShell
      title="Criar sua conta"
      subtitle="Leva menos de um minuto. Depois é só escolher o horário."
      footer={
        <p>
          Já tem conta?{" "}
          <Link href="/cliente" className="font-semibold text-zinc-950 hover:underline">
            Entrar
          </Link>
        </p>
      }
    >
      <RegisterForm />
      <GoogleSignIn label="Cadastrar com Google" />
    </AuthShell>
  );
}
