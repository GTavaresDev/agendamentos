import { Service, ServiceProps } from "../../../../domain/services/Service";

type PersistenceService = {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number | null;
  status: string;
  color: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class ServiceMapper {
  static toDomain(raw: PersistenceService): Service {
    return new Service({
      id: raw.id,
      name: raw.name,
      description: raw.description || undefined,
      duration: raw.duration,
      price: raw.price || undefined,
      status: (raw.status as "Ativo" | "Inativo") || "Ativo",
      color: raw.color || undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(service: Service): PersistenceService {
    const props = service.toJSON();
    return {
      id: props.id,
      name: props.name,
      description: props.description || null,
      duration: props.duration,
      price: props.price || null,
      status: props.status,
      color: props.color || null,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
