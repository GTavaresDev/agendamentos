import { Client, ClientProps } from "../../domain/clients/Client";
import { ClientRepository } from "../../domain/clients/ClientRepository";

export class CreateClient {
  constructor(private clientRepository: ClientRepository) {}

  async execute(props: ClientProps): Promise<Client> {
    const existing = await this.clientRepository.findByEmail(props.email);
    if (existing) {
      throw new Error("Já existe um cliente cadastrado com este e-mail.");
    }

    const client = new Client(props);
    await this.clientRepository.save(client);
    return client;
  }
}
