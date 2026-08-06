import { Service } from "../../domain/services/service.entity";
import { ServiceRepository } from "../../domain/services/service.repository";

export class ListServices {
  constructor(private serviceRepository: ServiceRepository) {}

  async execute(): Promise<Service[]> {
    return await this.serviceRepository.findAll();
  }
}
