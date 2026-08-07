import { ServiceRepository } from "@core/domain/services/service.repository";
import { UserRepository } from "@core/domain/users/user.repository";

/**
 * Serviço na visão do cliente. Deliberadamente SEM preço: o portal nunca
 * recebe valores, nem para esconder na interface.
 */
export interface BookableServiceDTO {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
}

/** Profissional na visão do cliente: sem cargo, permissões, e-mail ou telefone. */
export interface BookableProfessionalDTO {
  id: string;
  name: string;
  initials: string;
}

export class BookingCatalogError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BookingCatalogError";
  }
}

export class ListBookableServices {
  constructor(private serviceRepository: ServiceRepository) {}

  async execute(): Promise<BookableServiceDTO[]> {
    const services = await this.serviceRepository.findActive();
    return services.map((service) => ({
      id: service.id,
      name: service.name,
      description: service.description,
      durationMinutes: service.duration,
    }));
  }
}

/**
 * Profissionais habilitados para um serviço.
 *
 * O domínio ainda não relaciona Service ↔ User, então todo profissional ativo
 * é elegível. Quando a relação existir, o filtro entra aqui.
 */
export class ListBookableProfessionals {
  constructor(
    private userRepository: UserRepository,
    private serviceRepository: ServiceRepository,
  ) {}

  async execute(serviceId: string): Promise<BookableProfessionalDTO[]> {
    const service = await this.serviceRepository.findById(serviceId);
    if (!service || service.status !== "Ativo") {
      throw new BookingCatalogError("Serviço indisponível.");
    }

    const users = await this.userRepository.findAll();
    return users
      .filter((user) => user.status === "Ativo")
      .map((user) => ({
        id: user.id,
        name: user.name,
        initials: user.initials,
      }));
  }
}
