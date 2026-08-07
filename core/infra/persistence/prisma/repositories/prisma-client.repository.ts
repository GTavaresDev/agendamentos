import { prisma } from "../client";
import { Client } from "../../../../domain/clients/client.entity";
import { ClientRepository } from "../../../../domain/clients/client.repository";
import { ClientMapper } from "../mappers/client.mapper";

export class PrismaClientRepository implements ClientRepository {
  async save(client: Client): Promise<void> {
    const raw = ClientMapper.toPersistence(client);
    await prisma.client.create({
      data: raw,
    });
  }

  async findById(id: string): Promise<Client | null> {
    try {
      const raw = await prisma.client.findUnique({
        where: { id },
      });
      return raw ? ClientMapper.toDomain(raw) : null;
    } catch (error) {
      console.error("[PrismaClientRepository.findById] Database query failed:", error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<Client | null> {
    try {
      const raw = await prisma.client.findUnique({
        where: { email },
      });
      return raw ? ClientMapper.toDomain(raw) : null;
    } catch (error) {
      console.error("[PrismaClientRepository.findByEmail] Database query failed:", error);
      throw error;
    }
  }

  async findAll(): Promise<Client[]> {
    try {
      const list = await prisma.client.findMany({
        orderBy: { name: "asc" },
      });
      return list.map(ClientMapper.toDomain);
    } catch (error) {
      console.error("[PrismaClientRepository.findAll] Database query failed:", error);
      throw error;
    }
  }

  async update(client: Client): Promise<void> {
    const raw = ClientMapper.toPersistence(client);
    await prisma.client.update({
      where: { id: client.id },
      data: {
        name: raw.name,
        email: raw.email,
        phone: raw.phone,
        password: raw.password,
        cpf: raw.cpf,
        birthDate: raw.birthDate,
        status: raw.status,
        initials: raw.initials,
        updatedAt: raw.updatedAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.client.delete({
      where: { id },
    });
  }
}
