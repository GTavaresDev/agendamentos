"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductProps } from "@core/domain/products/product.entity";
import { SaleProps } from "@core/domain/sales/sale.entity";
import { SalesTable } from "./sales-table";
import { AddSaleDialog } from "./add-sale-dialog";
import { EditSaleDialog } from "./edit-sale-dialog";
import { DeleteSaleDialog } from "./delete-sale-dialog";

export const PAYMENT_METHODS = ["Pix", "Dinheiro", "Crédito", "Débito", "Transferência"] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export function FieldLabel({ children }: { children: string }) {
  return <label className="block text-xs font-semibold text-zinc-700 mb-2">{children}</label>;
}

export type ExtendedSale = SaleProps & { formattedTotal: string; formattedUnitPrice: string; productName?: string };

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
    paymentMethod: PaymentMethod;
  }) => Promise<void>;
  onUpdateSale: (id: string, sale: {
    quantity?: number;
    unitPrice?: number;
    paymentMethod?: PaymentMethod;
  }, password: string) => Promise<void>;
  onDeleteSale: (id: string, password: string) => Promise<void>;
}) {
  const searchParams = useSearchParams();
  const [modal, setModal] = useState(searchParams.get("novo") === "1");
  const [editModal, setEditModal] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-[1500px] p-3.5 sm:p-6 lg:p-8">
      <SalesTable
        saleList={saleList}
        onOpenAddModal={() => setModal(true)}
        onEditSale={setEditModal}
        onDeleteSale={setDeleteModal}
      />

      <AddSaleDialog
        open={modal}
        onClose={() => setModal(false)}
        productList={productList}
        showToast={showToast}
        onAddSale={onAddSale}
      />

      <EditSaleDialog
        saleId={editModal}
        onClose={() => setEditModal(null)}
        saleList={saleList}
        productList={productList}
        showToast={showToast}
        onUpdateSale={onUpdateSale}
      />

      <DeleteSaleDialog
        saleId={deleteModal}
        onClose={() => setDeleteModal(null)}
        showToast={showToast}
        onDeleteSale={onDeleteSale}
      />
    </div>
  );
}
