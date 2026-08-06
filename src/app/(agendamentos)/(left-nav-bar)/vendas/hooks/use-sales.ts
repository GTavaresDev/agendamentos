import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createSaleAction,
  deleteSaleAction,
  fetchSalesAction,
  updateSaleAction,
} from "@/app/(agendamentos)/(left-nav-bar)/_actions/sale-actions";
import { SaleProps } from "@core/domain/sales/sale.entity";
import { useAppShell } from "@/app/(agendamentos)/(left-nav-bar)/_providers/use-app-shell";
import { useProducts } from "@/app/(agendamentos)/(left-nav-bar)/produtos/hooks/use-products";

type SaleWithDisplay = SaleProps & {
  formattedTotal: string;
  formattedUnitPrice: string;
  productName?: string;
};

export interface SalesContextType {
  saleList: SaleWithDisplay[];
  isLoading: boolean;
  handleAddSale: (sale: {
    productId: string;
    quantity: number;
    unitPrice: number;
    paymentMethod: "Pix" | "Dinheiro" | "Crédito" | "Débito" | "Transferência";
  }) => Promise<void>;
  handleUpdateSale: (
    id: string,
    sale: {
      quantity?: number;
      unitPrice?: number;
      paymentMethod?: "Pix" | "Dinheiro" | "Crédito" | "Débito" | "Transferência";
    },
    password: string
  ) => Promise<void>;
  handleDeleteSale: (id: string, password: string) => Promise<void>;
}

export const SalesContext = createContext<SalesContextType | undefined>(undefined);

export function useSalesState(): SalesContextType {
  const { currentUser, showToast } = useAppShell();
  const { productList, setProductList } = useProducts();
  const [saleList, setSaleList] = useState<SaleWithDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;

    fetchSalesAction()
      .then((sales) => {
        if (!cancelled && sales) setSaleList(sales);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  async function handleAddSale(sale: {
    productId: string;
    quantity: number;
    unitPrice: number;
    paymentMethod: "Pix" | "Dinheiro" | "Crédito" | "Débito" | "Transferência";
  }) {
    const res = await createSaleAction(sale);
    if (res.success && res.data) {
      const product = productList.find((p) => p.id === sale.productId);
      setSaleList((prev) => [{ ...res.data!, productName: product?.name }, ...prev]);
      setProductList((prev) =>
        prev.map((p) =>
          p.id === sale.productId ? { ...p, quantity: p.quantity - sale.quantity } : p
        )
      );
    } else {
      throw new Error(res.error || "Erro ao registrar venda.");
    }
  }

  async function handleUpdateSale(
    id: string,
    sale: {
      quantity?: number;
      unitPrice?: number;
      paymentMethod?: "Pix" | "Dinheiro" | "Crédito" | "Débito" | "Transferência";
    },
    password: string
  ) {
    const res = await updateSaleAction({ id, ...sale, password });
    if (res.success && res.data) {
      setSaleList((prev) => prev.map((s) => (s.id === id ? res.data! : s)));
      showToast("Venda atualizada com sucesso.");
    } else {
      showToast(res.error || "Erro ao atualizar venda.");
    }
  }

  async function handleDeleteSale(id: string, password: string) {
    const res = await deleteSaleAction({ id, password });
    if (res.success) {
      const saleToDelete = saleList.find((s) => s.id === id);
      if (saleToDelete) {
        setProductList((prev) =>
          prev.map((p) =>
            p.id === saleToDelete.productId
              ? { ...p, quantity: p.quantity + saleToDelete.quantity }
              : p
          )
        );
      }
      setSaleList((prev) => prev.filter((s) => s.id !== id));
      showToast("Venda excluída e estoque restaurado.");
    } else {
      showToast(res.error || "Erro ao excluir venda.");
    }
  }

  return { saleList, isLoading, handleAddSale, handleUpdateSale, handleDeleteSale };
}

export function useSales() {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error("useSales must be used within a SalesProvider");
  }
  return context;
}

export function SalesProvider({ children }: { children: React.ReactNode }) {
  const value = useSalesState();
  return React.createElement(SalesContext.Provider, { value }, children);
}
