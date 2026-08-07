import { CreateAppointment } from "@core/application/appointments/create-appointment.usecase";
import { durationLabelFromMinutes } from "@core/domain/appointments/appointment-duration";
import { AppointmentRepository } from "@core/domain/appointments/appointment.repository";
import { findAvailableStartTimes } from "@core/domain/appointments/availability.business-rule";
import { ClientRepository } from "@core/domain/clients/client.repository";
import { ServiceRepository } from "@core/domain/services/service.repository";
import { UserRepository } from "@core/domain/users/user.repository";
import { toClientAppointmentDTO, type ClientAppointmentDTO } from "./client-appointments.usecase";

export class BookingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BookingError";
  }
}

export interface BookClientAppointmentInput {
  /** Sempre vem da sessão — nunca do formulário. */
  clientId: string;
  serviceId: string;
  professionalId: string;
  date: string;
  time: string;
  now?: Date;
}

/**
 * Cria o agendamento feito pelo próprio cliente.
 *
 * Revalida a disponibilidade imediatamente antes de gravar: o horário que veio
 * do navegador não é confiável e pode ter sido ocupado no meio do fluxo.
 * A serialização entre dois clientes simultâneos é feita pelo chamador
 * (trava por dia), e o CreateAppointment ainda aplica o conflito de agenda do
 * cliente como última barreira.
 */
export class BookClientAppointment {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private serviceRepository: ServiceRepository,
    private userRepository: UserRepository,
    private clientRepository: ClientRepository,
  ) {}

  async execute(input: BookClientAppointmentInput): Promise<ClientAppointmentDTO> {
    const now = input.now ?? new Date();

    const client = await this.clientRepository.findById(input.clientId);
    if (!client || client.status !== "Ativo") {
      throw new BookingError("Sua conta não está ativa. Entre em contato com a clínica.");
    }

    const service = await this.serviceRepository.findById(input.serviceId);
    if (!service || service.status !== "Ativo") {
      throw new BookingError("Serviço indisponível.");
    }

    const professional = await this.userRepository.findById(input.professionalId);
    if (!professional || professional.status !== "Ativo") {
      throw new BookingError("Profissional indisponível.");
    }

    const dayAppointments = await this.appointmentRepository.findByDate(input.date);
    const available = findAvailableStartTimes(
      dayAppointments.map((appointment) => appointment.toJSON()),
      {
        date: input.date,
        serviceMinutes: service.duration,
        clientId: client.id,
        clientName: client.name,
        now,
      },
    );

    if (!available.includes(input.time)) {
      throw new BookingError(
        "Este horário não está mais disponível. Escolha outro horário.",
      );
    }

    const created = await new CreateAppointment(this.appointmentRepository).execute({
      date: input.date,
      time: input.time,
      name: client.name,
      service: service.name,
      serviceId: service.id,
      duration: durationLabelFromMinutes(service.duration),
      // Agendamento feito pelo cliente entra para confirmação da clínica.
      status: "Pendente",
      channelId: "site",
      clientId: client.id,
      userId: professional.id,
    });

    return toClientAppointmentDTO(created, now);
  }
}
