import { Sale } from "@core/domain/sales/sale.entity";

type PrismaSaleModel = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  paymentMethod: string;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class SaleMapper {
  public static toDomain(raw: PrismaSaleModel): Sale {
    return new Sale({
      id: raw.id,
      productId: raw.productId,
      quantity: raw.quantity,
      unitPrice: raw.unitPrice,
      totalPrice: raw.totalPrice,
      paymentMethod: raw.paymentMethod as
        | "Pix"
        | "Dinheiro"
        | "Crédito"
        | "Débito"
        | "Transferência",
      createdById: raw.createdById,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  public static toPersistence(sale: Sale): {
    id: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    paymentMethod: string;
    createdById: string | null | undefined;
  } {
    return {
      id: sale.id,
      productId: sale.productId,
      quantity: sale.quantity,
      unitPrice: sale.unitPrice,
      totalPrice: sale.totalPrice,
      paymentMethod: sale.paymentMethod,
      createdById: sale.createdById,
    };
  }
}
