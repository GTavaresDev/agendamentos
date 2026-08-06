import { prisma } from "../client";
import { Sale } from "@core/domain/sales/Sale";
import { SaleRepository } from "@core/domain/sales/SaleRepository";
import { SaleMapper } from "../mappers/SaleMapper";

export class PrismaSaleRepository implements SaleRepository {
  async findAll(): Promise<Sale[]> {
    try {
      const records = await prisma.sale.findMany({
        orderBy: { createdAt: "desc" },
      });
      return records.map(SaleMapper.toDomain);
    } catch {
      return [];
    }
  }

  async findById(id: string): Promise<Sale | null> {
    try {
      const record = await prisma.sale.findUnique({ where: { id } });
      return record ? SaleMapper.toDomain(record) : null;
    } catch {
      return null;
    }
  }

  async findByProductId(productId: string): Promise<Sale[]> {
    try {
      const records = await prisma.sale.findMany({
        where: { productId },
        orderBy: { createdAt: "desc" },
      });
      return records.map(SaleMapper.toDomain);
    } catch {
      return [];
    }
  }

  async save(sale: Sale): Promise<Sale> {
    const raw = SaleMapper.toPersistence(sale);
    const created = await prisma.sale.create({
      data: {
        id: raw.id,
        productId: raw.productId,
        quantity: raw.quantity,
        unitPrice: raw.unitPrice,
        totalPrice: raw.totalPrice,
        paymentMethod: raw.paymentMethod,
        createdById: raw.createdById,
      },
    });
    return SaleMapper.toDomain(created);
  }

  async update(sale: Sale): Promise<Sale> {
    const raw = SaleMapper.toPersistence(sale);
    const updated = await prisma.sale.update({
      where: { id: raw.id },
      data: {
        productId: raw.productId,
        quantity: raw.quantity,
        unitPrice: raw.unitPrice,
        totalPrice: raw.totalPrice,
        paymentMethod: raw.paymentMethod,
      },
    });
    return SaleMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.sale.delete({ where: { id } });
  }

  async saveWithInventoryUpdate(sale: Sale, quantityDelta: number): Promise<Sale> {
    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: sale.productId },
      });

      if (!product) {
        throw new Error("Produto não encontrado.");
      }

      const newQuantity = product.quantity + quantityDelta;
      if (newQuantity < 0) {
        throw new Error("Quantidade insuficiente em estoque.");
      }

      await tx.product.update({
        where: { id: sale.productId },
        data: { quantity: newQuantity },
      });

      const raw = SaleMapper.toPersistence(sale);
      const created = await tx.sale.create({
        data: {
          id: raw.id,
          productId: raw.productId,
          quantity: raw.quantity,
          unitPrice: raw.unitPrice,
          totalPrice: raw.totalPrice,
          paymentMethod: raw.paymentMethod,
          createdById: raw.createdById,
        },
      });

      return SaleMapper.toDomain(created);
    });
  }

  async updateWithInventoryRecalculation(
    id: string,
    sale: Sale,
    oldQuantity: number,
  ): Promise<Sale> {
    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: sale.productId },
      });

      if (!product) {
        throw new Error("Produto não encontrado.");
      }

      const quantityDifference = sale.quantity - oldQuantity;
      const newQuantity = product.quantity - quantityDifference;

      if (newQuantity < 0) {
        throw new Error("Quantidade insuficiente em estoque.");
      }

      await tx.product.update({
        where: { id: sale.productId },
        data: { quantity: newQuantity },
      });

      const raw = SaleMapper.toPersistence(sale);
      const updated = await tx.sale.update({
        where: { id },
        data: {
          productId: raw.productId,
          quantity: raw.quantity,
          unitPrice: raw.unitPrice,
          totalPrice: raw.totalPrice,
          paymentMethod: raw.paymentMethod,
        },
      });

      return SaleMapper.toDomain(updated);
    });
  }

  async deleteWithInventoryRestore(id: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({ where: { id } });

      if (!sale) {
        throw new Error("Venda não encontrada.");
      }

      const product = await tx.product.findUnique({
        where: { id: sale.productId },
      });

      if (!product) {
        throw new Error("Produto não encontrado.");
      }

      await tx.product.update({
        where: { id: sale.productId },
        data: { quantity: product.quantity + sale.quantity },
      });

      await tx.sale.delete({ where: { id } });
    });
  }
}
