"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button";
import { FieldLabel } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/field-label";
import { Input } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/input";
import { formatPhoneBR } from "@/lib/input-masks";
import { registerClientAction } from "../_actions/portal-auth-actions";

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    passwordConfirmation: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const result = await registerClientAction(form);
    if (!result.success) {
      setError(result.error || "Não foi possível criar sua conta.");
      setLoading(false);
      return;
    }

    router.replace("/cliente");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <FieldLabel>Nome completo</FieldLabel>
        <Input
          value={form.name}
          onChange={(event) => update("name", event.target.value)}
          placeholder="Maria Souza"
          autoComplete="name"
          required
        />
      </div>

      <div>
        <FieldLabel>E-mail</FieldLabel>
        <Input
          type="email"
          value={form.email}
          onChange={(event) => update("email", event.target.value)}
          placeholder="seuemail@exemplo.com"
          autoComplete="email"
          inputMode="email"
          required
        />
      </div>

      <div>
        <FieldLabel>Telefone</FieldLabel>
        <Input
          value={form.phone}
          onChange={(event) => update("phone", formatPhoneBR(event.target.value))}
          placeholder="(11) 99999-0000"
          autoComplete="tel"
          inputMode="tel"
          required
        />
      </div>

      <div>
        <FieldLabel>Senha</FieldLabel>
        <Input
          type="password"
          value={form.password}
          onChange={(event) => update("password", event.target.value)}
          placeholder="Mínimo de 8 caracteres"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      <div>
        <FieldLabel>Confirmar senha</FieldLabel>
        <Input
          type="password"
          value={form.passwordConfirmation}
          onChange={(event) => update("passwordConfirmation", event.target.value)}
          placeholder="Repita a senha"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      {error ? (
        <p className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <Button className="w-full" size="lg" type="submit" disabled={loading}>
        {loading ? "Criando conta..." : "Criar conta"} {!loading && <ArrowRight />}
      </Button>
    </form>
  );
}
