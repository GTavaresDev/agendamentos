"use client";

import { useState } from "react";
import { ChevronDown, MoreVertical, Package, Pencil, Power, Trash2 } from "lucide-react";
import { Badge } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/badge.component";
import { Card, CardHeader, CardTitle } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/card.component";
import { ListPagination } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/list-pagination.component";
import { cn } from "@/lib/utils";
import { TABLE_BODY_MIN_HEIGHT_CLASS, TABLE_ROW_MIN_HEIGHT_CLASS } from "@/lib/pagination";
import { ProductProps } from "@core/domain/products/product.entity";

export function ProductsTable({
  products,
  totalItems,
  statusFilter = "Todos",
  onStatusFilterChange,
  categoryFilter = "Todas",
  onCategoryFilterChange,
  page,
  onPageChange,
  showToast,
  onUpdateProduct,
  onDeleteProduct,
}: {
  products: (ProductProps & { formattedPrice?: string })[];
  totalItems: number;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
  categoryFilter?: string;
  onCategoryFilterChange?: (cat: string) => void;
  page: number;
  onPageChange: (page: number) => void;
  showToast: (message: string) => void;
  onUpdateProduct: (id: string, status: "Ativo" | "Inativo" | "Baixo estoque") => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
}) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  return (
    <Card className="overflow-visible">
      <CardHeader className="border-b border-zinc-100 bg-zinc-50/70 p-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Package className="size-4" /> Catálogo de Produtos
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            {onStatusFilterChange && (
              <div className="relative shrink-0">
                <select
                  value={statusFilter}
                  onChange={(e) => onStatusFilterChange(e.target.value)}
                  className="h-8 max-w-[140px] truncate appearance-none rounded-lg border border-zinc-200 bg-white pl-2.5 pr-7 text-xs font-medium text-zinc-700 outline-none transition hover:border-zinc-300 focus:border-zinc-400"
                >
                  <option value="Todos">Status: Todos</option>
                  <option value="Ativo">Ativo</option>
                  <option value="Baixo estoque">Baixo estoque</option>
                  <option value="Inativo">Inativo</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
              </div>
            )}
            {onCategoryFilterChange && (
              <div className="relative shrink-0">
                <select
                  value={categoryFilter}
                  onChange={(e) => onCategoryFilterChange(e.target.value)}
                  className="h-8 max-w-[140px] truncate appearance-none rounded-lg border border-zinc-200 bg-white pl-2.5 pr-7 text-xs font-medium text-zinc-700 outline-none transition hover:border-zinc-300 focus:border-zinc-400"
                >
                  <option value="Todas">Categoria: Todas</option>
                  <option value="Skincare">Skincare</option>
                  <option value="Proteção solar">Proteção solar</option>
                  <option value="Corporal">Corporal</option>
                  <option value="Higiene">Higiene</option>
                  <option value="Kits">Kits</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
              </div>
            )}
            <Badge variant="outline" className="h-8 px-2.5 text-xs font-normal">
              {totalItems} {totalItems === 1 ? "produto" : "produtos"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <div className="hidden h-11 grid-cols-[1.6fr_1fr_.8fr_.65fr_.7fr_36px] items-center gap-4 border-b border-zinc-200 bg-zinc-50/70 px-5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 lg:grid">
        <span>Produto</span>
        <span>Categoria</span>
        <span>Preço</span>
        <span>Quantidade</span>
        <span>Status</span>
        <span />
      </div>
      <div className="overflow-y-auto divide-y divide-zinc-100">
        {products.map((product) => {
          const actionMenuNode = (
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenMenuId(openMenuId === product.id ? null : product.id)
                }
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-black transition-colors"
              >
                <MoreVertical className="size-4" />
              </button>
              {openMenuId === product.id && (
                <div className="absolute right-0 top-8 z-[60] w-48 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl">
                  <button
                    type="button"
                    onClick={() => {
                      showToast(`Editar produto: ${product.name}`);
                      setOpenMenuId(null);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
                  >
                    <Pencil className="size-4 shrink-0 text-zinc-500" /> Editar
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const newStatus = product.status === "Ativo" ? "Inativo" : "Ativo";
                      await onUpdateProduct(product.id, newStatus);
                      setOpenMenuId(null);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
                  >
                    <Power className="size-4 shrink-0 text-zinc-500" /> Status
                  </button>
                  <div className="my-1 h-px bg-zinc-100" />
                  <button
                    type="button"
                    onClick={async () => {
                      await onDeleteProduct(product.id);
                      showToast(`Produto ${product.name} excluído do banco`);
                      setOpenMenuId(null);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="size-4 shrink-0 text-red-500" /> Excluir
                  </button>
                </div>
              )}
            </div>
          );

          const formattedPrice = product.formattedPrice ||
            (typeof product.price === "number"
              ? product.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
              : "R$ 0,00");

          return (
            <div
              key={product.id || product.name}
              className="group relative flex flex-col gap-1.5 p-3 sm:p-3.5 border-b border-zinc-100 last:border-0 hover:bg-zinc-50/80 transition-colors lg:grid lg:grid-cols-[1.6fr_1fr_.8fr_.65fr_.7fr_36px] lg:items-center lg:py-2.5 lg:px-5 lg:border-b-0 lg:gap-4"
            >
              {/* Line 1 for Mobile (< lg): Package icon + Name on left, Price + Status + Menu on right */}
              <div className="flex items-center justify-between gap-2 lg:hidden">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 ring-1 ring-inset ring-zinc-200">
                    <Package className="size-4" />
                  </span>
                  <p className="truncate text-sm font-semibold text-zinc-900">
                    {product.name}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-bold text-zinc-950">
                    {formattedPrice}
                  </span>
                  <Badge
                    variant={product.status === "Ativo" ? "success" : "secondary"}
                    className="text-[11px] px-2 py-0.5"
                  >
                    <span className="mr-1 size-1.5 rounded-full bg-current" />
                    {product.status}
                  </Badge>
                  {actionMenuNode}
                </div>
              </div>

              {/* Line 2 for Mobile (< lg): Category & Stock indented under name */}
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 min-w-0 overflow-hidden whitespace-nowrap pl-[42px] lg:hidden">
                <span className="font-medium text-zinc-700 shrink-0">{product.category}</span>
                <span className="text-zinc-300 shrink-0">•</span>
                <span className="shrink-0 font-medium text-zinc-900">Estoque: {product.quantity || 0} un.</span>
              </div>

              {/* Desktop Product Info */}
              <div className="hidden lg:flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 ring-1 ring-inset ring-zinc-200">
                  <Package className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-900">
                    {product.name}
                  </p>
                </div>
              </div>

              {/* Desktop Category */}
              <div className="hidden lg:block text-xs font-medium text-zinc-700">
                {product.category}
              </div>

              {/* Desktop Price */}
              <div className="hidden lg:block text-sm font-semibold text-zinc-900">
                {formattedPrice}
              </div>

              {/* Desktop Stock */}
              <div className="hidden lg:block text-sm font-semibold text-zinc-900">
                {product.quantity || 0} un.
              </div>

              {/* Desktop Status */}
              <div className="hidden lg:block">
                <Badge
                  variant={product.status === "Ativo" ? "success" : "secondary"}
                >
                  <span className="mr-1.5 size-1.5 rounded-full bg-current" />
                  {product.status}
                </Badge>
              </div>

              {/* Desktop Actions Menu */}
              <div className="hidden lg:flex relative justify-end">
                {actionMenuNode}
              </div>
            </div>
          );
        })}
        {totalItems === 0 && (
          <div className="px-5 py-8 text-center">
            <Package className="mx-auto size-8 text-zinc-300" />
            <p className="mt-3 text-sm font-medium text-zinc-700">
              Nenhum produto cadastrado no banco de dados
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
