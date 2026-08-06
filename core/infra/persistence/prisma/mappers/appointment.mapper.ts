import { Appointment as PrismaAppointmentModel, User as PrismaUserModel } from "@prisma/client";
import { Appointment } from "@core/domain/appointments/appointment.entity";

type AppointmentWithRelations = PrismaAppointmentModel & {
  user?: Pick<PrismaUserModel, "name" | "role"> | null;
  serviceRecord?: { price: number | null; color: string | null } | null;
};

export class AppointmentMapper {
  public static toDomain(raw: AppointmentWithRelations): Appointment {
    return new Appointment({
      id: raw.id,
      date: raw.date,
      time: raw.time,
      name: raw.name,
      service: raw.service,
      duration: raw.duration,
      status: raw.status as "Confirmado" | "Pendente" | "Concluído" | "Cancelado",
      initials: raw.initials,
      channelId: raw.channelId,
      notes: raw.notes,
      userId: raw.userId,
      clientId: raw.clientId,
      serviceId: raw.serviceId,
      servicePrice: raw.serviceRecord?.price || null,
      serviceColor: raw.serviceRecord?.color || null,
      userName: raw.user?.name || null,
      userRole: raw.user?.role || null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  public static toPersistence(appointment: Appointment): {
    id: string;
    date: string;
    time: string;
    name: string;
    service: string | null;
    duration: string;
    status: string;
    initials: string;
    channelId: string;
    notes: string | null;
    userId: string | null;
    clientId: string | null;
    serviceId?: string | null;
  } {
    return {
      id: appointment.id,
      date: appointment.date,
      time: appointment.time,
      name: appointment.name,
      service: appointment.service,
      duration: appointment.duration,
      status: appointment.status,
      initials: appointment.initials,
      channelId: appointment.channelId,
      notes: appointment.notes || null,
      userId: appointment.userId || null,
      clientId: appointment.clientId || null,
      serviceId: appointment.serviceId || null,
    };
  }
}
