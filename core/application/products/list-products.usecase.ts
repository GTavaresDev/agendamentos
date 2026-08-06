import { Product } from "@core/domain/products/product.entity";
import { ProductRepository } from "@core/domain/products/product.repository";

export interface ListProductsFilter {
  search?: string;
  category?: string;
  status?: string;
}

export class ListProducts {
  constructor(private productRepository: ProductRepository) {}

  async execute(filter?: ListProductsFilter): Promise<Product[]> {
    let products = await this.productRepository.findAll();

    if (filter?.search) {
      const term = filter.search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term),
      );
    }

    if (filter?.category && filter.category !== "Todas") {
      products = products.filter((p) => p.category === filter.category);
    }

    if (filter?.status && filter.status !== "Todos") {
      products = products.filter((p) => p.status === filter.status);
    }

    return products;
  }
}
