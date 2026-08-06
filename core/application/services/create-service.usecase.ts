import { Service, ServiceProps } from "../../domain/services/service.entity";
import { ServiceRepository } from "../../domain/services/service.repository";

export class CreateService {
  constructor(private serviceRepository: ServiceRepository) {}

  async execute(props: ServiceProps): Promise<Service> {
    const existing = await this.serviceRepository.findByName(props.name);
    if (existing) {
      throw new Error("Já existe um serviço cadastrado com este nome.");
    }

    if (props.duration <= 0) {
      throw new Error("A duração deve ser maior que zero.");
    }

    if (props.price && props.price < 0) {
      throw new Error("O preço não pode ser negativo.");
    }

    const service = new Service(props);
    await this.serviceRepository.save(service);
    return service;
  }
}
