"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button";
import { FieldLabel } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/field-label";
import { Input } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/input";
import { requestClientPasswordResetAction } from "../_actions/portal-auth-actions";

export function PasswordResetForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const result = await requestClientPasswordResetAction({ email });
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Informe um e-mail válido.");
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <p className="text-sm font-medium text-zinc-950">Solicitação registrada</p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
          Se este e-mail estiver cadastrado, você receberá as instruções para redefinir
          a senha. Se precisar de ajuda, entre em contato com a clínica.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <FieldLabel>E-mail cadastrado</FieldLabel>
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="seuemail@exemplo.com"
          autoComplete="email"
          inputMode="email"
          required
        />
      </div>

      {error ? (
        <p className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <Button className="w-full" size="lg" type="submit" disabled={loading}>
        {loading ? "Enviando..." : "Enviar instruções"}
      </Button>
    </form>
  );
}
