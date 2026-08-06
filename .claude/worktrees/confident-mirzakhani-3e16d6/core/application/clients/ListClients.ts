import { Client } from "../../domain/clients/Client";
import { ClientRepository } from "../../domain/clients/ClientRepository";

export class ListClients {
  constructor(private clientRepository: ClientRepository) {}

  async execute(): Promise<Client[]> {
    return this.clientRepository.findAll();
  }
}
