import { AppointmentRepository } from "@core/domain/appointments/appointment.repository";
import { UserRepository } from "@core/domain/users/user.repository";
import { ClientRepository } from "@core/domain/clients/client.repository";

export interface DashboardMetrics {
  todayAppointmentsCount: number;
  totalSlotsToday: number;
  activeClientsCount: number;
  activeUsersCount: number;
  newClientsCount: number;
  attendanceRate: number;
  occupiedHoursText: string;
  occupiedProgress: number;
}

const TOTAL_SLOTS_PER_DAY = 8;

function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export class GetDashboardMetrics {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private userRepository: UserRepository,
    private clientRepository?: ClientRepository,
  ) {}

  async execute(): Promise<DashboardMetrics> {
    const appointments = await this.appointmentRepository.findAll();
    const users = await this.userRepository.findAll();
    const clients = this.clientRepository ? await this.clientRepository.findAll() : [];

    const today = getTodayIsoDate();
    const todayAppointments = appointments.filter((a) => a.date === today);
    const todayActiveAppointments = todayAppointments.filter(
      (a) => a.status === "Confirmado" || a.status === "Concluído",
    );
    const todayCount = todayActiveAppointments.length;

    const activeUsers = users.filter((u) => u.status === "Ativo");
    const activeClients = clients.filter((c) => c.status === "Ativo");

    const activeCount = activeUsers.length;
    const clientCount = activeClients.length;

    const newClientsCount = clients.filter((c) => {
      const createdAt = c.createdAt;
      if (!createdAt) return false;
      const createdDate = new Date(createdAt);
      const now = new Date();
      return (
        createdDate.getFullYear() === now.getFullYear() &&
        createdDate.getMonth() === now.getMonth()
      );
    }).length;

    const completedToday = todayAppointments.filter((a) => a.status === "Concluído").length;
    const rate =
      todayAppointments.length > 0
        ? Math.round((completedToday / todayAppointments.length) * 100)
        : 0;

    return {
      todayAppointmentsCount: todayCount,
      totalSlotsToday: TOTAL_SLOTS_PER_DAY,
      activeClientsCount: clientCount,
      activeUsersCount: activeCount,
      newClientsCount,
      attendanceRate: rate,
      occupiedHoursText: `${Math.round(todayCount * 0.7)}h30`,
      occupiedProgress: Math.min(
        100,
        Math.round((todayCount / TOTAL_SLOTS_PER_DAY) * 100),
      ),
    };
  }
}
