import { prisma } from "../client";
import { Appointment } from "@core/domain/appointments/Appointment";
import { AppointmentRepository } from "@core/domain/appointments/AppointmentRepository";
import { AppointmentMapper } from "../mappers/AppointmentMapper";

const withUser = {
  user: { select: { name: true as const, role: true as const } },
};

export class PrismaAppointmentRepository implements AppointmentRepository {
  async findAll(): Promise<Appointment[]> {
    try {
      const records = await prisma.appointment.findMany({
        include: withUser,
        orderBy: [{ date: "asc" }, { time: "asc" }],
      });
      return records.map(AppointmentMapper.toDomain);
    } catch {
      return [];
    }
  }

  async findByDate(date: string): Promise<Appointment[]> {
    try {
      const records = await prisma.appointment.findMany({
        where: { date },
        include: withUser,
        orderBy: { time: "asc" },
      });
      return records.map(AppointmentMapper.toDomain);
    } catch {
      return [];
    }
  }

  async findById(id: string): Promise<Appointment | null> {
    try {
      const record = await prisma.appointment.findUnique({
        where: { id },
        include: withUser,
      });
      return record ? AppointmentMapper.toDomain(record) : null;
    } catch {
      return null;
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
      include: withUser,
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
      include: withUser,
    });
    return AppointmentMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.appointment.delete({ where: { id } });
  }
}
