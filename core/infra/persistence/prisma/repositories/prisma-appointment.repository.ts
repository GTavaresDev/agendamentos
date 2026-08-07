import { prisma } from "../client";
import { Appointment } from "@core/domain/appointments/appointment.entity";
import { AppointmentRepository } from "@core/domain/appointments/appointment.repository";
import { AppointmentMapper } from "../mappers/appointment.mapper";

const withRelations = {
  user: { select: { name: true as const, role: true as const } },
  serviceRecord: { select: { price: true as const, color: true as const } },
};

export class PrismaAppointmentRepository implements AppointmentRepository {
  async findAll(): Promise<Appointment[]> {
    try {
      const records = await prisma.appointment.findMany({
        include: withRelations,
        orderBy: [{ date: "asc" }, { time: "asc" }],
      });
      return records.map(AppointmentMapper.toDomain);
    } catch (error) {
      console.error("[PrismaAppointmentRepository.findAll] Database query failed:", error);
      throw error;
    }
  }

  async findByDate(date: string): Promise<Appointment[]> {
    try {
      const records = await prisma.appointment.findMany({
        where: { date },
        include: withRelations,
        orderBy: { time: "asc" },
      });
      return records.map(AppointmentMapper.toDomain);
    } catch (error) {
      console.error("[PrismaAppointmentRepository.findByDate] Database query failed:", error);
      throw error;
    }
  }

  async findByDateRange(startDate: string, endDate: string): Promise<Appointment[]> {
    try {
      const records = await prisma.appointment.findMany({
        where: { date: { gte: startDate, lte: endDate } },
        include: withRelations,
        orderBy: [{ date: "asc" }, { time: "asc" }],
      });
      return records.map(AppointmentMapper.toDomain);
    } catch (error) {
      console.error("[PrismaAppointmentRepository.findByDateRange] Database query failed:", error);
      throw error;
    }
  }

  async findByClientId(clientId: string): Promise<Appointment[]> {
    try {
      const records = await prisma.appointment.findMany({
        where: { clientId },
        include: withRelations,
        orderBy: [{ date: "desc" }, { time: "desc" }],
      });
      return records.map(AppointmentMapper.toDomain);
    } catch (error) {
      console.error("[PrismaAppointmentRepository.findByClientId] Database query failed:", error);
      throw error;
    }
  }

  async findByIdAndClientId(id: string, clientId: string): Promise<Appointment | null> {
    try {
      // A posse faz parte do WHERE: nunca busque só por id no portal do cliente.
      const record = await prisma.appointment.findFirst({
        where: { id, clientId },
        include: withRelations,
      });
      return record ? AppointmentMapper.toDomain(record) : null;
    } catch (error) {
      console.error(
        "[PrismaAppointmentRepository.findByIdAndClientId] Database query failed:",
        error,
      );
      throw error;
    }
  }

  async findById(id: string): Promise<Appointment | null> {
    try {
      const record = await prisma.appointment.findUnique({
        where: { id },
        include: withRelations,
      });
      return record ? AppointmentMapper.toDomain(record) : null;
    } catch (error) {
      console.error("[PrismaAppointmentRepository.findById] Database query failed:", error);
      throw error;
    }
  }

  async save(appointment: Appointment): Promise<Appointment> {
    const raw = AppointmentMapper.toPersistence(appointment);
    const created = await prisma.appointment.create({
      data: {
        id: raw.id,
        date: raw.date,
        time: raw.time,
        name: raw.name,
        service: raw.service,
        duration: raw.duration,
        status: raw.status,
        initials: raw.initials,
        channelId: raw.channelId,
        notes: raw.notes,
        userId: raw.userId,
        clientId: raw.clientId,
        serviceId: raw.serviceId,
      },
      include: withRelations,
    });
    return AppointmentMapper.toDomain(created);
  }

  async update(appointment: Appointment): Promise<Appointment> {
    const raw = AppointmentMapper.toPersistence(appointment);
    const updated = await prisma.appointment.update({
      where: { id: raw.id },
      data: {
        date: raw.date,
        time: raw.time,
        name: raw.name,
        service: raw.service,
        duration: raw.duration,
        status: raw.status,
        initials: raw.initials,
        channelId: raw.channelId,
        notes: raw.notes,
        userId: raw.userId,
        clientId: raw.clientId,
        serviceId: raw.serviceId,
      },
      include: withRelations,
    });
    return AppointmentMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.appointment.delete({ where: { id } });
  }
}
