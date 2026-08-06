import { AppointmentRepository } from "@core/domain/appointments/AppointmentRepository";
import { UserRepository } from "@core/domain/users/UserRepository";

export interface ReportMetrics {
  totalAppointments: number;
  estimatedRevenue: string;
  attendanceRate: string;
  occupancyRate: string;
  completedAppointments: number;
  confirmedAppointments: number;
  canceledAppointments: number;
  pendingAppointments: number;
  topClients: Array<{
    name: string;
    initials: string;
    visits: number;
    spent: string;
    last: string;
    status: string;
  }>;
  professionals: Array<{
    name: string;
    initials: string;
    appointments: number;
    presence: string;
    occupancy: string;
    revenue: string;
    score: string;
  }>;
  monthlyData: Array<{
    month: string;
    agendamentos: number;
    cancelados: number;
    receita: number;
  }>;
  statusData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  servicesData: Array<{
    name: string;
    total: number;
    receita: string;
  }>;
  hourlyData: Array<{
    hour: string;
    ocupacao: number;
  }>;
  weeklyData: Array<{
    day: string;
    values: number[];
  }>;
  channelsData: Array<{
    name: string;
    value: number;
    percent: number;
    digital: boolean;
  }>;
  peakHour: string;
}

const WORK_HOURS = ["08", "09", "10", "11", "13", "14", "15", "16", "17"];
const WORK_DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const TIME_SLOTS = ["08–09", "09–10", "10–11", "13–14", "14–15", "15–16", "16–18"];

export class GetReportMetrics {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private userRepository: UserRepository,
  ) {}

  private getDateRange(period?: string): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();

    switch (period) {
      case "Este mês":
        start.setDate(1);
        break;
      case "Últimos 3 meses":
        start.setMonth(start.getMonth() - 3);
        break;
      case "Últimos 6 meses":
        start.setMonth(start.getMonth() - 6);
        break;
      case "Este ano":
        start.setMonth(0);
        start.setDate(1);
        break;
      default:
        start.setMonth(start.getMonth() - 6);
    }

    return { start, end };
  }

  private isInPeriod(dateStr: string, start: Date, end: Date): boolean {
    const date = new Date(dateStr);
    return date >= start && date <= end;
  }

  async execute(period?: string): Promise<ReportMetrics> {
    const appointments = await this.appointmentRepository.findAll();
    const users = await this.userRepository.findAll();
    const { start: periodStart, end: periodEnd } = this.getDateRange(period);

    const filteredAppointments = appointments.filter((a) =>
      this.isInPeriod(a.date, periodStart, periodEnd)
    );

    const totalCount = filteredAppointments.length;
    const completedCount = filteredAppointments.filter((a) => a.status === "Concluído").length;
    const confirmedCount = filteredAppointments.filter((a) => a.status === "Confirmado").length;
    const canceledCount = filteredAppointments.filter((a) => a.status === "Cancelado").length;
    const pendingCount = filteredAppointments.filter((a) => a.status === "Pendente").length;

    const estimatedRevenue = "R$ 0,00";
    const attendanceNum = totalCount > 0 ? ((completedCount / totalCount) * 100).toFixed(1) : "0,0";
    const occupancyNum = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Monthly evolution data
    const monthlyMap = new Map<string, { agendamentos: number; cancelados: number; receita: number }>();
    for (const appt of filteredAppointments) {
      const date = new Date(appt.date);
      const monthKey = date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
      const existing = monthlyMap.get(monthKey) || { agendamentos: 0, cancelados: 0, receita: 0 };
      existing.agendamentos += 1;
      if (appt.status === "Cancelado") existing.cancelados += 1;
      monthlyMap.set(monthKey, existing);
    }
    const monthlyData = Array.from(monthlyMap.entries())
      .sort(([aKey], [bKey]) => new Date(aKey).getTime() - new Date(bKey).getTime())
      .map(([month, data]) => ({ month: month.substring(0, 3).toUpperCase(), ...data }));

    // Status distribution
    const statusData = [
      { name: "Concluídos", value: completedCount, color: "#18181b" },
      { name: "Confirmados", value: confirmedCount, color: "#71717a" },
      { name: "Cancelados", value: canceledCount, color: "#d4d4d8" },
      { name: "Não compareceu", value: pendingCount, color: "#f4f4f5" },
    ].filter((s) => s.value > 0);

    // Services data
    const servicesMap = new Map<string, { total: number; receita: number }>();
    for (const appt of filteredAppointments) {
      const serviceName = appt.service || "Outros";
      const existing = servicesMap.get(serviceName) || { total: 0, receita: 0 };
      existing.total += 1;
      servicesMap.set(serviceName, existing);
    }
    const servicesData = Array.from(servicesMap.entries())
      .map(([name, data]) => ({ name, total: data.total, receita: "R$ 0,00" }))
      .sort((a, b) => b.total - a.total);

    // Hourly occupancy
    const hourlyMap = new Map<string, number>();
    let peakHour = "08";
    let maxHourlyCount = 0;

    for (const hour of WORK_HOURS) {
      const apptCount = filteredAppointments.filter((a) => a.time?.startsWith(hour)).length;
      hourlyMap.set(hour, apptCount);
      if (apptCount > maxHourlyCount) {
        maxHourlyCount = apptCount;
        peakHour = hour;
      }
    }

    const maxApptInHour = Math.max(...Array.from(hourlyMap.values()));
    const hourlyData = Array.from(hourlyMap.entries()).map(([hour, count]) => ({
      hour: `${hour}h`,
      ocupacao: maxApptInHour > 0 ? Math.round((count / maxApptInHour) * 100) : 0,
    }));

    // Weekly occupancy heatmap
    const weeklyMap = new Map<string, number[]>();
    const dayIndexMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

    for (const dayName of WORK_DAYS) {
      const values: number[] = new Array(TIME_SLOTS.length).fill(0);
      for (let i = 0; i < TIME_SLOTS.length; i++) {
        const [startStr] = TIME_SLOTS[i].split("–");
        const startHour = parseInt(startStr);
        const endHour = startHour + 1;

        const apptCount = filteredAppointments.filter((a) => {
          const date = new Date(a.date);
          const dayNum = date.getDay();
          const dayMapping: Record<number, string> = { 0: "Seg", 1: "Ter", 2: "Qua", 3: "Qui", 4: "Sex", 5: "Sáb", 6: "Seg" };
          const appointmentDay = dayMapping[dayNum];

          const apptHour = parseInt(a.time?.split(":")[0] || "0");
          return appointmentDay === dayName && apptHour >= startHour && apptHour < endHour;
        }).length;

        values[i] = apptCount;
      }

      const maxInDay = Math.max(...values);
      const normalizedValues = values.map((v) => (maxInDay > 0 ? Math.round((v / maxInDay) * 4) : 0));
      weeklyMap.set(dayName, normalizedValues);
    }

    const weeklyData = WORK_DAYS.map((day) => ({ day, values: weeklyMap.get(day) || [] }));

    // Appointment channels
    const channelsMap = new Map<string, { value: number; digital: boolean }>();
    const channelNames: Record<string, { name: string; digital: boolean }> = {
      site: { name: "Sistema", digital: true },
      whatsapp: { name: "WhatsApp", digital: true },
      recepcao: { name: "Recepção", digital: false },
      instagram: { name: "Instagram", digital: true },
      telefone: { name: "Telefone", digital: false },
      email: { name: "Email", digital: true },
    };

    for (const appt of filteredAppointments) {
      const channelId = appt.channelId || "recepcao";
      const channelInfo = channelNames[channelId] || { name: "Outro", digital: false };
      const existing = channelsMap.get(channelId) || { value: 0, digital: channelInfo.digital };
      existing.value += 1;
      channelsMap.set(channelId, existing);
    }

    const totalChannelAppts = filteredAppointments.length || 1;
    const channelsData = Array.from(channelsMap.entries())
      .map(([id, data]) => ({
        name: channelNames[id]?.name || "Outro",
        value: data.value,
        percent: Math.round((data.value / totalChannelAppts) * 100),
        digital: data.digital,
      }))
      .sort((a, b) => b.value - a.value);

    // Aggregate client frequency
    const clientMap = new Map<string, { name: string; initials: string; visits: number; spentNum: number; last: string }>();
    for (const appt of filteredAppointments) {
      const name = appt.name;
      const initials = appt.initials || "CL";
      const existing = clientMap.get(name) || {
        name,
        initials,
        visits: 0,
        spentNum: 0,
        last: appt.date,
      };
      existing.visits += 1;
      if (appt.date > existing.last) {
        existing.last = appt.date;
      }
      clientMap.set(name, existing);
    }

    const topClients = Array.from(clientMap.values())
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5)
      .map((c) => ({
        name: c.name,
        initials: c.initials,
        visits: c.visits,
        spent: "R$ 0,00",
        last: c.last,
        status: c.visits > 1 ? "Recorrente" : "Novo",
      }));

    // Aggregate professionals performance
    const staffMembers = users.filter((u) => u.role === "Administrador" || u.role === "Gestor" || u.role === "Funcionario");
    const professionals = staffMembers.map((u) => {
      const userAppts = filteredAppointments.filter((a) => a.userId === u.id);
      const apptCount = userAppts.length;
      const completedUserAppts = userAppts.filter((a) => a.status === "Concluído").length;
      const presence = apptCount > 0 ? `${Math.round((completedUserAppts / apptCount) * 100)}%` : "0%";
      const occupancy = apptCount > 0 ? `${Math.round((apptCount / totalCount) * 100)}%` : "0%";

      return {
        name: u.name,
        initials: u.initials || "US",
        appointments: apptCount,
        presence,
        occupancy,
        revenue: "R$ 0,00",
        score: "0.0",
      };
    }).filter((p) => p.appointments > 0);

    return {
      totalAppointments: totalCount,
      estimatedRevenue: estimatedRevenue,
      attendanceRate: `${attendanceNum}%`,
      occupancyRate: `${occupancyNum}%`,
      completedAppointments: completedCount,
      confirmedAppointments: confirmedCount,
      canceledAppointments: canceledCount,
      pendingAppointments: pendingCount,
      monthlyData,
      statusData,
      servicesData,
      hourlyData,
      weeklyData,
      channelsData,
      topClients,
      professionals,
      peakHour: `${peakHour}h`,
    };
  }
}
