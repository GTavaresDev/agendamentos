"use client";

import { useAppShell } from "@/app/(agendamentos)/(left-nav-bar)/_providers/use-app-shell";
import { useSales } from "@/app/(agendamentos)/(left-nav-bar)/vendas/hooks/use-sales";
import { useProducts } from "@/app/(agendamentos)/(left-nav-bar)/produtos/hooks/use-products";
import {
  LoadingOverlayCard,
  ViewLoadingSkeleton,
} from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/page-skeletons";
import { Sales } from "./sales";

export function SalesView() {
  const { currentUser, showToast } = useAppShell();
  const {
    saleList,
    isLoading: salesLoading,
    handleAddSale,
    handleUpdateSale,
    handleDeleteSale,
  } = useSales();
  const { productList, isLoading: productsLoading } = useProducts();

  if (!currentUser) return null;

  if (salesLoading || productsLoading) {
    return (
      <div className="relative min-h-[calc(100vh-84px)]">
        <ViewLoadingSkeleton view="vendas" />
        <LoadingOverlayCard label="Carregando dados..." />
      </div>
    );
  }

  return (
    <Sales
      showToast={showToast}
      saleList={saleList}
      productList={productList}
      onAddSale={handleAddSale}
      onUpdateSale={handleUpdateSale}
      onDeleteSale={handleDeleteSale}
    />
  );
}
