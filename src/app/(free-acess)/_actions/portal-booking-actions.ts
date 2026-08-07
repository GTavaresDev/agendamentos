"use server";

import { z } from "zod";
import {
  BookClientAppointment,
  BookingError,
} from "@core/application/portal/book-appointment.usecase";
import { GetBookingAvailability } from "@core/application/portal/booking-availability.usecase";
import {
  BookingCatalogError,
  ListBookableProfessionals,
  ListBookableServices,
  type BookableProfessionalDTO,
  type BookableServiceDTO,
} from "@core/application/portal/booking-catalog.usecase";
import type { ClientAppointmentDTO } from "@core/application/portal/client-appointments.usecase";
import { withDayLock } from "@core/infra/persistence/prisma/day-lock";
import { PrismaAppointmentRepository } from "@core/infra/persistence/prisma/repositories/prisma-appointment.repository";
import { PrismaClientRepository } from "@core/infra/persistence/prisma/repositories/prisma-client.repository";
import { PrismaServiceRepository } from "@core/infra/persistence/prisma/repositories/prisma-service.repository";
import { PrismaUserRepository } from "@core/infra/persistence/prisma/repositories/prisma-user.repository";
import { formatActionError } from "@/lib/action-error-handler";
import { requireClientSession } from "@/lib/client-session";

const appointmentRepository = new PrismaAppointmentRepository();
const serviceRepository = new PrismaServiceRepository();
const userRepository = new PrismaUserRepository();
const clientRepository = new PrismaClientRepository();

// Ids do banco não são só uuid (o seed usa "srv-1"), então valida formato genérico.
const idSchema = z.string().trim().min(1).max(64);
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const timeSchema = z.string().regex(/^\d{2}:\d{2}$/);

/** Serviços disponíveis para agendamento — a resposta nunca carrega preço. */
export async function getBookableServicesAction(): Promise<BookableServiceDTO[]> {
  await requireClientSession();
  return new ListBookableServices(serviceRepository).execute();
}

export async function getProfessionalsForServiceAction(
  serviceId: string,
): Promise<BookableProfessionalDTO[]> {
  await requireClientSession();
  if (!idSchema.safeParse(serviceId).success) {
    return [];
  }

  try {
    return await new ListBookableProfessionals(userRepository, serviceRepository).execute(
      serviceId,
    );
  } catch (error) {
    if (error instanceof BookingCatalogError) {
      return [];
    }
    throw error;
  }
}

export async function getAvailableDatesAction(serviceId: string): Promise<string[]> {
  const session = await requireClientSession();
  if (!idSchema.safeParse(serviceId).success) {
    return [];
  }

  try {
    return await new GetBookingAvailability(appointmentRepository, serviceRepository).listDates({
      serviceId,
      clientId: session.clientId,
      clientName: session.name,
    });
  } catch (error) {
    if (error instanceof BookingCatalogError) {
      return [];
    }
    throw error;
  }
}

export async function getAvailableTimesAction(
  serviceId: string,
  date: string,
): Promise<string[]> {
  const session = await requireClientSession();
  if (!idSchema.safeParse(serviceId).success || !dateSchema.safeParse(date).success) {
    return [];
  }

  try {
    return await new GetBookingAvailability(appointmentRepository, serviceRepository).listTimes({
      serviceId,
      date,
      clientId: session.clientId,
      clientName: session.name,
    });
  } catch (error) {
    if (error instanceof BookingCatalogError) {
      return [];
    }
    throw error;
  }
}

const bookingSchema = z.object({
  serviceId: idSchema,
  professionalId: idSchema,
  date: dateSchema,
  time: timeSchema,
});

/**
 * Cria o agendamento do cliente autenticado.
 *
 * O cliente vem SEMPRE da sessão: um clientId enviado pelo formulário é
 * ignorado. A disponibilidade é revalidada dentro da trava do dia.
 */
export async function createClientAppointmentAction(input: {
  serviceId: string;
  professionalId: string;
  date: string;
  time: string;
}): Promise<{ success: boolean; data?: ClientAppointmentDTO; error?: string }> {
  try {
    const session = await requireClientSession();
    const parsed = bookingSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Dados do agendamento inválidos." };
    }

    const useCase = new BookClientAppointment(
      appointmentRepository,
      serviceRepository,
      userRepository,
      clientRepository,
    );

    const created = await withDayLock(parsed.data.date, () =>
      useCase.execute({
        clientId: session.clientId,
        serviceId: parsed.data.serviceId,
        professionalId: parsed.data.professionalId,
        date: parsed.data.date,
        time: parsed.data.time,
      }),
    );

    return { success: true, data: created };
  } catch (error) {
    if (error instanceof BookingError || error instanceof BookingCatalogError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: formatActionError(error, "Não foi possível agendar.") };
  }
}
