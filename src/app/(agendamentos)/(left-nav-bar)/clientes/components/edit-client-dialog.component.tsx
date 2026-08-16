"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button.component";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/card.component";
import { Input } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/input.component";
import { FieldLabel } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/field-label.component";
import { formatCpf, formatPhoneBR } from "@/lib/input-masks";
import { updateClientAction } from "@/app/(agendamentos)/(left-nav-bar)/_actions/client-actions";
import { ClientProps } from "@core/domain/clients/client.entity";
import { CustomDatePicker } from "./custom-date-picker.component";

export function EditClientDialog({
  client,
  onClose,
  onReplaceClient,
  showToast,
}: {
  client: ClientProps;
  onClose: () => void;
  onReplaceClient: (updated: ClientProps) => void;
  showToast: (message: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [phoneValue, setPhoneValue] = useState(client.phone || "");
  const [cpfValue, setCpfValue] = useState(client.cpf || "");
  const [birthDateValue, setBirthDateValue] = useState(client.birthDate || "");

  return (
    <div
      className="fixed inset-0 lg:left-[256px] z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <Card className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden shadow-2xl">
        <CardHeader className="flex-row shrink-0 items-start justify-between">
          <div>
            <CardTitle>Editar cliente</CardTitle>
            <CardDescription>
              Atualize as informações do cliente cadastrado no banco.
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
        <form
          className="thin-scrollbar min-h-0 flex-1 overflow-y-auto"
          onSubmit={async (event) => {
            event.preventDefault();
            setLoading(true);
            const form = new FormData(event.currentTarget);
            const name = String(form.get("name"));
            const email = String(form.get("email"));
            const phone = String(form.get("phone") || "");
            const cpf = String(form.get("cpf") || "");
            const status = String(form.get("status")) as "Ativo" | "Inativo";

            try {
              const res = await updateClientAction({
                id: client.id || "",
                name,
                email,
                phone,
                cpf,
                birthDate: birthDateValue || undefined,
                status,
              });

              if (res.success && res.data) {
                onReplaceClient(res.data);
                showToast(`Cliente ${name} atualizado com sucesso no banco!`);
                onClose();
              } else {
                showToast(res.error || "Erro ao atualizar cliente.");
              }
            } catch (error: unknown) {
              const message = error instanceof Error ? error.message : "Erro ao atualizar cliente.";
              showToast(message);
            } finally {
              setLoading(false);
            }
          }}
        >
          <CardContent className="space-y-4">
            <div>
              <FieldLabel>Nome completo</FieldLabel>
              <Input name="name" required defaultValue={client.name} />
            </div>
            <div>
              <FieldLabel>E-mail</FieldLabel>
              <Input name="email" required type="email" defaultValue={client.email} />
            </div>
            <div>
              <FieldLabel>Telefone</FieldLabel>
              <Input
                name="phone"
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
            <div>
              <FieldLabel>Status</FieldLabel>
              <select
                name="status"
                defaultValue={client.status}
                className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-800 outline-none"
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
