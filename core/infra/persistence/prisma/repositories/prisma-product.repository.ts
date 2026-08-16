import { prisma } from "../client";
import { Product } from "@core/domain/products/product.entity";
import { ProductRepository } from "@core/domain/products/product.repository";
import { ProductMapper } from "../mappers/product.mapper";
import { CacheKeys, CacheTTL, getCached, invalidate } from "../../../cache";

export class PrismaProductRepository implements ProductRepository {
  async findAll(): Promise<Product[]> {
    try {
      const records = await getCached(CacheKeys.products, CacheTTL.products, () =>
        prisma.product.findMany({
          orderBy: { createdAt: "desc" },
        }),
      );
      return records.map(ProductMapper.toDomain);
    } catch (error) {
      console.error("[PrismaProductRepository.findAll] Database query failed:", error);
      throw error;
    }
  }

  async findById(id: string): Promise<Product | null> {
    try {
      const record = await prisma.product.findUnique({ where: { id } });
      return record ? ProductMapper.toDomain(record) : null;
    } catch (error) {
      console.error("[PrismaProductRepository.findById] Database query failed:", error);
      throw error;
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
    await invalidate(CacheKeys.products);
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
    await invalidate(CacheKeys.products);
    return ProductMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.product.delete({ where: { id } });
    await invalidate(CacheKeys.products);
  }
}
