"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button";
import { Input } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/input";
import { Card } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/card";
import {
  ViewLoadingSkeleton,
  LoadingOverlayCard,
} from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/page-skeletons";
import { useAppShell } from "@/app/(agendamentos)/(left-nav-bar)/_providers/use-app-shell";
import { useProducts } from "@/app/(agendamentos)/(left-nav-bar)/produtos/hooks/use-products";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { paginateItems } from "@/lib/pagination";
import { CreateProductDialog } from "@/app/(agendamentos)/(left-nav-bar)/produtos/components/create-product-dialog";
import { ProductsTable } from "@/app/(agendamentos)/(left-nav-bar)/produtos/components/products-table";

export function ProductsView() {
  const { productList, isLoading, handleAddProduct, handleUpdateProduct, handleDeleteProduct } =
    useProducts();
  const { currentUser, showToast } = useAppShell();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);

  useScrollLock(modal);

  const filtered = useMemo(() => {
    return productList.filter((product) => {
      const matchSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "Todos" || product.status === statusFilter;
      const matchCategory =
        categoryFilter === "Todas" || product.category === categoryFilter;
      return matchSearch && matchStatus && matchCategory;
    });
  }, [productList, search, statusFilter, categoryFilter]);

  const pagedProducts = useMemo(
    () => paginateItems(filtered, page),
    [filtered, page],
  );

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, categoryFilter]);

  const totalProducts = productList.length;
  const totalStock = productList.reduce((acc, p) => acc + (p.quantity || 0), 0);
  const activeProducts = productList.filter((p) => p.status === "Ativo").length;
  const lowStockProducts = productList.filter(
    (p) => p.status === "Baixo estoque" || (p.quantity || 0) <= 5,
  ).length;

  if (!currentUser) return null;

  if (isLoading) {
    return (
      <div className="relative min-h-[calc(100vh-84px)]">
        <ViewLoadingSkeleton view="produtos" />
        <LoadingOverlayCard label="Carregando dados..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px] p-3.5 sm:p-6 lg:p-8">
      {/* 4 Metric Cards at Top */}
      <div className="mb-6 grid gap-2.5 sm:gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="p-3 sm:p-4">
          <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-500 truncate">
            Total de Produtos
          </div>
          <div className="mt-1.5 text-xl sm:text-2xl font-bold text-zinc-900 truncate">
            {totalProducts}
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-500 truncate">
            Itens em Estoque
          </div>
          <div className="mt-1.5 text-xl sm:text-2xl font-bold text-zinc-900 truncate">
            {totalStock} un.
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-500 truncate">
            Produtos Ativos
          </div>
          <div className="mt-1.5 text-xl sm:text-2xl font-bold text-zinc-900 truncate">
            {activeProducts}
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-500 truncate">
            Baixo Estoque
          </div>
          <div className="mt-1.5 text-xl sm:text-2xl font-bold text-zinc-900 truncate">
            {lowStockProducts}
          </div>
        </Card>
      </div>

      {/* Search and Action Button on the second row */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou categoria..."
            className="pl-9 w-full"
          />
        </div>
        <Button onClick={() => setModal(true)} className="w-full sm:w-48 shrink-0 gap-2 justify-center">
          <Plus className="size-4" /> Adicionar produto
        </Button>
      </div>

      <ProductsTable
        products={filtered}
        totalItems={filtered.length}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        page={page}
        onPageChange={setPage}
        showToast={showToast}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
      />

      <CreateProductDialog
        open={modal}
        onClose={() => setModal(false)}
        showToast={showToast}
        onAddProduct={handleAddProduct}
      />
    </div>
  );
}
