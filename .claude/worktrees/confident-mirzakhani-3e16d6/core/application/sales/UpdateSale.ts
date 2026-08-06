import { Sale } from "@core/domain/sales/Sale";
import { SaleRepository } from "@core/domain/sales/SaleRepository";
import { ProductRepository } from "@core/domain/products/ProductRepository";

export class UpdateSale {
  constructor(
    private saleRepository: SaleRepository,
    private productRepository: ProductRepository,
  ) {}

  async execute(input: {
    id: string;
    productId?: string;
    quantity?: number;
    unitPrice?: number;
    paymentMethod?: "Pix" | "Dinheiro" | "Crédito" | "Débito" | "Transferência";
  }): Promise<Sale> {
    const existingSale = await this.saleRepository.findById(input.id);

    if (!existingSale) {
      throw new Error("Venda não encontrada.");
    }

    const productId = input.productId || existingSale.productId;
    const quantity = input.quantity ?? existingSale.quantity;
    const unitPrice = input.unitPrice ?? existingSale.unitPrice;
    const paymentMethod = input.paymentMethod || existingSale.paymentMethod;

    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new Error("Produto não encontrado.");
    }

    if (product.status === "Inativo") {
      throw new Error("Produto inativo não pode ser vendido.");
    }

    const totalPrice = unitPrice * quantity;

    const updatedSale = new Sale({
      id: existingSale.id,
      productId,
      quantity,
      unitPrice,
      totalPrice,
      paymentMethod,
      createdById: existingSale.createdById,
      createdAt: existingSale.createdAt,
      updatedAt: new Date(),
    });

    if (productId === existingSale.productId) {
      return await this.saleRepository.updateWithInventoryRecalculation(
        input.id,
        updatedSale,
        existingSale.quantity,
      );
    }

    throw new Error("Mudança de produto não suportada. Delete e crie uma nova venda.");
  }
}
