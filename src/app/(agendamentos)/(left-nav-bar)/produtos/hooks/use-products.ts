import React, { createContext, useContext, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import {
  createProductAction,
  deleteProductAction,
  fetchProductsAction,
  updateProductAction,
} from "@/app/(agendamentos)/(left-nav-bar)/_actions/product-actions";
import { ProductProps } from "@core/domain/products/product.entity";
import { useAppShell } from "@/app/(agendamentos)/(left-nav-bar)/_providers/use-app-shell";

export interface ProductsContextType {
  productList: ProductProps[];
  setProductList: Dispatch<SetStateAction<ProductProps[]>>;
  isLoading: boolean;
  handleAddProduct: (prod: {
    name: string;
    category: string;
    price: number;
    quantity: number;
    status?: "Ativo" | "Inativo" | "Baixo estoque";
  }) => Promise<void>;
  handleUpdateProduct: (id: string, status: "Ativo" | "Inativo" | "Baixo estoque") => Promise<void>;
  handleDeleteProduct: (id: string) => Promise<void>;
}

export const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function useProductsState(): ProductsContextType {
  const { currentUser } = useAppShell();
  const [productList, setProductList] = useState<ProductProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;

    fetchProductsAction()
      .then((products) => {
        if (!cancelled && products) setProductList(products);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  async function handleAddProduct(prod: {
    name: string;
    category: string;
    price: number;
    quantity: number;
    status?: "Ativo" | "Inativo" | "Baixo estoque";
  }) {
    const res = await createProductAction(prod);
    if (res.success && res.data) {
      setProductList((prev) => [res.data!, ...prev]);
    } else {
      throw new Error(res.error || "Erro ao adicionar produto.");
    }
  }

  async function handleUpdateProduct(id: string, status: "Ativo" | "Inativo" | "Baixo estoque") {
    await updateProductAction({ id, status });
    setProductList((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  }

  async function handleDeleteProduct(id: string) {
    await deleteProductAction(id);
    setProductList((prev) => prev.filter((p) => p.id !== id));
  }

  return {
    productList,
    setProductList,
    isLoading,
    handleAddProduct,
    handleUpdateProduct,
    handleDeleteProduct,
  };
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }
  return context;
}

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const value = useProductsState();
  return React.createElement(ProductsContext.Provider, { value }, children);
}
