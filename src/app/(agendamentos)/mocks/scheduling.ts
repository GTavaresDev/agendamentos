export const appointments = [
  { time: "09:00", name: "Marina Costa", service: "Consulta inicial", duration: "45 min", status: "Confirmado", initials: "MC", channelId: "site" },
  { time: "10:30", name: "Rafael Alves", service: "Retorno", duration: "30 min", status: "Confirmado", initials: "RA", channelId: "whatsapp" },
  { time: "13:00", name: "Beatriz Lima", service: "Avaliação", duration: "60 min", status: "Pendente", initials: "BL", channelId: "instagram" },
  { time: "15:30", name: "Lucas Mendes", service: "Consulta inicial", duration: "45 min", status: "Confirmado", initials: "LM", channelId: "recepcao" },
  { time: "17:00", name: "Camila Rocha", service: "Retorno", duration: "30 min", status: "Pendente", initials: "CR", channelId: "whatsapp" },
];

export const appointmentChannels = [
  { id: "site", name: "Sistema", value: 142, percent: 42, digital: true },
  { id: "whatsapp", name: "WhatsApp", value: 103, percent: 30, digital: true },
  { id: "recepcao", name: "Recepção", value: 68, percent: 20, digital: false },
  { id: "instagram", name: "Instagram", value: 29, percent: 8, digital: true },
] as const;

export const users = [
  { name: "Marina Costa", email: "marina.costa@email.com", phone: "(11) 99842-3210", role: "Cliente", status: "Ativo", last: "Hoje, 09:00", initials: "MC" },
  { name: "Rafael Alves", email: "rafael.alves@email.com", phone: "(11) 98210-4521", role: "Cliente", status: "Ativo", last: "Hoje, 10:30", initials: "RA" },
  { name: "Beatriz Lima", email: "bia.lima@email.com", phone: "(11) 97521-3377", role: "Cliente", status: "Ativo", last: "Ontem, 16:00", initials: "BL" },
  { name: "Lucas Mendes", email: "lucas.mendes@email.com", phone: "(11) 96774-8930", role: "Cliente", status: "Inativo", last: "24 jul, 14:00", initials: "LM" },
  { name: "Ana Souza", email: "ana.souza@email.com", phone: "(11) 98821-4532", role: "Administrador", status: "Ativo", last: "22 jul, 11:30", initials: "AS" },
  { name: "Pedro Martins", email: "pedro.m@email.com", phone: "(11) 96543-0876", role: "Cliente", status: "Ativo", last: "18 jul, 08:30", initials: "PM" },
];

export const products = [
  { name: "Sérum facial vitamina C", category: "Skincare", price: "R$ 129,90", quantity: 18, status: "Ativo" },
  { name: "Protetor solar facial FPS 60", category: "Proteção solar", price: "R$ 89,90", quantity: 24, status: "Ativo" },
  { name: "Kit home care pós-procedimento", category: "Kits", price: "R$ 219,00", quantity: 7, status: "Ativo" },
  { name: "Máscara facial hidratante", category: "Skincare", price: "R$ 39,90", quantity: 3, status: "Baixo estoque" },
  { name: "Óleo corporal relaxante", category: "Corporal", price: "R$ 74,90", quantity: 0, status: "Inativo" },
  { name: "Sabonete facial suave", category: "Higiene", price: "R$ 54,90", quantity: 15, status: "Ativo" },
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
export const occupied = ["09:00", "10:30", "13:00", "15:30", "17:00"];
