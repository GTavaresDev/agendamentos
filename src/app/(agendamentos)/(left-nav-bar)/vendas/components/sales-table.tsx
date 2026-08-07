"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, MoreVertical, Pencil, Plus, Search, ShoppingCart, Trash2 } from "lucide-react";
import { Badge } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/badge";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button";
import { Card, CardHeader, CardTitle } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/card";
import { Input } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/input";
import { ListPagination } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/list-pagination";
import { cn } from "@/lib/utils";
import { paginateItems, TABLE_BODY_MIN_HEIGHT_CLASS, TABLE_ROW_MIN_HEIGHT_CLASS } from "@/lib/pagination";
import { PAYMENT_METHODS, type ExtendedSale } from "./sales";

export function SalesTable({
  saleList,
  onOpenAddModal,
  onEditSale,
  onDeleteSale,
}: {
  saleList: ExtendedSale[];
  onOpenAddModal: () => void;
  onEditSale: (id: string) => void;
  onDeleteSale: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("Todos");
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return saleList.filter((sale) => {
      const pName = sale.productName || "";
      const sId = sale.id || "";
      const matchSearch =
        pName.toLowerCase().includes(search.toLowerCase()) ||
        sId.toLowerCase().includes(search.toLowerCase());
      const matchPayment =
        paymentFilter === "Todos" || sale.paymentMethod === paymentFilter;
      return matchSearch && matchPayment;
    });
  }, [saleList, search, paymentFilter]);

  const totalSales = useMemo(() => {
    return filtered.reduce((acc, sale) => acc + (sale.totalPrice || 0), 0);
  }, [filtered]);

  const avgTicket = filtered.length ? totalSales / filtered.length : 0;
  const topMethod = useMemo(() => {
    if (!filtered.length) return "—";
    const counts = new Map<string, number>();
    filtered.forEach((s) => {
      const m = s.paymentMethod || "Outro";
      counts.set(m, (counts.get(m) || 0) + 1);
    });
    let best = "—";
    let max = 0;
    counts.forEach((count, method) => {
      if (count > max) {
        max = count;
        best = method;
      }
    });
    return best;
  }, [filtered]);

  const pagedSales = useMemo(
    () => paginateItems(filtered, page),
    [filtered, page],
  );

  useEffect(() => {
    setPage(1);
  }, [search, paymentFilter]);

  return (
    <>
      {/* 4 Metric Cards at Top */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="@container/card p-[clamp(0.75rem,4cqw,1.25rem)] flex flex-col justify-between h-full shadow-xs hover:border-zinc-300 transition-all">
          <div className="text-[clamp(0.625rem,2.8cqw,0.75rem)] text-zinc-500 uppercase tracking-wider font-semibold leading-tight whitespace-nowrap overflow-hidden text-ellipsis">Total (período)</div>
          <div className="mt-[clamp(0.375rem,2cqw,0.75rem)] text-[clamp(1.125rem,6cqw,1.625rem)] font-bold text-zinc-900 leading-none whitespace-nowrap">
            {totalSales.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </div>
        </Card>
        <Card className="@container/card p-[clamp(0.75rem,4cqw,1.25rem)] flex flex-col justify-between h-full shadow-xs hover:border-zinc-300 transition-all">
          <div className="text-[clamp(0.625rem,2.8cqw,0.75rem)] text-zinc-500 uppercase tracking-wider font-semibold leading-tight whitespace-nowrap overflow-hidden text-ellipsis">Vendas Realizadas</div>
          <div className="mt-[clamp(0.375rem,2cqw,0.75rem)] text-[clamp(1.125rem,6cqw,1.625rem)] font-bold text-zinc-900 leading-none whitespace-nowrap">{filtered.length}</div>
        </Card>
        <Card className="@container/card p-[clamp(0.75rem,4cqw,1.25rem)] flex flex-col justify-between h-full shadow-xs hover:border-zinc-300 transition-all">
          <div className="text-[clamp(0.625rem,2.8cqw,0.75rem)] text-zinc-500 uppercase tracking-wider font-semibold leading-tight whitespace-nowrap overflow-hidden text-ellipsis">Ticket Médio</div>
          <div className="mt-[clamp(0.375rem,2cqw,0.75rem)] text-[clamp(1.125rem,6cqw,1.625rem)] font-bold text-zinc-900 leading-none whitespace-nowrap">
            {avgTicket.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </div>
        </Card>
        <Card className="@container/card p-[clamp(0.75rem,4cqw,1.25rem)] flex flex-col justify-between h-full shadow-xs hover:border-zinc-300 transition-all">
          <div className="text-[clamp(0.625rem,2.8cqw,0.75rem)] text-zinc-500 uppercase tracking-wider font-semibold leading-tight whitespace-nowrap overflow-hidden text-ellipsis">Método Principal</div>
          <div className="mt-[clamp(0.375rem,2cqw,0.75rem)] text-[clamp(1.125rem,6cqw,1.625rem)] font-bold text-zinc-900 leading-none whitespace-nowrap">{topMethod}</div>
        </Card>
      </div>

      {/* Search and Action Button on the second row */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por produto ou ID..."
            className="pl-9 w-full"
          />
        </div>
        <Button onClick={onOpenAddModal} className="w-full sm:w-48 shrink-0 gap-2 justify-center">
          <Plus className="size-4" /> Nova Venda
        </Button>
      </div>

      <Card className="overflow-visible">
        <CardHeader className="border-b border-zinc-100 bg-zinc-50/70 p-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <ShoppingCart className="size-4" /> Histórico de Vendas
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative shrink-0">
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="h-8 max-w-[140px] truncate appearance-none rounded-lg border border-zinc-200 bg-white pl-2.5 pr-7 text-xs font-medium text-zinc-700 outline-none transition hover:border-zinc-300 focus:border-zinc-400"
                >
                  <option value="Todos">Método: Todos</option>
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
              </div>
              <Badge variant="outline" className="h-8 px-2.5 text-xs font-normal">
                {filtered.length} {filtered.length === 1 ? "venda" : "vendas"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <div className="hidden h-11 grid-cols-[1fr_.8fr_.8fr_.8fr_.9fr_36px] items-center gap-4 border-b border-zinc-200 bg-zinc-50/70 px-5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 lg:grid">
          <span>Produto</span>
          <span>Quantidade</span>
          <span>Unitário</span>
          <span>Total</span>
          <span>Método</span>
          <span />
        </div>
        <div className={cn("divide-y divide-zinc-100", TABLE_BODY_MIN_HEIGHT_CLASS)}>
          {pagedSales.map((sale) => {
            const actionMenuNode = (
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenMenuId(openMenuId === sale.id ? null : sale.id)
                  }
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-black transition-colors"
                >
                  <MoreVertical className="size-4" />
                </button>
                {openMenuId === sale.id && (
                  <div className="absolute right-0 top-8 z-[60] w-48 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl">
                    <button
                      type="button"
                      onClick={() => {
                        onEditSale(sale.id);
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
                        onDeleteSale(sale.id);
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

            return (
              <div
                key={sale.id}
                className="group relative flex flex-col gap-1.5 p-3 sm:p-3.5 border-b border-zinc-100 last:border-0 hover:bg-zinc-50/80 transition-colors lg:grid lg:grid-cols-[1fr_.8fr_.8fr_.8fr_.9fr_36px] lg:items-center lg:py-2.5 lg:px-5 lg:border-b-0 lg:gap-4"
              >
                {/* Line 1 for Mobile (< lg): Initial + Name on left, Total + Method + Menu on right */}
                <div className="flex items-center justify-between gap-2 lg:hidden">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-800 ring-1 ring-inset ring-zinc-200 text-xs font-bold">
                      {sale.productName?.charAt(0).toUpperCase()}
                    </span>
                    <p className="truncate text-sm font-semibold text-zinc-900">
                      {sale.productName || "Produto"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                      {sale.formattedTotal}
                    </span>
                    <Badge variant="outline" className="text-[11px] px-2 py-0.5">
                      {sale.paymentMethod}
                    </Badge>
                    {actionMenuNode}
                  </div>
                </div>

                {/* Line 2 for Mobile (< lg): Quantity, Unit price & Date indented under name */}
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 min-w-0 overflow-hidden whitespace-nowrap pl-[42px] lg:hidden">
                  <span className="font-medium text-zinc-700 shrink-0">{sale.quantity} {sale.quantity === 1 ? "un." : "uns."}</span>
                  <span className="text-zinc-300 shrink-0">•</span>
                  <span className="shrink-0">Unit: {sale.formattedUnitPrice}</span>
                  <span className="text-zinc-300 shrink-0">•</span>
                  <span className="shrink-0 text-zinc-400">{new Date(sale.createdAt || 0).toLocaleDateString("pt-BR")}</span>
                </div>

                {/* Desktop Product Info */}
                <div className="hidden lg:flex min-w-0 items-center gap-3">
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

                {/* Desktop Quantity */}
                <div className="hidden lg:block text-sm font-semibold text-zinc-900">
                  {sale.quantity} {sale.quantity === 1 ? "un." : "uns."}
                </div>

                {/* Desktop Unit Price */}
                <div className="hidden lg:block text-sm font-semibold text-zinc-900">
                  {sale.formattedUnitPrice}
                </div>

                {/* Desktop Total */}
                <div className="hidden lg:block text-sm font-bold text-green-600">
                  {sale.formattedTotal}
                </div>

                {/* Desktop Method */}
                <div className="hidden lg:block">
                  <Badge variant="outline">
                    {sale.paymentMethod}
                  </Badge>
                </div>

                {/* Desktop Actions Menu */}
                <div className="hidden lg:flex relative justify-end">
                  {actionMenuNode}
                </div>
              </div>
            );
          })}
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
    </>
  );
}
