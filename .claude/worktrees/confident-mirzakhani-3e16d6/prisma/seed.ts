import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../core/infra/auth/password";

const prisma = new PrismaClient();

const ADMIN_ID = "bb323bc0-f216-4309-8ef5-db9ea664e845";

const clientsData = [
  { name: "Ana Beatriz Silva", email: "ana.silva@email.com", phone: "(11) 98765-4321", cpf: "123.456.789-01", birthDate: "1990-05-14", status: "Ativo", initials: "AS" },
  { name: "Carlos Eduardo Souza", email: "carlos.souza@email.com", phone: "(11) 98765-4322", cpf: "234.567.890-12", birthDate: "1985-08-22", status: "Ativo", initials: "CS" },
  { name: "Mariana Costa", email: "mariana.costa@email.com", phone: "(11) 99842-3210", cpf: "345.678.901-23", birthDate: "1994-02-10", status: "Ativo", initials: "MC" },
  { name: "Rafael Alves", email: "rafael.alves@email.com", phone: "(11) 98210-4521", cpf: "456.789.012-34", birthDate: "1988-11-30", status: "Ativo", initials: "RA" },
  { name: "Beatriz Lima", email: "bia.lima@email.com", phone: "(11) 97521-3377", cpf: "567.890.123-45", birthDate: "1992-07-04", status: "Ativo", initials: "BL" },
  { name: "Lucas Mendes", email: "lucas.mendes@email.com", phone: "(11) 96774-8930", cpf: "678.901.234-56", birthDate: "1996-03-18", status: "Inativo", initials: "LM" },
  { name: "Camila Rocha", email: "camila.rocha@email.com", phone: "(11) 95432-1098", cpf: "789.012.345-67", birthDate: "1991-09-25", status: "Ativo", initials: "CR" },
  { name: "Pedro Martins", email: "pedro.m@email.com", phone: "(11) 96543-0876", cpf: "890.123.456-78", birthDate: "1987-12-12", status: "Ativo", initials: "PM" },
  { name: "Juliana Ferreira", email: "juliana.f@email.com", phone: "(11) 94321-8765", cpf: "901.234.567-89", birthDate: "1995-01-05", status: "Ativo", initials: "JF" },
  { name: "Gabriel Oliveira", email: "gabriel.o@email.com", phone: "(11) 93210-9876", cpf: "012.345.678-90", birthDate: "1993-06-20", status: "Ativo", initials: "GO" },
  { name: "Fernanda Ribeiro", email: "fernanda.r@email.com", phone: "(11) 92109-8765", cpf: "123.890.456-11", birthDate: "1989-04-15", status: "Ativo", initials: "FR" },
  { name: "Thiago Barbosa", email: "thiago.b@email.com", phone: "(11) 91098-7654", cpf: "234.901.567-22", birthDate: "1997-10-08", status: "Ativo", initials: "TB" },
  { name: "Patricia Lima", email: "patricia.l@email.com", phone: "(11) 90987-6543", cpf: "345.012.678-33", birthDate: "1986-07-19", status: "Ativo", initials: "PL" },
  { name: "Rodrigo Santos", email: "rodrigo.s@email.com", phone: "(11) 89876-5432", cpf: "456.123.789-44", birthDate: "1994-11-02", status: "Ativo", initials: "RS" },
  { name: "Vanessa Martins", email: "vanessa.m@email.com", phone: "(11) 88765-4321", cpf: "567.234.890-55", birthDate: "1991-03-27", status: "Ativo", initials: "VM" },
  { name: "Diego Carvalho", email: "diego.c@email.com", phone: "(11) 87654-3210", cpf: "678.345.901-66", birthDate: "1984-08-09", status: "Inativo", initials: "DC" },
  { name: "Amanda Gomes", email: "amanda.g@email.com", phone: "(11) 86543-2109", cpf: "789.456.012-77", birthDate: "1998-05-31", status: "Ativo", initials: "AG" },
  { name: "Bruno Henrique", email: "bruno.h@email.com", phone: "(11) 85432-1098", cpf: "890.567.123-88", birthDate: "1992-01-23", status: "Ativo", initials: "BH" },
  { name: "Letícia Ramos", email: "leticia.r@email.com", phone: "(11) 84321-0987", cpf: "901.678.234-99", birthDate: "1996-09-17", status: "Ativo", initials: "LR" },
  { name: "Felipe Nogueira", email: "felipe.n@email.com", phone: "(11) 83210-9876", cpf: "012.789.345-00", birthDate: "1990-12-04", status: "Ativo", initials: "FN" },
];

const productsData = [
  { name: "Sérum facial vitamina C", category: "Skincare", price: 129.9, quantity: 18, status: "Ativo" },
  { name: "Protetor solar facial FPS 60", category: "Proteção solar", price: 89.9, quantity: 24, status: "Ativo" },
  { name: "Kit home care pós-procedimento", category: "Kits", price: 219.0, quantity: 7, status: "Ativo" },
  { name: "Máscara facial hidratante", category: "Skincare", price: 39.9, quantity: 3, status: "Baixo estoque" },
  { name: "Óleo corporal relaxante", category: "Corporal", price: 74.9, quantity: 0, status: "Inativo" },
  { name: "Sabonete facial suave", category: "Higiene", price: 54.9, quantity: 15, status: "Ativo" },
  { name: "Tônico facial equilibrante", category: "Skincare", price: 68.5, quantity: 12, status: "Ativo" },
  { name: "Creme anti-idade renovador", category: "Skincare", price: 185.0, quantity: 5, status: "Baixo estoque" },
  { name: "Esfoliante corporal de café", category: "Corporal", price: 49.9, quantity: 20, status: "Ativo" },
  { name: "Água micelar demaquilante", category: "Higiene", price: 42.0, quantity: 30, status: "Ativo" },
];

const channelsData = [
  { id: "site", name: "Sistema", value: 142, percent: 42.0, digital: true },
  { id: "whatsapp", name: "WhatsApp", value: 103, percent: 30.0, digital: true },
  { id: "recepcao", name: "Recepção", value: 68, percent: 20.0, digital: false },
  { id: "instagram", name: "Instagram", value: 29, percent: 8.0, digital: true },
];

async function main() {
  console.log("Cleaning database...");
  await prisma.appointment.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.appointmentChannel.deleteMany({});
  await prisma.userPermission.deleteMany({});
  await prisma.systemPermission.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Seeding System Permissions...");
  await prisma.systemPermission.createMany({
    data: [
      {
        name: "Administrador",
        description: "Nível de acesso total do sistema",
        category: "roles",
        enabled: true,
        requiresHierarchy: true,
      },
      {
        name: "Gestor",
        description: "Acesso gerencial do sistema",
        category: "roles",
        enabled: true,
        requiresHierarchy: true,
      },
      {
        name: "Funcionario",
        description: "Acesso básico do sistema",
        category: "roles",
        enabled: true,
        requiresHierarchy: true,
      },
      {
        name: "ver_relatorios",
        description: "Permite acesso ao módulo de Relatórios",
        category: "reports",
        enabled: true,
        requiresHierarchy: false,
      },
      {
        name: "compartilhar_permissoes",
        description: "Permite atribuir permissões a outros usuários",
        category: "admin",
        enabled: true,
        requiresHierarchy: false,
      },
    ],
  });

  console.log("Seeding Admin User...");
  const passwordHash = await hashPassword("zxcasd");

  const adminUser = await prisma.user.create({
    data: {
      id: ADMIN_ID,
      name: "Admin Harmonize",
      email: "admin@harmonize.com",
      phone: "(11) 90000-0001",
      password: passwordHash,
      role: "Administrador",
      status: "Ativo",
      initials: "AH",
      last: "Online",
      failedLoginAttempts: 0,
      permissions: {
        create: [
          { name: "Administrador" },
          { name: "ver_relatorios" },
          { name: "compartilhar_permissoes" },
        ],
      },
    },
  });

  const gestorUser = await prisma.user.create({
    data: {
      name: "Gestor Harmonize",
      email: "gestor@harmonize.com",
      phone: "(11) 90000-0002",
      password: passwordHash,
      role: "Gestor",
      status: "Ativo",
      initials: "GH",
      last: "Ontem",
      failedLoginAttempts: 0,
      permissions: {
        create: [
          { name: "Gestor" },
          { name: "ver_relatorios" },
        ],
      },
    },
  });

  const funcUser = await prisma.user.create({
    data: {
      name: "Funcionario Harmonize",
      email: "func@harmonize.com",
      phone: "(11) 90000-0003",
      password: passwordHash,
      role: "Funcionario",
      status: "Ativo",
      initials: "FH",
      last: "Hoje",
      failedLoginAttempts: 0,
      permissions: {
        create: [{ name: "Funcionario" }],
      },
    },
  });

  console.log("Seeding Appointment Channels...");
  for (const ch of channelsData) {
    await prisma.appointmentChannel.create({ data: ch });
  }

  console.log("Seeding 20 Clients...");
  const createdClients = [];
  for (const c of clientsData) {
    const created = await prisma.client.create({ data: c });
    createdClients.push(created);
  }

  console.log("Seeding 10 Products...");
  for (const p of productsData) {
    await prisma.product.create({ data: p });
  }

  console.log("Seeding Services...");
  const servicesData = [
    { name: "Consulta inicial", description: "Primeira consulta e avaliação", duration: 45, price: 150.0, status: "Ativo", color: "#3B82F6" },
    { name: "Retorno", description: "Consulta de acompanhamento", duration: 30, price: 100.0, status: "Ativo", color: "#10B981" },
    { name: "Avaliação", description: "Avaliação completa", duration: 60, price: 200.0, status: "Ativo", color: "#F59E0B" },
    { name: "Limpeza de pele", description: "Limpeza profissional de pele", duration: 60, price: 180.0, status: "Ativo", color: "#EC4899" },
    { name: "Procedimento estético", description: "Procedimento estético personalizado", duration: 45, price: 250.0, status: "Ativo", color: "#8B5CF6" },
    { name: "Massagem relaxante", description: "Massagem terapêutica e relaxante", duration: 60, price: 120.0, status: "Ativo", color: "#06B6D4" },
    { name: "Peeling químico", description: "Peeling químico para rejuvenescimento", duration: 45, price: 220.0, status: "Ativo", color: "#EF4444" },
  ];

  const createdServices: { [key: string]: string } = {};
  for (const s of servicesData) {
    const created = await prisma.service.create({ data: s });
    createdServices[s.name] = created.id;
  }

  console.log("Seeding 60 Scheduled Appointments (distributed across week days)...");
  const servicesList = [
    { service: "Consulta inicial", duration: "45 min" },
    { service: "Retorno", duration: "30 min" },
    { service: "Avaliação", duration: "60 min" },
    { service: "Limpeza de pele", duration: "60 min" },
    { service: "Procedimento estético", duration: "45 min" },
    { service: "Massagem relaxante", duration: "60 min" },
    { service: "Peeling químico", duration: "45 min" },
  ];

  const timesList = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"];
  const channelsList = ["site", "whatsapp", "recepcao", "instagram"];
  const now = new Date();
  const staffUsers = [adminUser, gestorUser, funcUser];

  // Generate current week dynamically starting from Monday of this week
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);

  const calendarIsoDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    calendarIsoDates.push(date.toISOString().split("T")[0]);
  }

  const appointmentsToCreate = [];
  let apptIndex = 0;

  // 1. Ensure 3 to 5 appointments for EACH day in current calendar week view
  for (const isoDate of calendarIsoDates) {
    const dailyCount = 3 + (apptIndex % 3);
    for (let d = 0; d < dailyCount; d++) {
      const client = createdClients[(apptIndex + d) % createdClients.length];
      const staff = staffUsers[(apptIndex + d) % staffUsers.length];
      const srv = servicesList[(apptIndex + d) % servicesList.length];
      const time = timesList[(d * 2 + apptIndex) % timesList.length];
      const channelId = channelsList[(apptIndex + d) % channelsList.length];

      const statusOptions = ["Confirmado", "Concluído", "Pendente", "Cancelado"];
      const status = statusOptions[(apptIndex + d) % statusOptions.length];

      appointmentsToCreate.push({
        date: isoDate,
        time,
        name: client.name,
        service: srv.service,
        duration: srv.duration,
        status,
        initials: client.initials,
        channelId,
        notes: `Agendamento de ${srv.service} com ${client.name}.`,
        clientId: client.id,
        userId: staff.id,
        serviceId: createdServices[srv.service],
      });

      apptIndex++;
    }
  }

  // 2. Add extra appointments across past 30 days for historical metrics
  for (let i = 0; i < 35; i++) {
    const client = createdClients[i % createdClients.length];
    const staff = staffUsers[i % staffUsers.length];
    const srv = servicesList[i % servicesList.length];
    const time = timesList[i % timesList.length];
    const channelId = channelsList[i % channelsList.length];

    const dayOffset = -1 - (i % 30);
    const dateObj = new Date(now.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    const dateStr = dateObj.toISOString().split("T")[0];

    appointmentsToCreate.push({
      date: dateStr,
      time,
      name: client.name,
      service: srv.service,
      duration: srv.duration,
      status: i % 5 === 0 ? "Cancelado" : "Concluído",
      initials: client.initials,
      channelId,
      notes: `Atendimento histórico de ${srv.service}.`,
      clientId: client.id,
      userId: staff.id,
      serviceId: createdServices[srv.service],
    });
  }

  for (const appt of appointmentsToCreate) {
    await prisma.appointment.create({ data: appt });
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
