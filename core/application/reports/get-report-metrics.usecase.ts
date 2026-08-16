import { AppointmentRepository } from "@core/domain/appointments/appointment.repository";
import { UserRepository } from "@core/domain/users/user.repository";
import { ServiceRepository } from "@core/domain/services/service.repository";
import { SaleRepository } from "@core/domain/sales/sale.repository";

/** Cor neutra usada quando o serviço não possui cor configurada. */
const DEFAULT_SERVICE_COLOR = "#a1a1aa";

/** Espelha as cores de src/lib/appointment-status.ts (core não depende da camada de UI). */
const STATUS_COLOR: Record<"Confirmado" | "Pendente" | "Concluído" | "Cancelado", string> = {
  Confirmado: "#10b981",
  Pendente: "#f59e0b",
  Concluído: "#a1a1aa",
  Cancelado: "#ef4444",
};

export interface ReportMetrics {
  totalAppointments: number;
  estimatedRevenue: string;
  servicesRevenue: string;
  productsRevenue: string;
  servicesRevenueNum: number;
  productsRevenueNum: number;
  totalRevenueNum: number;
  servicesPercent: number;
  productsPercent: number;
  avgAppointmentTicket: string;
  avgSaleTicket: string;
  salesCount: number;
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
    color: string;
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

/** Rótulos do eixo X do gráfico de evolução, indexados por mês (0 = janeiro). */
const MONTH_LABELS = [
  "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
  "JUL", "AGO", "SET", "OUT", "NOV", "DEZ",
];

const WORK_HOURS = ["08", "09", "10", "11", "13", "14", "15", "16", "17"];
const WORK_DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const TIME_SLOTS = ["08–09", "09–10", "10–11", "13–14", "14–15", "15–16", "16–18"];

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

export class GetReportMetrics {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private userRepository: UserRepository,
    private serviceRepository: ServiceRepository,
    private saleRepository?: SaleRepository,
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
    const services = await this.serviceRepository.findAll();
    const serviceColorByName = new Map(
      services.map((service) => [service.name.toLowerCase(), service.color]),
    );
    const { start: periodStart, end: periodEnd } = this.getDateRange(period);

    const filteredAppointments = appointments.filter((a) =>
      this.isInPeriod(a.date, periodStart, periodEnd)
    );

    const sales = this.saleRepository ? await this.saleRepository.findAll() : [];
    const filteredSales = sales.filter((s) => {
      const d = s.createdAt ? new Date(s.createdAt) : new Date();
      return this.isInPeriod(d.toISOString(), periodStart, periodEnd);
    });

    const totalCount = filteredAppointments.length;
    const completedCount = filteredAppointments.filter((a) => a.status === "Concluído").length;
    const confirmedCount = filteredAppointments.filter((a) => a.status === "Confirmado").length;
    const canceledCount = filteredAppointments.filter((a) => a.status === "Cancelado").length;
    const pendingCount = filteredAppointments.filter((a) => a.status === "Pendente").length;

    const servicePriceByName = new Map(
      services.map((service) => [service.name.toLowerCase(), service.price || 0]),
    );

    let servicesRevenueNum = 0;
    for (const appt of filteredAppointments) {
      if (appt.status === "Concluído" || appt.status === "Confirmado") {
        const priceFromRecord = appt.servicePrice;
        const priceFromName = appt.service ? servicePriceByName.get(appt.service.toLowerCase()) : null;
        const price = (priceFromRecord && priceFromRecord > 0) ? priceFromRecord : (priceFromName && priceFromName > 0) ? priceFromName : 200;
        servicesRevenueNum += price;
      }
    }

    let productsRevenueNum = 0;
    for (const sale of filteredSales) {
      productsRevenueNum += sale.totalPrice || 0;
    }

    const totalRevenueNum = servicesRevenueNum + productsRevenueNum;
    const servicesPercent = totalRevenueNum > 0 ? Math.round((servicesRevenueNum / totalRevenueNum) * 100) : 0;
    const productsPercent = totalRevenueNum > 0 ? Math.round((productsRevenueNum / totalRevenueNum) * 100) : 0;

    const avgAppointmentTicket = (completedCount + confirmedCount) > 0
      ? servicesRevenueNum / (completedCount + confirmedCount)
      : 0;

    const avgSaleTicket = filteredSales.length > 0
      ? productsRevenueNum / filteredSales.length
      : 0;

    const estimatedRevenue = formatCurrency(totalRevenueNum);
    const attendanceNum = totalCount > 0 ? ((completedCount / totalCount) * 100).toFixed(1) : "0,0";
    const occupancyNum = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Monthly evolution data
    // A chave é "AAAA-MM" porque ela precisa ORDENAR. Rótulo em pt-BR ("mai. de
    // 2026") não ordena: `new Date()` não lê esse formato, devolve Invalid Date
    // e o comparador vira NaN — o gráfico saía fora de ordem (MAI, AGO, JUN).
    const monthlyMap = new Map<string, { agendamentos: number; cancelados: number; receita: number }>();
    for (const appt of filteredAppointments) {
      // appt.date já é "AAAA-MM-DD": fatiar evita o fuso do `new Date`, que em
      // UTC-3 jogava o dia 1º para o mês anterior.
      const monthKey = appt.date.slice(0, 7);
      const existing = monthlyMap.get(monthKey) || { agendamentos: 0, cancelados: 0, receita: 0 };
      existing.agendamentos += 1;
      if (appt.status === "Cancelado") existing.cancelados += 1;
      if ((appt.status === "Concluído" || appt.status === "Confirmado") && appt.servicePrice != null) {
        existing.receita += appt.servicePrice;
      }
      monthlyMap.set(monthKey, existing);
    }
    for (const sale of filteredSales) {
      const date = sale.createdAt ? new Date(sale.createdAt) : new Date();
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const existing = monthlyMap.get(monthKey) || { agendamentos: 0, cancelados: 0, receita: 0 };
      existing.receita += sale.totalPrice || 0;
      monthlyMap.set(monthKey, existing);
    }
    const monthlyData = Array.from(monthlyMap.entries())
      .sort(([aKey], [bKey]) => aKey.localeCompare(bKey))
      .map(([monthKey, data]) => ({
        month: MONTH_LABELS[Number(monthKey.slice(5, 7)) - 1],
        ...data,
      }));

    // Status distribution
    const statusData = [
      { name: "Concluídos", value: completedCount, color: STATUS_COLOR.Concluído },
      { name: "Confirmados", value: confirmedCount, color: STATUS_COLOR.Confirmado },
      { name: "Cancelados", value: canceledCount, color: STATUS_COLOR.Cancelado },
      { name: "Pendentes", value: pendingCount, color: STATUS_COLOR.Pendente },
    ].filter((s) => s.value > 0);

    // Services data
    const servicesMap = new Map<string, { total: number; receita: number; color: string }>();
    for (const appt of filteredAppointments) {
      const serviceName = appt.service || "Outros";
      const existing = servicesMap.get(serviceName) || {
        total: 0,
        receita: 0,
        color:
          appt.serviceColor ||
          serviceColorByName.get(serviceName.toLowerCase()) ||
          DEFAULT_SERVICE_COLOR,
      };
      existing.total += 1;
      if ((appt.status === "Concluído" || appt.status === "Confirmado") && appt.servicePrice != null) {
        existing.receita += appt.servicePrice;
      }
      servicesMap.set(serviceName, existing);
    }
    const servicesData = Array.from(servicesMap.entries())
      .map(([name, data]) => ({
        name,
        total: data.total,
        receita: formatCurrency(data.receita),
        color: data.color,
      }))
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
      const channelInfo = channelNames[channelId] || { name: "Outros", digital: false };
      const existing = channelsMap.get(channelInfo.name) || { value: 0, digital: channelInfo.digital };
      existing.value += 1;
      channelsMap.set(channelInfo.name, existing);
    }

    const totalChannelAppts = filteredAppointments.length || 1;
    const channelsData = Array.from(channelsMap.entries())
      .map(([name, data]) => ({
        name,
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
      if ((appt.status === "Concluído" || appt.status === "Confirmado") && appt.servicePrice != null) {
        existing.spentNum += appt.servicePrice;
      }
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
        spent: formatCurrency(c.spentNum),
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

      let revenueNum = 0;
      for (const a of userAppts) {
        if ((a.status === "Concluído" || a.status === "Confirmado") && a.servicePrice != null) {
          revenueNum += a.servicePrice;
        }
      }

      return {
        name: u.name,
        initials: u.initials || "US",
        appointments: apptCount,
        presence,
        occupancy,
        revenue: formatCurrency(revenueNum),
        score: "0.0",
      };
    }).filter((p) => p.appointments > 0);

    return {
      totalAppointments: totalCount,
      estimatedRevenue: estimatedRevenue,
      servicesRevenue: formatCurrency(servicesRevenueNum),
      productsRevenue: formatCurrency(productsRevenueNum),
      servicesRevenueNum,
      productsRevenueNum,
      totalRevenueNum,
      servicesPercent,
      productsPercent,
      avgAppointmentTicket: formatCurrency(avgAppointmentTicket),
      avgSaleTicket: formatCurrency(avgSaleTicket),
      salesCount: filteredSales.length,
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
