import { describe, expect, it } from "vitest";
import { buildService, mockServiceRepository } from "@core/application/services/test-helpers";
import { buildUser, mockUserRepository } from "@core/application/users/test-helpers";
import {
  BookingCatalogError,
  ListBookableProfessionals,
  ListBookableServices,
} from "./booking-catalog.usecase";

describe("ListBookableServices", () => {
  it("nunca devolve preço ao cliente", async () => {
    const repo = mockServiceRepository();
    repo.findActive.mockResolvedValue([
      buildService({ id: "sv1", name: "Botox", duration: 45, price: 850 }),
    ]);

    const services = await new ListBookableServices(repo).execute();

    expect(services).toEqual([
      { id: "sv1", name: "Botox", description: "", durationMinutes: 45 },
    ]);
    expect(JSON.stringify(services)).not.toContain("850");
    expect(Object.keys(services[0])).not.toContain("price");
  });

  it("lista apenas serviços ativos", async () => {
    const repo = mockServiceRepository();
    repo.findActive.mockResolvedValue([]);

    await new ListBookableServices(repo).execute();

    expect(repo.findActive).toHaveBeenCalledTimes(1);
    expect(repo.findAll).not.toHaveBeenCalled();
  });
});

describe("ListBookableProfessionals", () => {
  it("devolve só nome e iniciais dos profissionais ativos", async () => {
    const users = mockUserRepository();
    const services = mockServiceRepository();
    services.findById.mockResolvedValue(buildService());
    users.findAll.mockResolvedValue([
      buildUser({ id: "u1", name: "Gabriel Tavares", initials: "GT", role: "Administrador" }),
      buildUser({ id: "u2", name: "Inativo", status: "Inativo" }),
    ]);

    const list = await new ListBookableProfessionals(users, services).execute("sv1");

    expect(list).toEqual([{ id: "u1", name: "Gabriel Tavares", initials: "GT" }]);
    const serialized = JSON.stringify(list);
    expect(serialized).not.toContain("Administrador");
    expect(serialized).not.toContain("@example.com");
    expect(serialized).not.toContain("$2a$");
  });

  it("recusa serviço inexistente ou inativo", async () => {
    const users = mockUserRepository();
    const services = mockServiceRepository();
    services.findById.mockResolvedValue(null);

    await expect(
      new ListBookableProfessionals(users, services).execute("sv-desconhecido"),
    ).rejects.toThrow(BookingCatalogError);

    services.findById.mockResolvedValue(buildService({ status: "Inativo" }));
    await expect(
      new ListBookableProfessionals(users, services).execute("sv1"),
    ).rejects.toThrow(BookingCatalogError);
  });
});
