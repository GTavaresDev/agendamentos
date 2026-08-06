import { Sale } from "./sale.entity";

export interface SaleRepository {
  findAll(): Promise<Sale[]>;
  findById(id: string): Promise<Sale | null>;
  findByProductId(productId: string): Promise<Sale[]>;
  save(sale: Sale): Promise<Sale>;
  update(sale: Sale): Promise<Sale>;
  delete(id: string): Promise<void>;
  saveWithInventoryUpdate(sale: Sale, quantityDelta: number): Promise<Sale>;
  updateWithInventoryRecalculation(id: string, sale: Sale, oldQuantity: number): Promise<Sale>;
  deleteWithInventoryRestore(id: string): Promise<void>;
}
