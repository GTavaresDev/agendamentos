import { Product } from "@core/domain/products/Product";
import { ProductRepository } from "@core/domain/products/ProductRepository";

export interface CreateProductInput {
  name: string;
  category: string;
  price: number;
  quantity: number;
  status?: "Ativo" | "Inativo" | "Baixo estoque";
}

export class CreateProduct {
  constructor(private productRepository: ProductRepository) {}

  async execute(input: CreateProductInput): Promise<Product> {
    let computedStatus: "Ativo" | "Inativo" | "Baixo estoque" = input.status || "Ativo";
    if (computedStatus === "Ativo" && input.quantity <= 5) {
      computedStatus = "Baixo estoque";
    }
    if (input.quantity === 0) {
      computedStatus = "Inativo";
    }

    const product = new Product({
      id: crypto.randomUUID(),
      name: input.name,
      category: input.category,
      price: input.price,
      quantity: input.quantity,
      status: computedStatus,
    });

    return await this.productRepository.save(product);
  }
}
