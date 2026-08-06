import { Client as PrismaClientModel } from "@prisma/client";
import { Client } from "../../../../domain/clients/Client";

export class ClientMapper {
  static toDomain(raw: PrismaClientModel): Client {
    return new Client({
      id: raw.id,
      name: raw.name,
      email: raw.email,
      phone: raw.phone,
      cpf: raw.cpf || "",
      birthDate: raw.birthDate || "",
      status: (raw.status as "Ativo" | "Inativo") || "Ativo",
      initials: raw.initials,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(client: Client) {
    return {
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      cpf: client.cpf || null,
      birthDate: client.birthDate || null,
      status: client.status,
      initials: client.initials,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    };
  }
}
