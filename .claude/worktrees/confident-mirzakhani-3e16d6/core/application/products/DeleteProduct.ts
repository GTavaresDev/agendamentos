import { ProductRepository } from "@core/domain/products/ProductRepository";

export class DeleteProduct {
  constructor(private productRepository: ProductRepository) {}

  async execute(id: string): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error("Produto não encontrado.");
    }
    await this.productRepository.delete(id);
  }
}
