import { Client } from "./Client";

export interface ClientRepository {
  save(client: Client): Promise<void>;
  findById(id: string): Promise<Client | null>;
  findByEmail(email: string): Promise<Client | null>;
  findAll(): Promise<Client[]>;
  update(client: Client): Promise<void>;
  delete(id: string): Promise<void>;
}
