import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../core/infra/auth/password";

const prisma = new PrismaClient();

const ADMIN_ID = "bb323bc0-f216-4309-8ef5-db9ea664e845";

async function main() {
  console.log("Cleaning database...");

  await prisma.sale.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.userPermission.deleteMany({});
  await prisma.systemPermission.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Seeding System Permissions...");

  await prisma.systemPermission.createMany({
    data: [
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

  console.log("Seeding Users...");

  const defaultPassword = await hashPassword("zxcasd");
  const gabrielPassword = await hashPassword("lkjh-poiu-zxc10");

  const adminUser = await prisma.user.create({
    data: {
      id: ADMIN_ID,
      name: "Admin Agendamentos",
      email: "admin@agendamentos.com",
      phone: "(11) 90000-0001",
      password: defaultPassword,
      role: "Administrador",
      status: "Ativo",
      initials: "AH",
      last: "Online",
      failedLoginAttempts: 0,
      permissions: {
        create: [
          { name: "ver_relatorios" },
          { name: "compartilhar_permissoes" },
        ],
      },
    },
  });

  const gabrielUser = await prisma.user.create({
    data: {
      name: "Gabriel",
      email: "gabriel@agendamentos.com",
      phone: "(11) 99999-9999",
      password: gabrielPassword,
      role: "Administrador",
      status: "Ativo",
      initials: "GH",
      last: "Online",
      failedLoginAttempts: 0,
      permissions: {
        create: [
          { name: "ver_relatorios" },
          { name: "compartilhar_permissoes" },
        ],
      },
    },
  });

  const gestorUser = await prisma.user.create({
    data: {
      name: "Gestor Agendamentos",
      email: "gestor@agendamentos.com",
      phone: "(11) 90000-0002",
      password: defaultPassword,
      role: "Gestor",
      status: "Ativo",
      initials: "GH",
      last: "Ontem",
      failedLoginAttempts: 0,
      permissions: {
        create: [{ name: "ver_relatorios" }],
      },
    },
  });

  const funcUser = await prisma.user.create({
    data: {
      name: "Funcionario Agendamentos",
      email: "func@agendamentos.com",
      phone: "(11) 90000-0003",
      password: defaultPassword,
      role: "Funcionario",
      status: "Ativo",
      initials: "FH",
      last: "Hoje",
      failedLoginAttempts: 0,
    },
  });

  console.log("Seeding Services...");
  const s1 = await prisma.service.create({
    data: {
      name: "Consulta Inicial",
      description: "Avaliação completa de saúde estática",
      duration: 30,
      price: 150.0,
      status: "Ativo",
      color: "#10b981",
    },
  });

  const s2 = await prisma.service.create({
    data: {
      name: "Harmonização Facial",
      description: "Procedimento estético avançado",
      duration: 90,
      price: 1200.0,
      status: "Ativo",
      color: "#8b5cf6",
    },
  });

  const s3 = await prisma.service.create({
    data: {
      name: "Botox",
      description: "Toxina botulínica áreas da face",
      duration: 45,
      price: 850.0,
      status: "Ativo",
      color: "#3b82f6",
    },
  });

  const s4 = await prisma.service.create({
    data: {
      name: "Limpeza de Pele",
      description: "Limpeza profunda com hidratação",
      duration: 60,
      price: 220.0,
      status: "Ativo",
      color: "#f59e0b",
    },
  });

  const s5 = await prisma.service.create({
    data: {
      name: "Preenchimento Labial",
      description: "Preenchimento com ácido hialurônico",
      duration: 60,
      price: 950.0,
      status: "Ativo",
      color: "#ec4899",
    },
  });

  console.log("Seeding Products...");
  const p1 = await prisma.product.create({
    data: {
      name: "Sérum Anti-idade Ácido Hialurônico 30ml",
      category: "Skincare",
      price: 180.0,
      quantity: 25,
      status: "Ativo",
    },
  });

  const p2 = await prisma.product.create({
    data: {
      name: "Protetor Solar Facial FPS 70",
      category: "Proteção Solar",
      price: 95.0,
      quantity: 40,
      status: "Ativo",
    },
  });

  const p3 = await prisma.product.create({
    data: {
      name: "Máscara Hidratante Ouro 100g",
      category: "Tratamento",
      price: 140.0,
      quantity: 15,
      status: "Ativo",
    },
  });

  const p4 = await prisma.product.create({
    data: {
      name: "Sabonete Facial Purificante 150ml",
      category: "Higienização",
      price: 65.0,
      quantity: 30,
      status: "Ativo",
    },
  });

  const p5 = await prisma.product.create({
    data: {
      name: "Kit Pós-procedimento Facial",
      category: "Kits",
      price: 250.0,
      quantity: 10,
      status: "Ativo",
    },
  });

  console.log("Seeding Clients...");
  const c1 = await prisma.client.create({
    data: {
      name: "Ana Silva",
      email: "ana.silva@email.com",
      phone: "(11) 98888-1111",
      cpf: "123.456.789-01",
      status: "Ativo",
      initials: "AS",
    },
  });

  const c2 = await prisma.client.create({
    data: {
      name: "Carlos Santos",
      email: "carlos.santos@email.com",
      phone: "(11) 98888-2222",
      cpf: "234.567.890-12",
      status: "Ativo",
      initials: "CS",
    },
  });

  const c3 = await prisma.client.create({
    data: {
      name: "Mariana Oliveira",
      email: "mariana.o@email.com",
      phone: "(11) 98888-3333",
      cpf: "345.678.901-23",
      status: "Ativo",
      initials: "MO",
    },
  });

  const c4 = await prisma.client.create({
    data: {
      name: "Beatriz Costa",
      email: "beatriz.c@email.com",
      phone: "(11) 98888-4444",
      cpf: "456.789.012-34",
      status: "Ativo",
      initials: "BC",
    },
  });

  console.log("Seeding Appointments...");
  const apptList = [
    { date: "2026-08-01", time: "09:00", name: "Ana Silva", service: "Consulta Inicial", duration: "30m", status: "Concluído", initials: "AS", channelId: "digital", userId: adminUser.id, clientId: c1.id, serviceId: s1.id },
    { date: "2026-08-02", time: "10:00", name: "Carlos Santos", service: "Harmonização Facial", duration: "90m", status: "Concluído", initials: "CS", channelId: "whatsapp", userId: adminUser.id, clientId: c2.id, serviceId: s2.id },
    { date: "2026-08-03", time: "14:00", name: "Mariana Oliveira", service: "Botox", duration: "45m", status: "Concluído", initials: "MO", channelId: "digital", userId: gestorUser.id, clientId: c3.id, serviceId: s3.id },
    { date: "2026-08-04", time: "11:00", name: "Beatriz Costa", service: "Limpeza de Pele", duration: "60m", status: "Concluído", initials: "BC", channelId: "presencial", userId: funcUser.id, clientId: c4.id, serviceId: s4.id },
    { date: "2026-08-05", time: "15:00", name: "Ana Silva", service: "Preenchimento Labial", duration: "60m", status: "Confirmado", initials: "AS", channelId: "digital", userId: adminUser.id, clientId: c1.id, serviceId: s5.id },
    { date: "2026-07-15", time: "09:30", name: "Carlos Santos", service: "Botox", duration: "45m", status: "Concluído", initials: "CS", channelId: "whatsapp", userId: gestorUser.id, clientId: c2.id, serviceId: s3.id },
    { date: "2026-07-20", time: "13:00", name: "Mariana Oliveira", service: "Consulta Inicial", duration: "30m", status: "Concluído", initials: "MO", channelId: "digital", userId: adminUser.id, clientId: c3.id, serviceId: s1.id },
    { date: "2026-06-10", time: "10:30", name: "Beatriz Costa", service: "Harmonização Facial", duration: "90m", status: "Concluído", initials: "BC", channelId: "presencial", userId: adminUser.id, clientId: c4.id, serviceId: s2.id },
    { date: "2026-05-18", time: "16:00", name: "Ana Silva", service: "Limpeza de Pele", duration: "60m", status: "Concluído", initials: "AS", channelId: "digital", userId: funcUser.id, clientId: c1.id, serviceId: s4.id },
  ];

  for (const appt of apptList) {
    await prisma.appointment.create({ data: appt });
  }

  console.log("Seeding Sales...");
  const salesList = [
    { productId: p1.id, quantity: 2, unitPrice: 180.0, totalPrice: 360.0, paymentMethod: "Pix", createdById: adminUser.id, createdAt: new Date("2026-08-01T14:30:00Z") },
    { productId: p2.id, quantity: 3, unitPrice: 95.0, totalPrice: 285.0, paymentMethod: "Crédito", createdById: adminUser.id, createdAt: new Date("2026-08-02T11:20:00Z") },
    { productId: p5.id, quantity: 1, unitPrice: 250.0, totalPrice: 250.0, paymentMethod: "Pix", createdById: gestorUser.id, createdAt: new Date("2026-08-03T16:10:00Z") },
    { productId: p3.id, quantity: 2, unitPrice: 140.0, totalPrice: 280.0, paymentMethod: "Débito", createdById: funcUser.id, createdAt: new Date("2026-08-04T12:00:00Z") },
    { productId: p4.id, quantity: 4, unitPrice: 65.0, totalPrice: 260.0, paymentMethod: "Dinheiro", createdById: adminUser.id, createdAt: new Date("2026-08-05T17:45:00Z") },
    { productId: p1.id, quantity: 1, unitPrice: 180.0, totalPrice: 180.0, paymentMethod: "Pix", createdById: gestorUser.id, createdAt: new Date("2026-07-15T10:00:00Z") },
    { productId: p5.id, quantity: 2, unitPrice: 250.0, totalPrice: 500.0, paymentMethod: "Crédito", createdById: adminUser.id, createdAt: new Date("2026-07-22T15:30:00Z") },
    { productId: p2.id, quantity: 2, unitPrice: 95.0, totalPrice: 190.0, paymentMethod: "Pix", createdById: funcUser.id, createdAt: new Date("2026-06-12T14:00:00Z") },
  ];

  for (const sale of salesList) {
    await prisma.sale.create({ data: sale });
  }

  console.log("Database seeded successfully with realistic data!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });