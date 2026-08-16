"use client";

import { FormEvent, useState } from "react";
import { KeyRound, X } from "lucide-react";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button.component";
import { FieldLabel } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/field-label.component";
import { Input } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/input.component";
import { setClientPasswordAction } from "../_actions/portal-auth-actions";
import { dismissPasswordNudge } from "./password-nudge";

/**
 * Convite flutuante para quem ainda não tem senha (entrou pelo Google ou foi
 * cadastrado pela clínica). Fica no canto inferior direito, acima da barra de
 * navegação no mobile e afastado da borda no desktop.
 *
 * Quem decide montar este componente é a página (servidor, lendo o cookie de
 * dispensa) — aqui o estado local só serve para sumir na hora do clique, sem
 * esperar recarga. Ao entrar de novo sem senha, o convite volta.
 */
export function SetPasswordCard() {
  const [dismissed, setDismissed] = useState(false);
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const result = await setClientPasswordAction({ password, passwordConfirmation });
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Não foi possível definir sua senha.");
      return;
    }

    setDone(true);
  }

  function dismiss() {
    setDismissed(true);
    dismissPasswordNudge();
  }

  if (dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 z-30 sm:left-auto sm:w-[340px] lg:bottom-6 lg:right-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-lg shadow-zinc-950/5">
        {done ? (
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
              <KeyRound className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-zinc-950">Senha definida</p>
              <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
                Agora você entra pelo Google ou por e-mail.
              </p>
            </div>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Fechar"
              className="-mr-1 -mt-1 rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-950"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
                <KeyRound className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-950">Criar uma senha</p>
                <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
                  Entre também por e-mail, sem depender do Google.
                </p>
              </div>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Dispensar"
                className="-mr-1 -mt-1 rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-950"
              >
                <X className="size-4" />
              </button>
            </div>

            {open ? (
              <form onSubmit={submit} className="mt-4 space-y-3">
                <div>
                  <FieldLabel>Nova senha</FieldLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
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
                    value={passwordConfirmation}
                    onChange={(event) => setPasswordConfirmation(event.target.value)}
                    placeholder="Repita a senha"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </div>

                {error ? (
                  <p className="text-xs font-medium text-red-600" role="alert">
                    {error}
                  </p>
                ) : null}

                <div className="flex gap-2 pt-1">
                  <Button type="submit" size="sm" className="flex-1" disabled={loading}>
                    {loading ? "Salvando..." : "Salvar senha"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setOpen(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 w-full"
                onClick={() => setOpen(true)}
              >
                Definir senha
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
