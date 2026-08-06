import { SaleRepository } from "@core/domain/sales/sale.repository";

export class DeleteSale {
  constructor(private saleRepository: SaleRepository) {}

  async execute(id: string): Promise<void> {
    const sale = await this.saleRepository.findById(id);

    if (!sale) {
      throw new Error("Venda não encontrada.");
    }

    await this.saleRepository.deleteWithInventoryRestore(id);
  }
}
