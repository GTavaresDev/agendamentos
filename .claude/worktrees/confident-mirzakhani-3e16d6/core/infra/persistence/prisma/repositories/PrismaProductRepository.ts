import { prisma } from "../client";
import { Product } from "@core/domain/products/Product";
import { ProductRepository } from "@core/domain/products/ProductRepository";
import { ProductMapper } from "../mappers/ProductMapper";

export class PrismaProductRepository implements ProductRepository {
  async findAll(): Promise<Product[]> {
    try {
      const records = await prisma.product.findMany({
        orderBy: { createdAt: "desc" },
      });
      return records.map(ProductMapper.toDomain);
    } catch {
      return [];
    }
  }

  async findById(id: string): Promise<Product | null> {
    try {
      const record = await prisma.product.findUnique({ where: { id } });
      return record ? ProductMapper.toDomain(record) : null;
    } catch {
      return null;
    }
  }

  async save(product: Product): Promise<Product> {
    const raw = ProductMapper.toPersistence(product);
    const created = await prisma.product.create({
      data: {
        id: raw.id,
        name: raw.name,
        category: raw.category,
        price: raw.price,
        quantity: raw.quantity,
        status: raw.status,
      },
    });
    return ProductMapper.toDomain(created);
  }

  async update(product: Product): Promise<Product> {
    const raw = ProductMapper.toPersistence(product);
    const updated = await prisma.product.update({
      where: { id: raw.id },
      data: {
        name: raw.name,
        category: raw.category,
        price: raw.price,
        quantity: raw.quantity,
        status: raw.status,
      },
    });
    return ProductMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.product.delete({ where: { id } });
  }
}
