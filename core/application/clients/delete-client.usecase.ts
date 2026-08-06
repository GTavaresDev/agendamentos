import { ClientRepository } from "../../domain/clients/client.repository";

export class DeleteClient {
  constructor(private clientRepository: ClientRepository) {}

  async execute(id: string): Promise<void> {
    const client = await this.clientRepository.findById(id);
    if (!client) {
      throw new Error("Cliente não encontrado.");
    }

    await this.clientRepository.delete(id);
  }
}
