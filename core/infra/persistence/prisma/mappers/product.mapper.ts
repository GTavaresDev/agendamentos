import { Product as PrismaProductModel } from "@prisma/client";
import { Product } from "@core/domain/products/product.entity";

export class ProductMapper {
  public static toDomain(raw: PrismaProductModel): Product {
    return new Product({
      id: raw.id,
      name: raw.name,
      category: raw.category,
      price: raw.price,
      quantity: raw.quantity,
      status: raw.status as "Ativo" | "Inativo" | "Baixo estoque",
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  public static toPersistence(product: Product): {
    id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
    status: string;
  } {
    return {
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      quantity: product.quantity,
      status: product.status,
    };
  }
}
