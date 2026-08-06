import { Client } from "../../domain/clients/client.entity";
import { ClientRepository } from "../../domain/clients/client.repository";

export class ListClients {
  constructor(private clientRepository: ClientRepository) {}

  async execute(): Promise<Client[]> {
    return this.clientRepository.findAll();
  }
}
