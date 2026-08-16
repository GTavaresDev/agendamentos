"use client";

import { FormEvent, useMemo, useState } from "react";
import { useScrollLock } from "@/lib/use-scroll-lock";
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
import { ProductProps } from "@core/domain/products/product.entity";
import { FieldLabel, PAYMENT_METHODS, type ExtendedSale, type PaymentMethod } from "./sales.component";

export function EditSaleDialog({
  saleId,
  onClose,
  saleList,
  productList,
  showToast,
  onUpdateSale,
}: {
  saleId: string | null;
  onClose: () => void;
  saleList: ExtendedSale[];
  productList: (ProductProps & { formattedPrice?: string })[];
  showToast: (message: string) => void;
  onUpdateSale: (
    id: string,
    sale: { quantity?: number; unitPrice?: number; paymentMethod?: PaymentMethod },
    password: string
  ) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [editFormQuantity, setEditFormQuantity] = useState("");
  const [editFormUnitPrice, setEditFormUnitPrice] = useState("");

  useScrollLock(!!saleId);

  const editSale = useMemo(() => {
    return saleId ? saleList.find((s) => s.id === saleId) : null;
  }, [saleId, saleList]);

  const editProduct = useMemo(() => {
    return editSale ? productList.find((p) => p.id === editSale.productId) : null;
  }, [editSale, productList]);

  const editTotalSale = useMemo(() => {
    if (!editFormQuantity || !editFormUnitPrice) return 0;
    const quantity = Number(editFormQuantity);
    const unitPrice = Number(editFormUnitPrice);
    return quantity * unitPrice;
  }, [editFormQuantity, editFormUnitPrice]);

  function handleClose() {
    onClose();
    setAdminPassword("");
    setEditFormQuantity("");
    setEditFormUnitPrice("");
  }

  async function handleEdit(id: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const quantity = editFormQuantity ? Number(editFormQuantity) : Number(form.get("quantity"));
    const unitPrice = editFormUnitPrice ? Number(editFormUnitPrice) : Number(form.get("unitPrice"));
    const paymentMethod = String(form.get("paymentMethod")) as PaymentMethod;
    const password = String(form.get("password"));

    try {
      if (quantity <= 0) {
        throw new Error("Quantidade deve ser maior que zero.");
      }
      if (unitPrice <= 0) {
        throw new Error("Preço unitário deve ser maior que zero.");
      }

      await onUpdateSale(id, { quantity, unitPrice, paymentMethod }, password);
      onClose();
      setAdminPassword("");
      setEditFormQuantity("");
      setEditFormUnitPrice("");
      showToast("Venda atualizada.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao atualizar.";
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
      <Card className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden shadow-2xl">
        <CardHeader className="flex-row shrink-0 items-start justify-between">
          <div>
            <CardTitle>Editar Venda</CardTitle>
            <CardDescription>
              Requer autenticação de administrador.
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
        {editSale && editProduct && (
          <form
            onSubmit={(e) => handleEdit(saleId, e)}
            className="thin-scrollbar min-h-0 flex-1 overflow-y-auto"
          >
            <CardContent className="space-y-4">
              {/* Product Card - Same as Register Modal */}
              <Card className="bg-blue-50 border-blue-200 p-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-zinc-600 text-xs">Produto</span>
                    <p className="font-semibold text-zinc-900">{editProduct.name}</p>
                  </div>
                  <div>
                    <span className="text-zinc-600 text-xs">Categoria</span>
                    <p className="font-semibold text-zinc-900">{editProduct.category}</p>
                  </div>
                  <div>
                    <span className="text-zinc-600 text-xs">Preço</span>
                    <p className="font-semibold text-green-600">
                      {typeof editProduct.price === "number"
                        ? editProduct.price.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })
                        : editProduct.price}
                    </p>
                  </div>
                  <div>
                    <span className="text-zinc-600 text-xs">Em estoque</span>
                    <p className="font-semibold text-zinc-900">{editProduct.quantity}</p>
                  </div>
                </div>
              </Card>

              {/* Quantity Input - Same as Register Modal */}
              <div>
                <FieldLabel>Quantidade</FieldLabel>
                <Input
                  type="number"
                  name="quantity"
                  min="1"
                  defaultValue={editSale.quantity}
                  value={editFormQuantity}
                  onChange={(e) => setEditFormQuantity(e.target.value)}
                />
              </div>

              {/* Unit Price Input - Kept for edit capability */}
              <div>
                <FieldLabel>Preço Unitário (R$)</FieldLabel>
                <Input
                  type="number"
                  name="unitPrice"
                  step="0.01"
                  min="0"
                  defaultValue={editSale.unitPrice}
                  value={editFormUnitPrice}
                  onChange={(e) => setEditFormUnitPrice(e.target.value)}
                />
              </div>

              {/* Total Sale - Same as Register Modal */}
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <div className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-2">Total da Venda</div>
                <div className="text-3xl font-bold text-green-600">
                  {editTotalSale.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </div>
              </div>

              {/* Payment Method - Same as Register Modal */}
              <div>
                <FieldLabel>Método de Pagamento</FieldLabel>
                <select
                  name="paymentMethod"
                  defaultValue={editSale.paymentMethod || "Dinheiro"}
                  className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              {/* Admin Password - Unique to Edit Modal */}
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

              {/* Action Buttons - Same Layout as Register Modal */}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Atualizando..." : "Atualizar Venda"}
                </Button>
              </div>
            </CardContent>
          </form>
        )}
      </Card>
    </div>
  );
}
