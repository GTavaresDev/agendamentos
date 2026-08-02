export type AppointmentStatus =
  | "Confirmado"
  | "Pendente"
  | "Concluído"
  | "Cancelado"
  | "Não compareceu";

export type Appointment = {
  id: string;
  date: string;
  time: string;
  name: string;
  service: string;
  duration: string;
  durationMinutes: number;
  status: AppointmentStatus;
  initials: string;
  channelId: string;
  price: number;
  professional: string;
  notes?: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "Cliente" | "Administrador";
  status: "Ativo" | "Inativo";
  last: string;
  initials: string;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  status: "Ativo" | "Baixo estoque" | "Inativo";
};

export const appointmentChannels = [
  { id: "site", name: "Sistema", digital: true },
  { id: "whatsapp", name: "WhatsApp", digital: true },
  { id: "recepcao", name: "Recepção", digital: false },
  { id: "instagram", name: "Instagram", digital: true },
] as const;

export const services = [
  { name: "Consulta inicial", durationMinutes: 45, price: 150 },
  { name: "Retorno", durationMinutes: 30, price: 100 },
  { name: "Avaliação", durationMinutes: 60, price: 150 },
  { name: "Limpeza de pele", durationMinutes: 60, price: 189 },
  { name: "Procedimento", durationMinutes: 50, price: 190 },
  { name: "Outros", durationMinutes: 30, price: 120 },
] as const;

export const users: User[] = [
  { id: "user-marina", name: "Marina Costa", email: "marina.costa@email.com", phone: "(11) 99842-3210", role: "Cliente", status: "Ativo", last: "Hoje, 09:00", initials: "MC" },
  { id: "user-rafael", name: "Rafael Alves", email: "rafael.alves@email.com", phone: "(11) 98210-4521", role: "Cliente", status: "Ativo", last: "Hoje, 10:30", initials: "RA" },
  { id: "user-beatriz", name: "Beatriz Lima", email: "bia.lima@email.com", phone: "(11) 97521-3377", role: "Cliente", status: "Ativo", last: "Ontem, 16:00", initials: "BL" },
  { id: "user-lucas", name: "Lucas Mendes", email: "lucas.mendes@email.com", phone: "(11) 96774-8930", role: "Cliente", status: "Inativo", last: "24 jul, 14:00", initials: "LM" },
  { id: "user-ana", name: "Ana Souza", email: "ana.souza@email.com", phone: "(11) 98821-4532", role: "Administrador", status: "Ativo", last: "22 jul, 11:30", initials: "AS" },
  { id: "user-pedro", name: "Pedro Martins", email: "pedro.m@email.com", phone: "(11) 96543-0876", role: "Cliente", status: "Ativo", last: "18 jul, 08:30", initials: "PM" },
];

export const products: Product[] = [
  { id: "product-serum", name: "Sérum facial vitamina C", category: "Skincare", price: 129.9, quantity: 18, status: "Ativo" },
  { id: "product-protetor", name: "Protetor solar facial FPS 60", category: "Proteção solar", price: 89.9, quantity: 24, status: "Ativo" },
  { id: "product-kit", name: "Kit home care pós-procedimento", category: "Kits", price: 219, quantity: 7, status: "Ativo" },
  { id: "product-mascara", name: "Máscara facial hidratante", category: "Skincare", price: 39.9, quantity: 3, status: "Baixo estoque" },
  { id: "product-oleo", name: "Óleo corporal relaxante", category: "Corporal", price: 74.9, quantity: 0, status: "Inativo" },
  { id: "product-sabonete", name: "Sabonete facial suave", category: "Higiene", price: 54.9, quantity: 15, status: "Ativo" },
];

export const weekDays = [
  { day: "Seg", date: "27", full: "27 de julho", iso: "2026-07-27" },
  { day: "Ter", date: "28", full: "28 de julho", iso: "2026-07-28" },
  { day: "Qua", date: "29", full: "29 de julho", iso: "2026-07-29" },
  { day: "Qui", date: "30", full: "30 de julho", iso: "2026-07-30" },
  { day: "Sex", date: "31", full: "31 de julho", iso: "2026-07-31" },
  { day: "Sáb", date: "01", full: "1 de agosto", iso: "2026-08-01" },
  { day: "Dom", date: "02", full: "2 de agosto", iso: "2026-08-02" },
];

export const times = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"];

const professionals = ["Ana Souza", "Clara Mendes", "Paula Freitas", "Bruna Lima"];
const clientNames = users.filter((user) => user.role === "Cliente");
const monthlyVolumes = [
  { year: 2026, month: 2, total: 214, cancelled: 19 },
  { year: 2026, month: 3, total: 248, cancelled: 16 },
  { year: 2026, month: 4, total: 236, cancelled: 21 },
  { year: 2026, month: 5, total: 287, cancelled: 18 },
  { year: 2026, month: 6, total: 305, cancelled: 15 },
  { year: 2026, month: 7, total: 342, cancelled: 17 },
];

function generateHistoricalAppointments(): Appointment[] {
  return monthlyVolumes.flatMap(({ year, month, total, cancelled }) =>
    Array.from({ length: total }, (_, index) => {
      const client = clientNames[index % clientNames.length];
      const service = services[index % services.length];
      const day = (index % 28) + 1;
      const channelRoll = index % 100;
      const channelId =
        channelRoll < 42
          ? "site"
          : channelRoll < 72
            ? "whatsapp"
            : channelRoll < 92
              ? "recepcao"
              : "instagram";
      const status: AppointmentStatus =
        index < cancelled
          ? "Cancelado"
          : index % 41 === 0
            ? "Não compareceu"
            : "Concluído";

      return {
        id: `history-${year}-${month}-${index}`,
        date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        time: times[index % times.length],
        name: client.name,
        service: service.name,
        duration: `${service.durationMinutes} min`,
        durationMinutes: service.durationMinutes,
        status,
        initials: client.initials,
        channelId,
        price: service.price,
        professional: professionals[index % professionals.length],
      };
    }),
  );
}

const currentAppointments: Appointment[] = [
  { id: "appointment-mon-1", date: "2026-07-27", time: "09:00", name: "Pedro Martins", service: "Consulta inicial", duration: "45 min", durationMinutes: 45, status: "Confirmado", initials: "PM", channelId: "site", price: 150, professional: "Ana Souza" },
  { id: "appointment-mon-2", date: "2026-07-27", time: "14:00", name: "Marina Costa", service: "Limpeza de pele", duration: "60 min", durationMinutes: 60, status: "Confirmado", initials: "MC", channelId: "whatsapp", price: 189, professional: "Clara Mendes" },
  { id: "appointment-tue-1", date: "2026-07-28", time: "10:00", name: "Beatriz Lima", service: "Retorno", duration: "30 min", durationMinutes: 30, status: "Confirmado", initials: "BL", channelId: "instagram", price: 100, professional: "Paula Freitas" },
  { id: "appointment-tue-2", date: "2026-07-28", time: "11:30", name: "Rafael Alves", service: "Avaliação", duration: "60 min", durationMinutes: 60, status: "Pendente", initials: "RA", channelId: "recepcao", price: 150, professional: "Ana Souza" },
  { id: "appointment-tue-3", date: "2026-07-28", time: "16:00", name: "Lucas Mendes", service: "Procedimento", duration: "50 min", durationMinutes: 50, status: "Confirmado", initials: "LM", channelId: "site", price: 190, professional: "Bruna Lima" },
  { id: "appointment-wed-1", date: "2026-07-29", time: "08:30", name: "Camila Rocha", service: "Consulta inicial", duration: "45 min", durationMinutes: 45, status: "Confirmado", initials: "CR", channelId: "whatsapp", price: 150, professional: "Ana Souza" },
  { id: "appointment-wed-2", date: "2026-07-29", time: "15:00", name: "Pedro Martins", service: "Retorno", duration: "30 min", durationMinutes: 30, status: "Pendente", initials: "PM", channelId: "site", price: 100, professional: "Clara Mendes" },
  { id: "appointment-thu-1", date: "2026-07-30", time: "09:30", name: "Marina Costa", service: "Avaliação", duration: "60 min", durationMinutes: 60, status: "Confirmado", initials: "MC", channelId: "recepcao", price: 150, professional: "Paula Freitas" },
  { id: "appointment-thu-2", date: "2026-07-30", time: "13:30", name: "Beatriz Lima", service: "Limpeza de pele", duration: "60 min", durationMinutes: 60, status: "Confirmado", initials: "BL", channelId: "instagram", price: 189, professional: "Bruna Lima" },
  { id: "appointment-fri-1", date: "2026-07-31", time: "10:30", name: "Rafael Alves", service: "Consulta inicial", duration: "45 min", durationMinutes: 45, status: "Confirmado", initials: "RA", channelId: "site", price: 150, professional: "Ana Souza" },
  { id: "appointment-fri-2", date: "2026-07-31", time: "14:30", name: "Lucas Mendes", service: "Retorno", duration: "30 min", durationMinutes: 30, status: "Pendente", initials: "LM", channelId: "whatsapp", price: 100, professional: "Clara Mendes" },
  { id: "appointment-fri-3", date: "2026-07-31", time: "16:30", name: "Camila Rocha", service: "Procedimento", duration: "50 min", durationMinutes: 50, status: "Confirmado", initials: "CR", channelId: "recepcao", price: 190, professional: "Paula Freitas" },
  { id: "appointment-1", date: "2026-08-01", time: "09:00", name: "Marina Costa", service: "Consulta inicial", duration: "45 min", durationMinutes: 45, status: "Confirmado", initials: "MC", channelId: "site", price: 150, professional: "Ana Souza" },
  { id: "appointment-2", date: "2026-08-01", time: "10:30", name: "Rafael Alves", service: "Retorno", duration: "30 min", durationMinutes: 30, status: "Confirmado", initials: "RA", channelId: "whatsapp", price: 100, professional: "Clara Mendes" },
  { id: "appointment-3", date: "2026-08-01", time: "13:00", name: "Beatriz Lima", service: "Avaliação", duration: "60 min", durationMinutes: 60, status: "Pendente", initials: "BL", channelId: "instagram", price: 150, professional: "Paula Freitas" },
  { id: "appointment-4", date: "2026-08-01", time: "15:30", name: "Lucas Mendes", service: "Consulta inicial", duration: "45 min", durationMinutes: 45, status: "Confirmado", initials: "LM", channelId: "recepcao", price: 150, professional: "Ana Souza" },
  { id: "appointment-5", date: "2026-08-01", time: "17:00", name: "Camila Rocha", service: "Retorno", duration: "30 min", durationMinutes: 30, status: "Pendente", initials: "CR", channelId: "whatsapp", price: 100, professional: "Bruna Lima" },
  { id: "appointment-sun-1", date: "2026-08-02", time: "10:00", name: "Pedro Martins", service: "Avaliação", duration: "60 min", durationMinutes: 60, status: "Confirmado", initials: "PM", channelId: "site", price: 150, professional: "Ana Souza" },
];

export const appointments: Appointment[] = [
  ...generateHistoricalAppointments(),
  ...currentAppointments,
];
