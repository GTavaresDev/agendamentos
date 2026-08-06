import { Service, ServiceProps } from "../../domain/services/service.entity";
import { ServiceRepository } from "../../domain/services/service.repository";

export class UpdateService {
  constructor(private serviceRepository: ServiceRepository) {}

  async execute(input: { id: string } & Partial<Omit<ServiceProps, "id" | "createdAt">>): Promise<Service> {
    const service = await this.serviceRepository.findById(input.id);
    if (!service) {
      throw new Error("Serviço não encontrado.");
    }

    if (input.name) {
      const existing = await this.serviceRepository.findByName(input.name);
      if (existing && existing.id !== input.id) {
        throw new Error("Já existe um serviço com este nome.");
      }
    }

    if (input.duration !== undefined && input.duration <= 0) {
      throw new Error("A duração deve ser maior que zero.");
    }

    if (input.price !== undefined && input.price < 0) {
      throw new Error("O preço não pode ser negativo.");
    }

    service.updateDetails(input);
    await this.serviceRepository.update(service);
    return service;
  }
}
