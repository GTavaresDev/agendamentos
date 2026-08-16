import { prisma } from "../client";
import { Service } from "../../../../domain/services/service.entity";
import { ServiceRepository } from "../../../../domain/services/service.repository";
import { ServiceMapper } from "../mappers/service.mapper";
import { CacheKeys, CacheTTL, getCached, invalidate } from "../../../cache";

/** Toda escrita derruba as duas listas: `findActive` é um recorte de `findAll`. */
const SERVICE_KEYS = [CacheKeys.services, CacheKeys.servicesActive];

export class PrismaServiceRepository implements ServiceRepository {
  async save(service: Service): Promise<void> {
    const raw = ServiceMapper.toPersistence(service);
    await prisma.service.create({
      data: raw,
    });
    await invalidate(...SERVICE_KEYS);
  }

  async findById(id: string): Promise<Service | null> {
    try {
      const raw = await prisma.service.findUnique({
        where: { id },
      });
      return raw ? ServiceMapper.toDomain(raw) : null;
    } catch (error) {
      console.error("[PrismaServiceRepository.findById] Database query failed:", error);
      throw error;
    }
  }

  async findByName(name: string): Promise<Service | null> {
    try {
      const raw = await prisma.service.findFirst({
        where: { name: { equals: name, mode: "insensitive" } },
      });
      return raw ? ServiceMapper.toDomain(raw) : null;
    } catch (error) {
      console.error("[PrismaServiceRepository.findByName] Database query failed:", error);
      throw error;
    }
  }

  async findAll(): Promise<Service[]> {
    try {
      const list = await getCached(CacheKeys.services, CacheTTL.services, () =>
        prisma.service.findMany({
          orderBy: { name: "asc" },
        }),
      );
      return list.map(ServiceMapper.toDomain);
    } catch (error) {
      console.error("[PrismaServiceRepository.findAll] Database query failed:", error);
      throw error;
    }
  }

  async findActive(): Promise<Service[]> {
    try {
      const list = await getCached(CacheKeys.servicesActive, CacheTTL.services, () =>
        prisma.service.findMany({
          where: { status: "Ativo" },
          orderBy: { name: "asc" },
        }),
      );
      return list.map(ServiceMapper.toDomain);
    } catch (error) {
      console.error("[PrismaServiceRepository.findActive] Database query failed:", error);
      throw error;
    }
  }

  async update(service: Service): Promise<void> {
    const raw = ServiceMapper.toPersistence(service);
    await prisma.service.update({
      where: { id: service.id },
      data: {
        name: raw.name,
        description: raw.description,
        duration: raw.duration,
        price: raw.price,
        status: raw.status,
        color: raw.color,
        updatedAt: raw.updatedAt,
      },
    });
    await invalidate(...SERVICE_KEYS);
  }

  async delete(id: string): Promise<void> {
    await prisma.service.delete({
      where: { id },
    });
    await invalidate(...SERVICE_KEYS);
  }
}
