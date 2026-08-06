export interface AppointmentProps {
  id: string;
  date: string;
  time: string;
  name: string;
  service: string | null;
  serviceId?: string | null;
  duration: string;
  status: "Confirmado" | "Pendente" | "Concluído" | "Cancelado";
  initials: string;
  channelId: string;
  notes?: string | null;
  userId?: string | null;
  clientId?: string | null;
  userName?: string | null;
  userRole?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export const ALL_TIMES = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
];

export class Appointment {
  private props: AppointmentProps;

  constructor(props: AppointmentProps) {
    this.validate(props);
    this.props = props;
  }

  private validate(props: AppointmentProps) {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error("Nome do cliente é obrigatório no agendamento.");
    }
    if (!props.time) {
      throw new Error("Horário do agendamento é obrigatório.");
    }
  }

  get id(): string {
    return this.props.id;
  }
  get date(): string {
    return this.props.date;
  }
  get time(): string {
    return this.props.time;
  }
  get name(): string {
    return this.props.name;
  }
  get service(): string | null {
    return this.props.service;
  }
  get serviceId(): string | null | undefined {
    return this.props.serviceId;
  }
  get duration(): string {
    return this.props.duration;
  }
  get status(): "Confirmado" | "Pendente" | "Concluído" | "Cancelado" {
    return this.props.status;
  }
  get initials(): string {
    return this.props.initials;
  }
  get channelId(): string {
    return this.props.channelId;
  }
  get notes(): string | null | undefined {
    return this.props.notes;
  }
  get userId(): string | null | undefined {
    return this.props.userId;
  }
  get clientId(): string | null | undefined {
    return this.props.clientId;
  }
  get userName(): string | null | undefined {
    return this.props.userName;
  }
  get userRole(): string | null | undefined {
    return this.props.userRole;
  }
  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }
  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  public toJSON(): AppointmentProps {
    return { ...this.props };
  }

  public static generateInitials(name: string): string {
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "A";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  public static getOccupiedSlots(startTime: string, duration: string): string[] {
    const index = ALL_TIMES.indexOf(startTime);
    if (index === -1) return [];

    let count = 1;
    if (duration.includes("60") || duration.includes("1h") || duration.includes("60 min")) {
      count = 2;
    } else if (duration.includes("90") || duration.includes("1h30") || duration.includes("90 min")) {
      count = 3;
    }

    const slots: string[] = [];
    for (let i = 0; i < count; i++) {
      if (index + i < ALL_TIMES.length) {
        slots.push(ALL_TIMES[index + i]);
      }
    }
    return slots;
  }
}
