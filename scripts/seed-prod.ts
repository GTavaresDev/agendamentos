import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../core/infra/auth/password";

const prodDatabaseUrl =
  process.argv[2] ||
  process.env.PROD_DATABASE_URL ||
  process.env.DATABASE_URL;

if (!prodDatabaseUrl) {
  console.error("Erro: Nenhuma URL de banco de dados fornecida.");
  console.log('Uso: npx tsx scripts/seed-prod.ts "POSTGRESQL_URL_PRODUCAO"');
  process.exit(1);
}

const targetUrl: string = prodDatabaseUrl;
const MASTER_ADMIN_ID = "bb323bc0-f216-4309-8ef5-db9ea664e845";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: targetUrl,
    },
  },
});

async function main() {
  console.log("=== Inicializando Setup no Banco de Produção ===");
  console.log("URL Target:", targetUrl.replace(/:[^:@]+@/, ":****@"));

  // 1. Garantir Permissões do Sistema em Produção
  console.log("\n1. Criando/Atualizando Permissões do Sistema...");
  const permissions = [
    {
      name: "ver_relatorios",
      description: "Permite acesso ao módulo de Relatórios",
      category: "reports",
    },
    {
      name: "compartilhar_permissoes",
      description: "Permite atribuir permissões a outros usuários",
      category: "admin",
    },
  ];

  for (const perm of permissions) {
    await prisma.systemPermission.upsert({
      where: { name: perm.name },
      update: {
        description: perm.description,
        category: perm.category,
        enabled: true,
      },
      create: {
        name: perm.name,
        description: perm.description,
        category: perm.category,
        enabled: true,
        requiresHierarchy: false,
      },
    });
    console.log(` ✓ Permissão do sistema '${perm.name}' OK`);
  }

  // 2. Criar/Atualizar usuário Admin Master (admin@agendamentos.com)
  console.log("\n2. Criando/Atualizando usuário Admin Master...");
  const adminPasswordHash = await hashPassword("zxcasd");
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@agendamentos.com" },
    update: {
      id: MASTER_ADMIN_ID,
      name: "Admin Agendamentos",
      phone: "(11) 90000-0001",
      password: adminPasswordHash,
      role: "Administrador",
      status: "Ativo",
      initials: "AA",
      last: "Online",
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    create: {
      id: MASTER_ADMIN_ID,
      name: "Admin Agendamentos",
      email: "admin@agendamentos.com",
      phone: "(11) 90000-0001",
      password: adminPasswordHash,
      role: "Administrador",
      status: "Ativo",
      initials: "AA",
      last: "Online",
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });
  console.log(` Admin Master pronto: ${adminUser.email}`);

  // 3. Criar/Atualizar usuário Gabriel (gabriel@agendamentos.com - Nível 1 + ver_relatorios)
  console.log("\n3. Criando/Atualizando usuário Gabriel (Nível 1)...");
  const gabrielPasswordHash = await hashPassword("lkjh-poiu-zxc10");
  const gabrielUser = await prisma.user.upsert({
    where: { email: "gabriel@agendamentos.com" },
    update: {
      name: "Gabriel",
      password: gabrielPasswordHash,
      role: "Administrador", // Nível 1
      status: "Ativo",
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    create: {
      name: "Gabriel",
      email: "gabriel@agendamentos.com",
      phone: "(11) 99999-9999",
      password: gabrielPasswordHash,
      role: "Administrador", // Nível 1
      status: "Ativo",
      initials: "GA",
      last: "Online",
      failedLoginAttempts: 0,
    },
  });

  // Vincular permissões ao Gabriel
  for (const perm of permissions) {
    await prisma.userPermission.upsert({
      where: {
        userId_name: {
          userId: gabrielUser.id,
          name: perm.name,
        },
      },
      update: { enabled: true },
      create: {
        userId: gabrielUser.id,
        name: perm.name,
        description: perm.description,
        enabled: true,
        isSystemPermission: false,
      },
    });
  }
  console.log(` Usuário Gabriel pronto: ${gabrielUser.email} (Administrador / ver_relatorios)`);

  // 4. Seeding Services
  console.log("\n4. Criando/Atualizando Serviços...");
  const s1 = await prisma.service.upsert({
    where: { id: "srv-1" },
    update: { name: "Consulta Inicial", price: 150.0, color: "#10b981" },
    create: { id: "srv-1", name: "Consulta Inicial", description: "Avaliação inicial", duration: 30, price: 150.0, status: "Ativo", color: "#10b981" },
  });
  const s2 = await prisma.service.upsert({
    where: { id: "srv-2" },
    update: { name: "Harmonização Facial", price: 1200.0, color: "#8b5cf6" },
    create: { id: "srv-2", name: "Harmonização Facial", description: "Procedimento estético avançado", duration: 90, price: 1200.0, status: "Ativo", color: "#8b5cf6" },
  });
  const s3 = await prisma.service.upsert({
    where: { id: "srv-3" },
    update: { name: "Botox", price: 850.0, color: "#3b82f6" },
    create: { id: "srv-3", name: "Botox", description: "Toxina botulínica facial", duration: 45, price: 850.0, status: "Ativo", color: "#3b82f6" },
  });
  const s4 = await prisma.service.upsert({
    where: { id: "srv-4" },
    update: { name: "Limpeza de Pele", price: 220.0, color: "#f59e0b" },
    create: { id: "srv-4", name: "Limpeza de Pele", description: "Limpeza profunda facial", duration: 60, price: 220.0, status: "Ativo", color: "#f59e0b" },
  });
  const s5 = await prisma.service.upsert({
    where: { id: "srv-5" },
    update: { name: "Preenchimento Labial", price: 950.0, color: "#ec4899" },
    create: { id: "srv-5", name: "Preenchimento Labial", description: "Preenchimento labial com ácido", duration: 60, price: 950.0, status: "Ativo", color: "#ec4899" },
  });

  // 5. Seeding Products
  console.log("\n5. Criando/Atualizando Produtos...");
  const p1 = await prisma.product.upsert({
    where: { id: "prod-1" },
    update: { name: "Sérum Anti-idade Ácido Hialurônico 30ml", price: 180.0 },
    create: { id: "prod-1", name: "Sérum Anti-idade Ácido Hialurônico 30ml", category: "Skincare", price: 180.0, quantity: 25, status: "Ativo" },
  });
  const p2 = await prisma.product.upsert({
    where: { id: "prod-2" },
    update: { name: "Protetor Solar Facial FPS 70", price: 95.0 },
    create: { id: "prod-2", name: "Protetor Solar Facial FPS 70", category: "Proteção Solar", price: 95.0, quantity: 40, status: "Ativo" },
  });
  const p3 = await prisma.product.upsert({
    where: { id: "prod-3" },
    update: { name: "Kit Pós-procedimento Facial", price: 250.0 },
    create: { id: "prod-3", name: "Kit Pós-procedimento Facial", category: "Kits", price: 250.0, quantity: 15, status: "Ativo" },
  });
  const p4 = await prisma.product.upsert({
    where: { id: "prod-4" },
    update: { name: "Sabonete Facial Purificante 150ml", price: 65.0 },
    create: { id: "prod-4", name: "Sabonete Facial Purificante 150ml", category: "Higienização", price: 65.0, quantity: 30, status: "Ativo" },
  });

  // 6. Seeding Clients
  console.log("\n6. Criando/Atualizando Clientes...");
  const c1 = await prisma.client.upsert({
    where: { email: "ana.silva@email.com" },
    update: { name: "Ana Silva" },
    create: { id: "cli-1", name: "Ana Silva", email: "ana.silva@email.com", phone: "(11) 98888-1111", cpf: "123.456.789-01", status: "Ativo", initials: "AS" },
  });
  const c2 = await prisma.client.upsert({
    where: { email: "carlos.santos@email.com" },
    update: { name: "Carlos Santos" },
    create: { id: "cli-2", name: "Carlos Santos", email: "carlos.santos@email.com", phone: "(11) 98888-2222", cpf: "234.567.890-12", status: "Ativo", initials: "CS" },
  });
  const c3 = await prisma.client.upsert({
    where: { email: "mariana.o@email.com" },
    update: { name: "Mariana Oliveira" },
    create: { id: "cli-3", name: "Mariana Oliveira", email: "mariana.o@email.com", phone: "(11) 98888-3333", cpf: "345.678.901-23", status: "Ativo", initials: "MO" },
  });

  // 7. Seeding Appointments
  console.log("\n7. Criando/Atualizando Agendamentos com Receita...");
  const apptList = [
    { id: "apt-1", date: "2026-08-01", time: "09:00", name: "Ana Silva", service: "Consulta Inicial", duration: "30m", status: "Concluído", initials: "AS", channelId: "digital", userId: adminUser.id, clientId: c1.id, serviceId: s1.id },
    { id: "apt-2", date: "2026-08-02", time: "10:00", name: "Carlos Santos", service: "Harmonização Facial", duration: "90m", status: "Concluído", initials: "CS", channelId: "whatsapp", userId: adminUser.id, clientId: c2.id, serviceId: s2.id },
    { id: "apt-3", date: "2026-08-03", time: "14:00", name: "Mariana Oliveira", service: "Botox", duration: "45m", status: "Concluído", initials: "MO", channelId: "digital", userId: gabrielUser.id, clientId: c3.id, serviceId: s3.id },
    { id: "apt-4", date: "2026-08-04", time: "11:00", name: "Ana Silva", service: "Limpeza de Pele", duration: "60m", status: "Concluído", initials: "AS", channelId: "presencial", userId: adminUser.id, clientId: c1.id, serviceId: s4.id },
    { id: "apt-5", date: "2026-08-05", time: "15:00", name: "Carlos Santos", service: "Preenchimento Labial", duration: "60m", status: "Confirmado", initials: "CS", channelId: "digital", userId: gabrielUser.id, clientId: c2.id, serviceId: s5.id },
    { id: "apt-6", date: "2026-07-15", time: "09:30", name: "Ana Silva", service: "Botox", duration: "45m", status: "Concluído", initials: "AS", channelId: "whatsapp", userId: adminUser.id, clientId: c1.id, serviceId: s3.id },
    { id: "apt-7", date: "2026-07-20", time: "13:00", name: "Mariana Oliveira", service: "Consulta Inicial", duration: "30m", status: "Concluído", initials: "MO", channelId: "digital", userId: gabrielUser.id, clientId: c3.id, serviceId: s1.id },
    { id: "apt-8", date: "2026-06-10", time: "10:30", name: "Carlos Santos", service: "Harmonização Facial", duration: "90m", status: "Concluído", initials: "CS", channelId: "presencial", userId: adminUser.id, clientId: c2.id, serviceId: s2.id },
  ];

  for (const appt of apptList) {
    await prisma.appointment.upsert({
      where: { id: appt.id },
      update: { date: appt.date, status: appt.status, serviceId: appt.serviceId },
      create: appt,
    });
  }

  // 8. Seeding Sales
  console.log("\n8. Criando/Atualizando Vendas de Produtos...");
  const salesList = [
    { id: "sale-1", productId: p1.id, quantity: 2, unitPrice: 180.0, totalPrice: 360.0, paymentMethod: "Pix", createdById: adminUser.id, createdAt: new Date("2026-08-01T14:30:00Z") },
    { id: "sale-2", productId: p2.id, quantity: 3, unitPrice: 95.0, totalPrice: 285.0, paymentMethod: "Crédito", createdById: adminUser.id, createdAt: new Date("2026-08-02T11:20:00Z") },
    { id: "sale-3", productId: p3.id, quantity: 2, unitPrice: 250.0, totalPrice: 500.0, paymentMethod: "Pix", createdById: gabrielUser.id, createdAt: new Date("2026-08-03T16:10:00Z") },
    { id: "sale-4", productId: p4.id, quantity: 4, unitPrice: 65.0, totalPrice: 260.0, paymentMethod: "Débito", createdById: adminUser.id, createdAt: new Date("2026-08-04T12:00:00Z") },
    { id: "sale-5", productId: p1.id, quantity: 1, unitPrice: 180.0, totalPrice: 180.0, paymentMethod: "Pix", createdById: gabrielUser.id, createdAt: new Date("2026-07-15T10:00:00Z") },
    { id: "sale-6", productId: p3.id, quantity: 1, unitPrice: 250.0, totalPrice: 250.0, paymentMethod: "Crédito", createdById: adminUser.id, createdAt: new Date("2026-07-22T15:30:00Z") },
  ];

  for (const sale of salesList) {
    await prisma.sale.upsert({
      where: { id: sale.id },
      update: { totalPrice: sale.totalPrice, createdAt: sale.createdAt },
      create: sale,
    });
  }

  console.log("\n=== Setup de Produção Concluído com Sucesso! ===");
}

main()
  .catch((e) => {
    console.error("\n Erro ao executar setup de produção:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
