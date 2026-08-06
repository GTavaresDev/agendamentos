import { Service } from "../../domain/services/Service";
import { ServiceRepository } from "../../domain/services/ServiceRepository";

export class ListServices {
  constructor(private serviceRepository: ServiceRepository) {}

  async execute(): Promise<Service[]> {
    return await this.serviceRepository.findAll();
  }
}
