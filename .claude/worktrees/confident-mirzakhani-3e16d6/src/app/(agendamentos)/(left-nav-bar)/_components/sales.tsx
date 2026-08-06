"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useScrollLock } from "@/lib/use-scroll-lock";
import {
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Avatar } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/avatar";
import { Badge } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/badge";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/card";
import { Input } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/input";
import { ListPagination } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/list-pagination";
import { cn } from "@/lib/utils";
import { paginateItems, TABLE_BODY_MIN_HEIGHT_CLASS, TABLE_ROW_MIN_HEIGHT_CLASS } from "@/lib/pagination";
import { ProductProps } from "@core/domain/products/Product";
import { SaleProps } from "@core/domain/sales/Sale";

const PAYMENT_METHODS = ["Pix", "Dinheiro", "Crédito", "Débito", "Transferência"] as const;

function FieldLabel({ children }: { children: string }) {
  return <label className="block text-xs font-semibold text-zinc-700 mb-2">{children}</label>;
}

type ExtendedSale = SaleProps & { formattedTotal: string; formattedUnitPrice: string; productName?: string };

export function Sales({
  showToast,
  saleList,
  productList,
  onAddSale,
  onUpdateSale,
  onDeleteSale,
}: {
  showToast: (message: string) => void;
  saleList: ExtendedSale[];
  productList: (ProductProps & { formattedPrice?: string })[];
  onAddSale: (sale: {
    productId: string;
    quantity: number;
    unitPrice: number;
    paymentMethod: "Pix" | "Dinheiro" | "Crédito" | "Débito" | "Transferência";
  }) => Promise<void>;
  onUpdateSale: (id: string, sale: {
    quantity?: number;
    unitPrice?: number;
    paymentMethod?: "Pix" | "Dinheiro" | "Crédito" | "Débito" | "Transferência";
  }, password: string) => Promise<void>;
  onDeleteSale: (id: string, password: string) => Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("Todos");
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [formQuantity, setFormQuantity] = useState("");
  const [editFormQuantity, setEditFormQuantity] = useState("");
  const [editFormUnitPrice, setEditFormUnitPrice] = useState("");

  useScrollLock(modal || !!editModal || !!deleteModal);

  const filtered = useMemo(() => {
    return saleList.filter((sale) => {
      const term = search.toLowerCase();
      const matchSearch =
        (sale.productName?.toLowerCase().includes(term) ?? false) ||
        sale.id.toLowerCase().includes(term);
      const matchPayment = paymentFilter === "Todos" || sale.paymentMethod === paymentFilter;
      return matchSearch && matchPayment;
    });
  }, [saleList, search, paymentFilter]);

  const pagedSales = useMemo(
    () => paginateItems(filtered, page),
    [filtered, page],
  );

  const filteredProducts = useMemo(() => {
    if (!productSearchTerm) return productList.filter((p) => p.status === "Ativo");
    const term = productSearchTerm.toLowerCase();
    return productList.filter(
      (p) => p.status === "Ativo" && (p.name.toLowerCase().includes(term) || p.id.toLowerCase().includes(term))
    );
  }, [productSearchTerm, productList]);

  const selectedProduct = useMemo(
    () => productList.find((p) => p.id === selectedProductId),
    [selectedProductId, productList]
  );

  const totalSale = useMemo(() => {
    if (!selectedProduct || !formQuantity) return 0;
    const quantity = Number(formQuantity);
    return selectedProduct.price * quantity;
  }, [selectedProduct, formQuantity]);

  const editSale = useMemo(() => {
    return editModal ? saleList.find((s) => s.id === editModal) : null;
  }, [editModal, saleList]);

  const editProduct = useMemo(() => {
    return editSale ? productList.find((p) => p.id === editSale.productId) : null;
  }, [editSale, productList]);

  const editTotalSale = useMemo(() => {
    if (!editFormQuantity || !editFormUnitPrice) return 0;
    const quantity = Number(editFormQuantity);
    const unitPrice = Number(editFormUnitPrice);
    return quantity * unitPrice;
  }, [editFormQuantity, editFormUnitPrice]);

  useEffect(() => {
    setPage(1);
  }, [search, paymentFilter]);

  async function addSale(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const quantity = Number(form.get("quantity"));
    const paymentMethod = String(form.get("paymentMethod")) as "Pix" | "Dinheiro" | "Crédito" | "Débito" | "Transferência";

    try {
      if (!selectedProductId) {
        throw new Error("Selecione um produto.");
      }
      if (!selectedProduct) {
        throw new Error("Produto não encontrado.");
      }
      if (quantity <= 0 || quantity > selectedProduct.quantity) {
        throw new Error(`Quantidade inválida. Disponível: ${selectedProduct.quantity}`);
      }

      await onAddSale({
        productId: selectedProductId,
        quantity,
        unitPrice: selectedProduct.price,
        paymentMethod,
      });

      // Reset form before closing modal to avoid null reference
      if (event.currentTarget) {
        event.currentTarget.reset();
      }

      setModal(false);
      setSelectedProductId("");
      setProductSearchTerm("");
      setShowProductSearch(false);
      setFormQuantity("");
      showToast("Venda registrada com sucesso.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao registrar venda.";
      showToast(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(saleId: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const quantity = editFormQuantity ? Number(editFormQuantity) : Number(form.get("quantity"));
    const unitPrice = editFormUnitPrice ? Number(editFormUnitPrice) : Number(form.get("unitPrice"));
    const paymentMethod = String(form.get("paymentMethod")) as "Pix" | "Dinheiro" | "Crédito" | "Débito" | "Transferência";
    const password = String(form.get("password"));

    try {
      if (quantity <= 0) {
        throw new Error("Quantidade deve ser maior que zero.");
      }
      if (unitPrice <= 0) {
        throw new Error("Preço unitário deve ser maior que zero.");
      }

      await onUpdateSale(saleId, { quantity, unitPrice, paymentMethod }, password);
      setEditModal(null);
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

  async function handleDelete(saleId: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));

    try {
      await onDeleteSale(saleId, password);
      setDeleteModal(null);
      setAdminPassword("");
      showToast("Venda excluída.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao excluir.";
      showToast(message);
    } finally {
      setLoading(false);
    }
  }

  const totalSales = useMemo(() => {
    return filtered.reduce((sum, sale) => sum + sale.totalPrice, 0);
  }, [filtered]);

  return (
    <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-zinc-950">
            Caixa (Vendas)
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Registre vendas e gerencie o estoque em tempo real.
          </p>
        </div>
        <Button onClick={() => setModal(true)}>
          <Plus /> Nova Venda
        </Button>
      </div>

      <div className="mb-6 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Total (período)</div>
          <div className="mt-2 text-2xl font-bold text-zinc-900">
            {totalSales.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Vendas</div>
          <div className="mt-2 text-2xl font-bold text-zinc-900">{filtered.length}</div>
        </Card>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por produto ou ID..."
            className="pl-9"
          />
        </div>
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 outline-none"
        >
          <option value="Todos">Método: Todos</option>
          {PAYMENT_METHODS.map((method) => (
            <option key={method} value={method}>{method}</option>
          ))}
        </select>
      </div>

      <Card className="overflow-hidden">
        <div className="hidden h-11 grid-cols-[1fr_.8fr_.8fr_.8fr_.9fr_36px] items-center gap-4 border-b border-zinc-200 bg-zinc-50/70 px-5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 lg:grid">
          <span>Produto</span>
          <span>Quantidade</span>
          <span>Unitário</span>
          <span>Total</span>
          <span>Método</span>
          <span />
        </div>
        <div className={cn("divide-y divide-zinc-100", TABLE_BODY_MIN_HEIGHT_CLASS)}>
          {pagedSales.map((sale) => (
            <div
              key={sale.id}
              className={cn(
                "grid gap-4 p-5 transition hover:bg-zinc-50 lg:grid-cols-[1fr_.8fr_.8fr_.8fr_.9fr_36px] lg:items-center",
                TABLE_ROW_MIN_HEIGHT_CLASS,
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 ring-1 ring-inset ring-zinc-200 text-xs font-bold">
                  {sale.productName?.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-900">
                    {sale.productName || "Produto"}
                  </p>
                  <p className="text-xs text-zinc-500">{new Date(sale.createdAt || 0).toLocaleDateString("pt-BR")}</p>
                </div>
              </div>
              <div className="text-sm font-semibold text-zinc-900">
                {sale.quantity} {sale.quantity === 1 ? "un." : "uns."}
              </div>
              <div className="text-sm font-semibold text-zinc-900">
                {sale.formattedUnitPrice}
              </div>
              <div className="text-sm font-bold text-green-600">
                {sale.formattedTotal}
              </div>
              <div>
                <Badge variant="outline">
                  {sale.paymentMethod}
                </Badge>
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenMenuId(openMenuId === sale.id ? null : sale.id)
                  }
                  className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-black"
                >
                  <MoreVertical className="size-4" />
                </button>
                {openMenuId === sale.id && (
                  <div className="absolute right-0 top-10 z-50 w-48 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setEditModal(sale.id);
                        setOpenMenuId(null);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
                    >
                      <Pencil className="size-4 shrink-0 text-zinc-500" /> Editar
                    </button>
                    <div className="my-1 h-px bg-zinc-100" />
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteModal(sale.id);
                        setOpenMenuId(null);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="size-4 shrink-0 text-red-500" /> Excluir
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-5 py-12 text-center">
              <p className="text-sm font-medium text-zinc-700">
                Nenhuma venda registrada
              </p>
            </div>
          )}
        </div>
        <ListPagination
          page={page}
          totalItems={filtered.length}
          onPageChange={setPage}
          label="vendas"
        />
      </Card>

      {modal && (
        <div
          className="fixed inset-0 lg:left-[256px] z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onMouseDown={(e) => e.target === e.currentTarget && setModal(false)}
        >
          <Card className="max-h-[90vh] w-full max-w-lg overflow-y-auto shadow-2xl">
            <CardHeader className="flex-row items-start justify-between">
              <div>
                <CardTitle>Registrar Venda</CardTitle>
                <CardDescription>
                  Venda de produto com atualização automática de estoque.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="-mr-2 -mt-2"
                onClick={() => setModal(false)}
              >
                <X />
              </Button>
            </CardHeader>
            <form onSubmit={addSale}>
              <CardContent className="space-y-4">
                <div>
                  <FieldLabel>Produto</FieldLabel>
                  <div className="relative">
                    <Input
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
                      onFocus={() => setShowProductSearch(true)}
                      placeholder="Buscar por nome ou código..."
                      className="pr-9"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                    {showProductSearch && filteredProducts.length > 0 && (
                      <div className="absolute top-11 left-0 right-0 z-50 rounded-lg border border-zinc-200 bg-white shadow-lg max-h-48 overflow-y-auto">
                        {filteredProducts.map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => {
                              setSelectedProductId(product.id);
                              setProductSearchTerm("");
                              setShowProductSearch(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-zinc-50 border-b last:border-b-0 text-sm"
                          >
                            <div className="font-medium text-zinc-900">{product.name}</div>
                            <div className="text-xs text-zinc-500">
                              {product.quantity} em estoque • {product.category}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {selectedProduct && (
                  <Card className="bg-blue-50 border-blue-200 p-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-zinc-600 text-xs">Produto</span>
                        <p className="font-semibold text-zinc-900">{selectedProduct.name}</p>
                      </div>
                      <div>
                        <span className="text-zinc-600 text-xs">Categoria</span>
                        <p className="font-semibold text-zinc-900">{selectedProduct.category}</p>
                      </div>
                      <div>
                        <span className="text-zinc-600 text-xs">Preço</span>
                        <p className="font-semibold text-green-600">
                          {typeof selectedProduct.price === "number"
                            ? selectedProduct.price.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })
                            : selectedProduct.price}
                        </p>
                      </div>
                      <div>
                        <span className="text-zinc-600 text-xs">Em estoque</span>
                        <p className="font-semibold text-zinc-900">{selectedProduct.quantity}</p>
                      </div>
                    </div>
                  </Card>
                )}

                <div>
                  <FieldLabel>Quantidade</FieldLabel>
                  <Input
                    required
                    type="number"
                    name="quantity"
                    min="1"
                    max={selectedProduct?.quantity || 0}
                    placeholder="1"
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(e.target.value)}
                  />
                </div>

                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <div className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-2">Total da Venda</div>
                  <div className="text-3xl font-bold text-green-600">
                    {totalSale.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </div>
                </div>

                <div>
                  <FieldLabel>Método de Pagamento</FieldLabel>
                  <select
                    name="paymentMethod"
                    defaultValue="Dinheiro"
                    className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none"
                  >
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading || !selectedProduct}>
                    {loading ? "Registrando..." : "Registrar Venda"}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {editModal && (
        <div
          className="fixed inset-0 lg:left-[256px] z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setEditModal(null);
              setAdminPassword("");
              setEditFormQuantity("");
              setEditFormUnitPrice("");
            }
          }}
        >
          <Card className="max-h-[90vh] w-full max-w-lg overflow-y-auto shadow-2xl">
            <CardHeader className="flex-row items-start justify-between">
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
                onClick={() => {
                  setEditModal(null);
                  setAdminPassword("");
                  setEditFormQuantity("");
                  setEditFormUnitPrice("");
                }}
              >
                <X />
              </Button>
            </CardHeader>
            {editModal && editSale && editProduct && (
              <form onSubmit={(e) => handleEdit(editModal, e)}>
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
                      onClick={() => {
                        setEditModal(null);
                        setAdminPassword("");
                        setEditFormQuantity("");
                        setEditFormUnitPrice("");
                      }}
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
      )}

      {deleteModal && (
        <div
          className="fixed inset-0 lg:left-[256px] z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onMouseDown={(e) => e.target === e.currentTarget && setDeleteModal(null)}
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
                onClick={() => {
                  setDeleteModal(null);
                  setAdminPassword("");
                }}
              >
                <X />
              </Button>
            </CardHeader>
            {deleteModal && (
              <form onSubmit={(e) => handleDelete(deleteModal, e)}>
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
                      onClick={() => {
                        setDeleteModal(null);
                        setAdminPassword("");
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Excluindo..." : "Excluir Venda"}
                    </Button>
                  </div>
                </CardContent>
              </form>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
