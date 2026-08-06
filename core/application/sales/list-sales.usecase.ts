import { Sale } from "@core/domain/sales/sale.entity";
import { SaleRepository } from "@core/domain/sales/sale.repository";

export class ListSales {
  constructor(private saleRepository: SaleRepository) {}

  async execute(filter?: {
    search?: string;
    paymentMethod?: string;
  }): Promise<Sale[]> {
    const sales = await this.saleRepository.findAll();

    if (!filter) return sales;

    return sales.filter((sale) => {
      if (filter.paymentMethod && sale.paymentMethod !== filter.paymentMethod) {
        return false;
      }
      return true;
    });
  }
}
