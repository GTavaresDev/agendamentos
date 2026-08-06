import { Product } from "./Product";

export interface ProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  save(product: Product): Promise<Product>;
  update(product: Product): Promise<Product>;
  delete(id: string): Promise<void>;
}
