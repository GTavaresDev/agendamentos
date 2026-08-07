import { describe, expect, it } from "vitest";
import {
  buildAppointment,
  mockAppointmentRepository,
} from "@core/application/appointments/test-helpers";
import { buildService, mockServiceRepository } from "@core/application/services/test-helpers";
import { BookingCatalogError } from "./booking-catalog.usecase";
import { BOOKING_WINDOW_DAYS, GetBookingAvailability } from "./booking-availability.usecase";

const NOW = new Date(2026, 7, 15, 7, 0, 0);
const request = { serviceId: "sv1", clientId: "c1", clientName: "Maria Silva", now: NOW };

function setup() {
  const appointments = mockAppointmentRepository();
  const services = mockServiceRepository();
  services.findById.mockResolvedValue(buildService({ id: "sv1", duration: 45 }));
  appointments.findByDateRange.mockResolvedValue([]);
  appointments.findByDate.mockResolvedValue([]);
  return {
    appointments,
    services,
    useCase: new GetBookingAvailability(appointments, services),
  };
}

describe("GetBookingAvailability.listDates", () => {
  it("cobre a janela de agendamento a partir de hoje numa única consulta", async () => {
    const { appointments, useCase } = setup();

    const dates = await useCase.listDates(request);

    expect(appointments.findByDateRange).toHaveBeenCalledWith("2026-08-15", "2026-08-28");
    expect(dates).toHaveLength(BOOKING_WINDOW_DAYS);
    expect(dates[0]).toBe("2026-08-15");
  });

  it("omite dias sem nenhum horário livre", async () => {
    const { appointments, useCase } = setup();
    // Ocupa todos os blocos de 2026-08-16.
    appointments.findByDateRange.mockResolvedValue(
      [
        "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
        "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
        "17:00", "17:30",
      ].map((time) =>
        buildAppointment({ id: `a-${time}`, date: "2026-08-16", time, duration: "30 min" }),
      ),
    );

    const dates = await useCase.listDates(request);

    expect(dates).not.toContain("2026-08-16");
    expect(dates).toContain("2026-08-17");
  });

  it("recusa serviço inválido", async () => {
    const { services, useCase } = setup();
    services.findById.mockResolvedValue(null);

    await expect(useCase.listDates(request)).rejects.toThrow(BookingCatalogError);
  });
});

describe("GetBookingAvailability.listTimes", () => {
  it("devolve os horários livres da data", async () => {
    const { useCase } = setup();

    const times = await useCase.listTimes({ ...request, date: "2026-08-16" });

    expect(times).toContain("08:00");
    expect(times).not.toContain("17:30"); // 45 min não cabe no último bloco
  });

  it("não devolve horários para data passada ou fora da janela", async () => {
    const { useCase } = setup();

    expect(await useCase.listTimes({ ...request, date: "2026-08-14" })).toEqual([]);
    expect(await useCase.listTimes({ ...request, date: "2027-01-01" })).toEqual([]);
  });

  it("recusa data em formato inválido", async () => {
    const { useCase } = setup();

    await expect(
      useCase.listTimes({ ...request, date: "16/08/2026" }),
    ).rejects.toThrow(BookingCatalogError);
  });
});
