"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/badge.component";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button.component";
import { Input } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/input.component";
import { FieldLabel } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/field-label.component";
import { loginAction } from "@/app/(agendamentos)/(left-nav-bar)/_actions/auth-actions";
import { AgendamentosLogo } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/agendamentos-logo.component";

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await loginAction({ email, password });
      if (!result.success) {
        setError(result.error || "Credenciais inválidas");
        setLoading(false);
        return;
      }
      onLogin();
    } catch {
      setError("Credenciais inválidas");
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1.02fr_.98fr]">
      <section className="relative hidden overflow-hidden bg-zinc-950 px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="absolute -right-32 top-36 size-96 rounded-full border border-white/10" />
        <div className="absolute -right-16 top-52 size-64 rounded-full border border-white/10" />
        <div className="absolute left-12 top-10 z-20">
          <AgendamentosLogo variant="dark" size="lg" />
        </div>
        <div className="relative z-10 w-full max-w-xl pt-[136px]">
          <Badge
            className="mb-6 border-white/15 bg-white/10 text-white"
            variant="outline"
          >
            <Sparkles className="mr-1.5 size-3" /> Seu tempo, bem organizado
          </Badge>
          <h1 className="text-balance text-5xl font-semibold leading-[1.08] tracking-[-0.04em] xl:text-6xl">
            Agendamentos simples. Rotina mais leve.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-zinc-400">
            Centralize sua agenda, seus clientes e o dia a dia do negócio em um
            único lugar.
          </p>
        </div>
        <div className="relative flex items-center gap-3 text-sm text-zinc-500">
          <span>Organizando o caos da rotina de agendamentos</span>
        </div>
      </section>

      <section className="flex min-h-screen items-start justify-center bg-zinc-50 px-6 py-10 sm:px-10 pt-36">
        <div className="w-full max-w-[430px]">
          <div className="mb-10 lg:hidden">
            <AgendamentosLogo variant="light" size="md" />
          </div>
          <div className="mb-8">
            <p className="mb-3 text-sm font-medium text-zinc-500">
              Bem-vindo de volta
            </p>
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-zinc-950">
              Acesse sua conta
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Entre para acompanhar seus agendamentos.
            </p>
          </div>
          <form onSubmit={submit} className="space-y-5">
            <div>
              <FieldLabel>E-mail ou Usuário</FieldLabel>
              <Input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin ou seuemail@exemplo.com"
                aria-label="E-mail ou Usuário"
                autoComplete="username"
                required
              />
            </div>
            <div>
              <FieldLabel>Senha</FieldLabel>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="pr-16"
                  aria-label="Senha"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
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
            <Button
              className="w-full"
              size="lg"
              type="submit"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"} {!loading && <ArrowRight />}
            </Button>
          </form>
          <p className="mt-8 text-center text-sm text-zinc-500">
            <span>Não tem uma conta? </span>
            <button type="button" className="font-semibold text-zinc-950 hover:underline">
              Fale com a gente
            </button>
          </p>
          <p className="mt-20 text-center text-xs text-zinc-400">
            <span>&copy; 2026 Agendamentos. Todos os direitos reservados.</span>
            <span className="mt-1 block text-zinc-400">
              Desenvolvido por: Gabriel Tavares dos Santos
            </span>
          </p>
        </div>
      </section>
    </main>
  );
}
