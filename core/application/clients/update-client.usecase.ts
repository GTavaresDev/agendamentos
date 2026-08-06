import { Client } from "../../domain/clients/client.entity";
import { ClientRepository } from "../../domain/clients/client.repository";

export class UpdateClient {
  constructor(private clientRepository: ClientRepository) {}

  async execute(input: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    cpf?: string;
    birthDate?: string;
    status?: "Ativo" | "Inativo";
  }): Promise<Client> {
    const client = await this.clientRepository.findById(input.id);
    if (!client) {
      throw new Error("Cliente não encontrado.");
    }

    client.updateDetails(input);
    await this.clientRepository.update(client);
    return client;
  }
}
