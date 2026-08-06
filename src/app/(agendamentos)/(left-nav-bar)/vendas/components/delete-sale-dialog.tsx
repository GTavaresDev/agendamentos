"use client";

import { FormEvent, useState } from "react";
import { useScrollLock } from "@/lib/use-scroll-lock";
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
import { FieldLabel } from "./sales";

export function DeleteSaleDialog({
  saleId,
  onClose,
  showToast,
  onDeleteSale,
}: {
  saleId: string | null;
  onClose: () => void;
  showToast: (message: string) => void;
  onDeleteSale: (id: string, password: string) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");

  useScrollLock(!!saleId);

  function handleClose() {
    onClose();
    setAdminPassword("");
  }

  async function handleDelete(id: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));

    try {
      await onDeleteSale(id, password);
      onClose();
      setAdminPassword("");
      showToast("Venda excluída.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao excluir.";
      showToast(message);
    } finally {
      setLoading(false);
    }
  }

  if (!saleId) return null;

  return (
    <div
      className="fixed inset-0 lg:left-[256px] z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && handleClose()}
    >
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardTitle>Excluir Venda</CardTitle>
            <CardDescription>
              Esta ação é irreversível. O estoque será restaurado.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="-mr-2 -mt-2"
            onClick={handleClose}
          >
            <X />
          </Button>
        </CardHeader>
        <form onSubmit={(e) => handleDelete(saleId, e)}>
          <CardContent className="space-y-4">
            <div>
              <FieldLabel>Senha do Administrador</FieldLabel>
              <Input
                required
                type="password"
                name="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Excluindo..." : "Excluir Venda"}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
