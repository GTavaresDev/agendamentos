"use client";

import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/card";
import { Input } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/input";
import { FieldLabel } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/field-label";
import { formatCpf, formatPhoneBR } from "@/lib/input-masks";
import { CustomDatePicker } from "./custom-date-picker";

export function CreateClientDialog({
  onClose,
  onAddClient,
  showToast,
}: {
  onClose: () => void;
  onAddClient: (client: {
    name: string;
    email: string;
    phone: string;
    cpf?: string;
    birthDate?: string;
  }) => Promise<void>;
  showToast: (message: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [phoneValue, setPhoneValue] = useState("");
  const [cpfValue, setCpfValue] = useState("");
  const [birthDateValue, setBirthDateValue] = useState("");

  async function addClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name"));
    const email = String(form.get("email"));
    const phone = String(form.get("phone"));
    const cpf = String(form.get("cpf") || "");
    const birthDate = String(form.get("birthDate") || "");

    try {
      await onAddClient({ name, email, phone, cpf, birthDate });
      showToast("Novo cliente cadastrado com sucesso no PostgreSQL");
      onClose();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao cadastrar cliente";
      showToast(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 lg:left-[256px] z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <Card className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden shadow-2xl">
        <CardHeader className="flex-row shrink-0 items-start justify-between">
          <div>
            <CardTitle>Adicionar cliente</CardTitle>
            <CardDescription>
              Cadastre um novo cliente no PostgreSQL.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="-mr-2 -mt-2"
            onClick={onClose}
          >
            <X />
          </Button>
        </CardHeader>
        <form onSubmit={addClient} className="thin-scrollbar min-h-0 flex-1 overflow-y-auto">
          <CardContent className="space-y-4">
            <div>
              <FieldLabel>Nome completo</FieldLabel>
              <Input name="name" required placeholder="Ex.: Maria de Oliveira" />
            </div>
            <div>
              <FieldLabel>E-mail</FieldLabel>
              <Input name="email" required type="email" placeholder="maria@email.com" />
            </div>
            <div>
              <FieldLabel>Telefone / Contato</FieldLabel>
              <Input
                name="phone"
                required
                value={phoneValue}
                onChange={(event) => {
                  setPhoneValue(formatPhoneBR(event.target.value));
                }}
                inputMode="numeric"
                autoComplete="tel"
                placeholder="(62) 99427-9139"
                maxLength={15}
              />
            </div>
            <div>
              <FieldLabel>CPF</FieldLabel>
              <Input
                name="cpf"
                value={cpfValue}
                onChange={(event) => {
                  setCpfValue(formatCpf(event.target.value));
                }}
                inputMode="numeric"
                autoComplete="off"
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </div>
            <div>
              <FieldLabel>Data de Nascimento</FieldLabel>
              <CustomDatePicker
                name="birthDate"
                value={birthDateValue}
                onChange={setBirthDateValue}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando no banco..." : "Adicionar cliente"}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
