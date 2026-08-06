import { Service } from "./service.entity";

export interface ServiceRepository {
  save(service: Service): Promise<void>;
  findById(id: string): Promise<Service | null>;
  findByName(name: string): Promise<Service | null>;
  findAll(): Promise<Service[]>;
  findActive(): Promise<Service[]>;
  update(service: Service): Promise<void>;
  delete(id: string): Promise<void>;
}
