"use server";

import { PrismaSaleRepository } from "@core/infra/persistence/prisma/repositories/prisma-sale.repository";
import { PrismaProductRepository } from "@core/infra/persistence/prisma/repositories/prisma-product.repository";
import { CreateSale } from "@core/application/sales/create-sale.usecase";
import { ListSales } from "@core/application/sales/list-sales.usecase";
import { UpdateSale } from "@core/application/sales/update-sale.usecase";
import { DeleteSale } from "@core/application/sales/delete-sale.usecase";
import { SaleProps } from "@core/domain/sales/sale.entity";
import { requireSessionAction } from "@/app/(agendamentos)/(left-nav-bar)/_actions/auth-actions";
import { prisma } from "@core/infra/persistence/prisma/client";
import { formatActionError } from "@/lib/action-error-handler";

const saleRepository = new PrismaSaleRepository();
const productRepository = new PrismaProductRepository();

export async function fetchSalesAction(filter?: {
  search?: string;
  paymentMethod?: string;
}): Promise<(SaleProps & { formattedTotal: string; formattedUnitPrice: string; productName?: string })[]> {
  await requireSessionAction();
  const useCase = new ListSales(saleRepository);
  const sales = await useCase.execute(filter);

  // Uma consulta para todos os produtos citados, não uma por venda.
  const products = await prisma.product.findMany({
    where: { id: { in: [...new Set(sales.map((sale) => sale.productId))] } },
    select: { id: true, name: true },
  });
  const nameByProductId = new Map(products.map((p) => [p.id, p.name]));

  return sales.map((sale) => ({
    ...sale.toJSON(),
    productName: nameByProductId.get(sale.productId),
  }));
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
    return { success: false, error: formatActionError(error, "Erro ao registrar venda.") };
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
    return { success: false, error: formatActionError(error, "Erro ao atualizar venda.") };
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
    return { success: false, error: formatActionError(error, "Erro ao excluir venda.") };
  }
}
