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
import { FieldLabel } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/field-label";
import { Input } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/input";

export function CreateProductDialog({
  open,
  onClose,
  showToast,
  onAddProduct,
}: {
  open: boolean;
  onClose: () => void;
  showToast: (message: string) => void;
  onAddProduct: (prod: {
    name: string;
    category: string;
    price: number;
    quantity: number;
    status?: "Ativo" | "Inativo" | "Baixo estoque";
  }) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function addProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name"));
    const category = String(form.get("category"));
    const quantity = Number(form.get("quantity"));
    const price = Number(form.get("price"));
    const selectedStatus = String(form.get("status")) as "Ativo" | "Inativo" | "Baixo estoque";

    try {
      await onAddProduct({ name, category, price, quantity, status: selectedStatus });
      onClose();
      showToast("Novo produto adicionado com sucesso e salvo no banco");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao adicionar produto";
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
      <Card className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden shadow-2xl">
        <CardHeader className="flex-row shrink-0 items-start justify-between">
          <div>
            <CardTitle>Adicionar produto</CardTitle>
            <CardDescription>
              Cadastre um novo item no PostgreSQL.
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
        <form onSubmit={addProduct} className="thin-scrollbar min-h-0 flex-1 overflow-y-auto">
          <CardContent className="space-y-4">
            <div>
              <FieldLabel>Nome do produto</FieldLabel>
              <Input
                required
                name="name"
                placeholder="Ex.: Sérum facial vitamina C"
              />
            </div>
            <div>
              <FieldLabel>Categoria</FieldLabel>
              <select
                name="category"
                className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none"
              >
                <option>Skincare</option>
                <option>Proteção solar</option>
                <option>Corporal</option>
                <option>Higiene</option>
                <option>Kits</option>
                <option>Outros</option>
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>Preço (R$)</FieldLabel>
                <Input
                  required
                  min="0"
                  step="0.01"
                  type="number"
                  name="price"
                  placeholder="129.90"
                />
              </div>
              <div>
                <FieldLabel>Quantidade</FieldLabel>
                <Input
                  required
                  min="0"
                  step="1"
                  type="number"
                  name="quantity"
                  placeholder="10"
                />
              </div>
            </div>
            <div>
              <FieldLabel>Status</FieldLabel>
              <select
                name="status"
                className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none"
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Adicionar produto"}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
