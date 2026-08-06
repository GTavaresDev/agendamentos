import { Sale } from "@core/domain/sales/sale.entity";
import { SaleRepository } from "@core/domain/sales/sale.repository";
import { ProductRepository } from "@core/domain/products/product.repository";
import { randomUUID } from "crypto";

export class CreateSale {
  constructor(
    private saleRepository: SaleRepository,
    private productRepository: ProductRepository,
  ) {}

  async execute(input: {
    productId: string;
    quantity: number;
    unitPrice: number;
    paymentMethod: "Pix" | "Dinheiro" | "Crédito" | "Débito" | "Transferência";
    createdById?: string;
  }): Promise<Sale> {
    const product = await this.productRepository.findById(input.productId);

    if (!product) {
      throw new Error("Produto não encontrado.");
    }

    if (product.status === "Inativo") {
      throw new Error("Produto inativo não pode ser vendido.");
    }

    if (input.quantity > product.quantity) {
      throw new Error("Quantidade insuficiente em estoque.");
    }

    if (input.quantity <= 0) {
      throw new Error("Quantidade deve ser maior que zero.");
    }

    const totalPrice = input.unitPrice * input.quantity;

    const sale = new Sale({
      id: randomUUID(),
      productId: input.productId,
      quantity: input.quantity,
      unitPrice: input.unitPrice,
      totalPrice,
      paymentMethod: input.paymentMethod,
      createdById: input.createdById,
    });

    return await this.saleRepository.saveWithInventoryUpdate(sale, -input.quantity);
  }
}
