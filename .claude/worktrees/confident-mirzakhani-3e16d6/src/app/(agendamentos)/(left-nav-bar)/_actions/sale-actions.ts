"use server";

import { PrismaSaleRepository } from "@core/infra/persistence/prisma/repositories/PrismaSaleRepository";
import { PrismaProductRepository } from "@core/infra/persistence/prisma/repositories/PrismaProductRepository";
import { CreateSale } from "@core/application/sales/CreateSale";
import { ListSales } from "@core/application/sales/ListSales";
import { UpdateSale } from "@core/application/sales/UpdateSale";
import { DeleteSale } from "@core/application/sales/DeleteSale";
import { SaleProps } from "@core/domain/sales/Sale";
import { requireSessionAction } from "@/app/(agendamentos)/(left-nav-bar)/_actions/auth-actions";
import { prisma } from "@core/infra/persistence/prisma/client";

const saleRepository = new PrismaSaleRepository();
const productRepository = new PrismaProductRepository();

export async function fetchSalesAction(filter?: {
  search?: string;
  paymentMethod?: string;
}): Promise<(SaleProps & { formattedTotal: string; formattedUnitPrice: string; productName?: string })[]> {
  await requireSessionAction();
  const useCase = new ListSales(saleRepository);
  const sales = await useCase.execute(filter);

  const salesWithProducts = await Promise.all(
    sales.map(async (sale) => {
      const product = await prisma.product.findUnique({
        where: { id: sale.productId },
      });
      return {
        ...sale.toJSON(),
        productName: product?.name,
      };
    }),
  );

  return salesWithProducts;
}

export async function createSaleAction(input: {
  productId: string;
  quantity: number;
  unitPrice: number;
  paymentMethod: "Pix" | "Dinheiro" | "Crédito" | "Débito" | "Transferência";
}): Promise<{
  success: boolean;
  data?: SaleProps & { formattedTotal: string; formattedUnitPrice: string };
  error?: string;
}> {
  try {
    const session = await requireSessionAction();
    const useCase = new CreateSale(saleRepository, productRepository);
    const created = await useCase.execute({
      ...input,
      createdById: session?.id,
    });
    return { success: true, data: created.toJSON() };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao registrar venda.";
    return { success: false, error: message };
  }
}

export async function updateSaleAction(input: {
  id: string;
  quantity?: number;
  unitPrice?: number;
  paymentMethod?: "Pix" | "Dinheiro" | "Crédito" | "Débito" | "Transferência";
  password: string;
}): Promise<{
  success: boolean;
  data?: SaleProps & { formattedTotal: string; formattedUnitPrice: string };
  error?: string;
}> {
  try {
    await requireSessionAction();

    const adminPassword = process.env.SALE_EDIT_PASSWORD;
    if (!adminPassword || input.password !== adminPassword) {
      return { success: false, error: "Senha de administrador incorreta." };
    }

    const useCase = new UpdateSale(saleRepository, productRepository);
    const updated = await useCase.execute({
      id: input.id,
      quantity: input.quantity,
      unitPrice: input.unitPrice,
      paymentMethod: input.paymentMethod,
    });
    return { success: true, data: updated.toJSON() };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao atualizar venda.";
    return { success: false, error: message };
  }
}

export async function deleteSaleAction(input: {
  id: string;
  password: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await requireSessionAction();

    const adminPassword = process.env.SALE_EDIT_PASSWORD;
    if (!adminPassword || input.password !== adminPassword) {
      return { success: false, error: "Senha de administrador incorreta." };
    }

    const useCase = new DeleteSale(saleRepository);
    await useCase.execute(input.id);
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao excluir venda.";
    return { success: false, error: message };
  }
}
