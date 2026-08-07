"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button";
import { FieldLabel } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/field-label";
import { Input } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/input";
import { loginClientAction } from "../_actions/portal-auth-actions";
import { resetPasswordNudge } from "./password-nudge";

export function LoginForm() {
  const router = useRouter();

  // Estar nesta tela significa que não há sessão: o próximo login recomeça do
  // zero, inclusive o convite de criar senha que tenha sido dispensado antes.
  useEffect(resetPasswordNudge, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const result = await loginClientAction({ email, password });
    if (!result.success) {
      setError(result.error || "E-mail ou senha inválidos.");
      setLoading(false);
      return;
    }

    router.replace("/cliente");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <FieldLabel>E-mail</FieldLabel>
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

      <div>
        <FieldLabel>Senha</FieldLabel>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Digite sua senha"
            className="pr-16"
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-500 hover:text-black"
          >
            {showPassword ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      </div>

      {error ? (
        <p className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <Button className="w-full" size="lg" type="submit" disabled={loading}>
        {loading ? "Entrando..." : "Entrar"} {!loading && <ArrowRight />}
      </Button>
    </form>
  );
}
