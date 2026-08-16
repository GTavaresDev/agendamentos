"use client";

import { useEffect, useState } from "react";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button.component";
import { Input } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/input.component";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/card.component";
import { ServiceProps } from "@core/domain/services/service.entity";
import { X } from "lucide-react";

interface ServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Omit<ServiceProps, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  initialData?: ServiceProps | null;
  loading?: boolean;
}

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600">{children}</label>
);

export function ServiceModal({
  open,
  onOpenChange,
  onSave,
  initialData,
  loading,
}: ServiceModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("60");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("Ativo");
  const [color, setColor] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || "");
      setDuration(String(initialData.duration));
      setPrice(initialData.price ? String(initialData.price) : "");
      setStatus(initialData.status || "Ativo");
      setColor(initialData.color || "");
    } else {
      resetForm();
    }
    setError("");
  }, [initialData, open]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setDuration("60");
    setPrice("");
    setStatus("Ativo");
    setColor("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Nome do serviço é obrigatório");
      return;
    }

    if (!duration || parseInt(duration) <= 0) {
      setError("Duração deve ser maior que zero");
      return;
    }

    if (price && isNaN(parseFloat(price))) {
      setError("Preço deve ser um número válido");
      return;
    }

    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || undefined,
        duration: parseInt(duration),
        price: price ? parseFloat(price) : undefined,
        status: status as "Ativo" | "Inativo",
        color: color || undefined,
      });
      resetForm();
    } catch {
      // Error is handled by the parent component
    }
  };

  if (!open) return null;

  const isEditing = !!initialData;

  return (
    <div
      className="fixed inset-0 lg:left-[256px] z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onOpenChange(false)}
    >
      <Card className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden shadow-2xl">
        <CardHeader className="flex-row shrink-0 items-start justify-between">
          <div>
            <CardTitle>{isEditing ? "Editar serviço" : "Adicionar serviço"}</CardTitle>
            <CardDescription>
              {isEditing
                ? "Atualize as informações do serviço cadastrado no banco."
                : "Cadastre um novo serviço para utilização nos agendamentos."}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="-mr-2 -mt-2"
            onClick={() => {
              onOpenChange(false);
              resetForm();
            }}
          >
            <X />
          </Button>
        </CardHeader>
        <form onSubmit={handleSubmit} className="thin-scrollbar min-h-0 flex-1 overflow-y-auto">
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <FieldLabel>Nome do Serviço</FieldLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Consulta inicial"
                disabled={loading}
                required
              />
            </div>

            <div>
              <FieldLabel>Descrição</FieldLabel>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição do serviço"
                disabled={loading}
                rows={3}
                className="w-full h-auto px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Duração (minutos)</FieldLabel>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  min="1"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <FieldLabel>Preço (R$)</FieldLabel>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Status</FieldLabel>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={loading}
                  className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 outline-none"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>

              <div>
                <FieldLabel>Cor</FieldLabel>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    disabled={loading}
                    className="h-10 w-12 p-1"
                  />
                  <Input
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="#000000"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : isEditing ? "Atualizar serviço" : "Adicionar serviço"}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
