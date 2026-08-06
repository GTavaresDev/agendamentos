import { Product } from "@core/domain/products/product.entity";
import { ProductRepository } from "@core/domain/products/product.repository";

export interface UpdateProductInput {
  id: string;
  name?: string;
  category?: string;
  price?: number;
  quantity?: number;
  status?: "Ativo" | "Inativo" | "Baixo estoque";
}

export class UpdateProduct {
  constructor(private productRepository: ProductRepository) {}

  async execute(input: UpdateProductInput): Promise<Product> {
    const existing = await this.productRepository.findById(input.id);
    if (!existing) {
      throw new Error("Produto não encontrado.");
    }

    const newQuantity = input.quantity ?? existing.quantity;
    let computedStatus = input.status ?? existing.status;
    if (newQuantity <= 5 && newQuantity > 0) {
      computedStatus = "Baixo estoque";
    } else if (newQuantity === 0) {
      computedStatus = "Inativo";
    }

    const updated = new Product({
      id: existing.id,
      name: input.name ?? existing.name,
      category: input.category ?? existing.category,
      price: input.price ?? existing.price,
      quantity: newQuantity,
      status: computedStatus,
      createdAt: existing.createdAt,
    });

    return await this.productRepository.update(updated);
  }
}
