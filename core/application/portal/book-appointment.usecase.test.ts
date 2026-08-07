import { beforeEach, describe, expect, it, type Mocked } from "vitest";
import {
  buildAppointment,
  mockAppointmentRepository,
} from "@core/application/appointments/test-helpers";
import { buildClient, mockClientRepository } from "@core/application/clients/test-helpers";
import { buildService, mockServiceRepository } from "@core/application/services/test-helpers";
import { buildUser, mockUserRepository } from "@core/application/users/test-helpers";
import type { Appointment } from "@core/domain/appointments/appointment.entity";
import type { AppointmentRepository } from "@core/domain/appointments/appointment.repository";
import { BookClientAppointment, BookingError } from "./book-appointment.usecase";

const DATE = "2026-08-15";
const NOW = new Date(2026, 7, 15, 7, 0, 0);

function setup() {
  const appointments = mockAppointmentRepository() as Mocked<AppointmentRepository>;
  const services = mockServiceRepository();
  const users = mockUserRepository();
  const clients = mockClientRepository();

  appointments.findByDate.mockResolvedValue([]);
  appointments.save.mockImplementation(async (appointment: Appointment) => appointment);
  services.findById.mockResolvedValue(
    buildService({ id: "sv1", name: "Botox", duration: 45, price: 850 }),
  );
  users.findById.mockResolvedValue(
    buildUser({ id: "u1", name: "Gabriel Tavares", initials: "GT" }),
  );
  clients.findById.mockResolvedValue(buildClient({ id: "c1", name: "Maria Silva" }));

  const useCase = new BookClientAppointment(appointments, services, users, clients);
  return { appointments, services, users, clients, useCase };
}

const request = {
  clientId: "c1",
  serviceId: "sv1",
  professionalId: "u1",
  date: DATE,
  time: "14:30",
  now: NOW,
};

describe("BookClientAppointment", () => {
  let context: ReturnType<typeof setup>;

  beforeEach(() => {
    context = setup();
  });

  it("agenda vinculando o cliente da sessão e o profissional escolhido", async () => {
    const result = await context.useCase.execute(request);

    const saved = context.appointments.save.mock.calls[0][0];
    expect(saved.clientId).toBe("c1");
    expect(saved.userId).toBe("u1");
    expect(saved.serviceId).toBe("sv1");
    expect(saved.name).toBe("Maria Silva");
    // 45 min ocupa dois blocos de 30.
    expect(saved.duration).toBe("60 min (1h)");
    expect(saved.status).toBe("Pendente");
    expect(result.serviceName).toBe("Botox");
  });

  it("não devolve preço nem dados internos no retorno", async () => {
    const result = await context.useCase.execute(request);

    expect(Object.keys(result).sort()).toEqual([
      "canCancel",
      "date",
      "duration",
      "id",
      "professionalName",
      "serviceName",
      "status",
      "time",
    ]);
    expect(JSON.stringify(result)).not.toContain("850");
  });

  it("recusa horário já ocupado (duas reservas no mesmo bloco)", async () => {
    context.appointments.findByDate.mockResolvedValue([
      buildAppointment({ date: DATE, time: "15:00", duration: "30 min", clientId: "outro" }),
    ]);

    await expect(context.useCase.execute(request)).rejects.toThrow(BookingError);
    expect(context.appointments.save).not.toHaveBeenCalled();
  });

  it("recusa horário no passado", async () => {
    await expect(
      context.useCase.execute({ ...request, now: new Date(2026, 7, 15, 16, 0, 0) }),
    ).rejects.toThrow(BookingError);
    expect(context.appointments.save).not.toHaveBeenCalled();
  });

  it("recusa data anterior a hoje", async () => {
    await expect(
      context.useCase.execute({ ...request, date: "2026-08-14" }),
    ).rejects.toThrow(BookingError);
    expect(context.appointments.save).not.toHaveBeenCalled();
  });

  it("recusa serviço inativo", async () => {
    context.services.findById.mockResolvedValue(buildService({ status: "Inativo" }));

    await expect(context.useCase.execute(request)).rejects.toThrow(/Serviço indisponível/);
  });

  it("recusa profissional inexistente", async () => {
    context.users.findById.mockResolvedValue(null);

    await expect(context.useCase.execute(request)).rejects.toThrow(/Profissional indisponível/);
  });

  it("recusa cliente inativo", async () => {
    context.clients.findById.mockResolvedValue(
      buildClient({ id: "c1", status: "Inativo" }),
    );

    await expect(context.useCase.execute(request)).rejects.toThrow(/não está ativa/);
  });

  it("recusa cadastro incompleto mesmo se a requisição pular a tela", async () => {
    context.clients.findById.mockResolvedValue(
      buildClient({ id: "c1", phone: "", birthDate: "" }),
    );

    await expect(context.useCase.execute(request)).rejects.toThrow(
      /Complete seu cadastro/i,
    );
    expect(context.appointments.save).not.toHaveBeenCalled();
  });

  it("recusa quem tem telefone mas nunca informou o nascimento", async () => {
    context.clients.findById.mockResolvedValue(
      buildClient({ id: "c1", phone: "11994279139", birthDate: "" }),
    );

    await expect(context.useCase.execute(request)).rejects.toBeInstanceOf(BookingError);
    expect(context.appointments.save).not.toHaveBeenCalled();
  });

  it("recusa quando o próprio cliente já tem atendimento no horário", async () => {
    context.appointments.findByDate.mockResolvedValue([
      buildAppointment({
        id: "outro",
        date: DATE,
        time: "14:30",
        duration: "30 min",
        clientId: "c1",
        name: "Maria Silva",
      }),
    ]);

    await expect(context.useCase.execute(request)).rejects.toThrow(BookingError);
  });
});
