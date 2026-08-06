"use server";

import { PrismaProductRepository } from "@core/infra/persistence/prisma/repositories/PrismaProductRepository";
import { CreateProduct } from "@core/application/products/CreateProduct";
import { ListProducts } from "@core/application/products/ListProducts";
import { UpdateProduct } from "@core/application/products/UpdateProduct";
import { DeleteProduct } from "@core/application/products/DeleteProduct";
import { ProductProps } from "@core/domain/products/Product";
import { requireSessionAction } from "@/app/(agendamentos)/(left-nav-bar)/_actions/auth-actions";

const productRepository = new PrismaProductRepository();

export async function fetchProductsAction(filter?: {
  search?: string;
  category?: string;
  status?: string;
}): Promise<(ProductProps & { formattedPrice: string })[]> {
  await requireSessionAction();
  const useCase = new ListProducts(productRepository);
  const products = await useCase.execute(filter);
  return products.map((p) => p.toJSON());
}

export async function createProductAction(input: {
  name: string;
  category: string;
  price: number;
  quantity: number;
  status?: "Ativo" | "Inativo" | "Baixo estoque";
}): Promise<{
  success: boolean;
  data?: ProductProps & { formattedPrice: string };
  error?: string;
}> {
  try {
    await requireSessionAction();
    const useCase = new CreateProduct(productRepository);
    const created = await useCase.execute(input);
    return { success: true, data: created.toJSON() };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao criar produto.";
    return { success: false, error: message };
  }
}

export async function updateProductAction(input: {
  id: string;
  name?: string;
  category?: string;
  price?: number;
  quantity?: number;
  status?: "Ativo" | "Inativo" | "Baixo estoque";
}): Promise<{
  success: boolean;
  data?: ProductProps & { formattedPrice: string };
  error?: string;
}> {
  try {
    await requireSessionAction();
    const useCase = new UpdateProduct(productRepository);
    const updated = await useCase.execute(input);
    return { success: true, data: updated.toJSON() };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao atualizar produto.";
    return { success: false, error: message };
  }
}

export async function deleteProductAction(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireSessionAction();
    const useCase = new DeleteProduct(productRepository);
    await useCase.execute(id);
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao excluir produto.";
    return { success: false, error: message };
  }
}
