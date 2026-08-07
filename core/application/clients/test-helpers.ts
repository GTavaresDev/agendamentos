import { vi, type Mocked } from "vitest";
import { Client, type ClientProps } from "@core/domain/clients/client.entity";
import type { ClientRepository } from "@core/domain/clients/client.repository";

export function buildClient(overrides: Partial<ClientProps> = {}): Client {
  return new Client({
    id: "c1",
    name: "Maria Silva",
    email: "maria@example.com",
    phone: "11999999999",
    // Cadastro completo por padrão; testes de bloqueio sobrescrevem.
    birthDate: "1995-01-15",
    ...overrides,
  });
}

export function mockClientRepository(): Mocked<ClientRepository> {
  return {
    save: vi.fn(),
    findById: vi.fn(),
    findByEmail: vi.fn(),
    findAll: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  } as unknown as Mocked<ClientRepository>;
}
