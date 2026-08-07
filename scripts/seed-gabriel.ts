import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../core/infra/auth/password";

const prisma = new PrismaClient();
const ADMIN_ID = "bb323bc0-f216-4309-8ef5-db9ea664e845";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function main() {
  console.log("=== Limpando e Semeando Dados (Gabriel) ===");

  await prisma.sale.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.userPermission.deleteMany({});
  await prisma.systemPermission.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.user.deleteMany({});

  const permissions = [
    { name: "ver_relatorios", description: "Permite acesso ao módulo de Relatórios", category: "reports", enabled: true, requiresHierarchy: false },
    { name: "compartilhar_permissoes", description: "Permite atribuir permissões a outros usuários", category: "admin", enabled: true, requiresHierarchy: false },
  ];
  await prisma.systemPermission.createMany({ data: permissions });

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
      permissions: { create: [{ name: "ver_relatorios" }, { name: "compartilhar_permissoes" }] },
    },
  });

  const gabrielUser = await prisma.user.create({
    data: {
      name: "Gabriel Tavares",
      email: "gabriel@agendamentos.com",
      phone: "(11) 99999-9999",
      password: gabrielPassword,
      role: "Administrador",
      status: "Ativo",
      initials: "GT",
      last: "Online",
      permissions: { create: [{ name: "ver_relatorios" }, { name: "compartilhar_permissoes" }] },
    },
  });

  const julianaUser = await prisma.user.create({
    data: {
      name: "Dra. Juliana Martins",
      email: "juliana@agendamentos.com",
      phone: "(11) 98888-0002",
      password: defaultPassword,
      role: "Esteticista",
      status: "Ativo",
      initials: "JM",
      last: "Há 1h",
      permissions: { create: [{ name: "ver_relatorios" }] },
    },
  });

  const camilaUser = await prisma.user.create({
    data: {
      name: "Dra. Camila Rocha",
      email: "camila@agendamentos.com",
      phone: "(11) 98888-0003",
      password: defaultPassword,
      role: "Dermatologista",
      status: "Ativo",
      initials: "CR",
      last: "Hoje",
      permissions: { create: [{ name: "ver_relatorios" }] },
    },
  });

  const funcUser = await prisma.user.create({
    data: {
      name: "Mariana Costa",
      email: "func@agendamentos.com",
      phone: "(11) 90000-0003",
      password: defaultPassword,
      role: "Funcionario",
      status: "Ativo",
      initials: "MC",
      last: "Hoje",
    },
  });

  const users = [adminUser, gabrielUser, julianaUser, camilaUser, funcUser];

  const serviceDefs = [
    { id: "srv-1", name: "Consulta Inicial", description: "Avaliação estética facial completa", duration: 30, price: 150.0, color: "#10b981" },
    { id: "srv-2", name: "Harmonização Facial", description: "Procedimento estético avançado com preenchedores", duration: 90, price: 1200.0, color: "#8b5cf6" },
    { id: "srv-3", name: "Botox", description: "Aplicação de toxina botulínica em terço superior", duration: 45, price: 850.0, color: "#3b82f6" },
    { id: "srv-4", name: "Limpeza de Pele", description: "Limpeza profunda com hidratação e extração", duration: 60, price: 220.0, color: "#f59e0b" },
    { id: "srv-5", name: "Preenchimento Labial", description: "Escultura e volumização labial com ácido hialurônico", duration: 60, price: 950.0, color: "#ec4899" },
    { id: "srv-6", name: "Peeling Químico", description: "Renovação celular e clareamento de manchas", duration: 45, price: 380.0, color: "#06b6d4" },
    { id: "srv-7", name: "Drenagem Linfática Facial", description: "Massagem desintoxicante e pós-operatória", duration: 45, price: 190.0, color: "#14b8a6" },
    { id: "srv-8", name: "Microagulhamento", description: "Indução percutânea de colágeno", duration: 60, price: 450.0, color: "#6366f1" },
  ];

  const createdServices = [];
  for (const s of serviceDefs) {
    const srv = await prisma.service.create({ data: { ...s, status: "Ativo" } });
    createdServices.push(srv);
  }

  const productDefs = [
    { id: "prod-1", name: "Sérum Anti-idade Ácido Hialurônico 30ml", category: "Skincare", price: 180.0, quantity: 45 },
    { id: "prod-2", name: "Protetor Solar Facial FPS 70", category: "Proteção Solar", price: 95.0, quantity: 80 },
    { id: "prod-3", name: "Máscara Hidratante Ouro 100g", category: "Tratamento", price: 140.0, quantity: 30 },
    { id: "prod-4", name: "Sabonete Facial Purificante 150ml", category: "Higienização", price: 65.0, quantity: 60 },
    { id: "prod-5", name: "Kit Pós-procedimento Facial", category: "Kits", price: 250.0, quantity: 25 },
    { id: "prod-6", name: "Tônico Facial Suavizante 200ml", category: "Skincare", price: 85.0, quantity: 40 },
    { id: "prod-7", name: "Creme Nutritivo Noturno 50g", category: "Skincare", price: 160.0, quantity: 35 },
  ];

  const createdProducts = [];
  for (const p of productDefs) {
    const prod = await prisma.product.create({ data: { ...p, status: "Ativo" } });
    createdProducts.push(prod);
  }

  const clientNames = [
    "Ana Paula Silva", "Carlos Eduardo Santos", "Mariana Oliveira", "Beatriz Costa", "Lucas Mendes",
    "Fernanda Lima", "Rodrigo Alves", "Juliana Barbosa", "Rafael Souza", "Camila Pereira",
    "Thiago Martins", "Vanessa Ribeiro", "Felipe Rocha", "Patricia Lima", "Gabriel Ferreira",
    "Larissa Gomez", "Diego Carvalho", "Renata Dias", "Marcelo Castro", "Aline Martins",
    "Bruno Xavier", "Carla Mendonça", "Daniel Fonseca", "Eduarda Ramos", "Fabio Nogueira",
    "Gabriela Teixeira", "Heitor Cardoso", "Isabela Duarte", "João Pedro Viana", "Katia Freitas",
    "Leonardo Silveira", "Manuela Aguiar", "Nicolas Barros", "Olivia Monteiro", "Paulo Roberto Nunes",
    "Priscila Faria", "Renan Borges", "Sabrina Neves", "Tatiana Machado", "Vinicius Peixoto",
    "Yasmin Figueiredo", "Arthur Moraes", "Bianca Antunes", "Caio Guimarães", "Debora Paiva",
    "Elisa Reis", "Fernando Marinho", "Giovanna Pires", "Hugo Brandão", "Ingrid Sales"
  ];

  const createdClients = [];
  for (let i = 0; i < clientNames.length; i++) {
    const name = clientNames[i];
    const cleanName = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, ".");
    const email = `${cleanName}@gmail.com`;
    const d1 = String(Math.floor(Math.random() * 899 + 100));
    const d2 = String(Math.floor(Math.random() * 899 + 100));
    const d3 = String(Math.floor(Math.random() * 899 + 100));
    const d4 = String(Math.floor(Math.random() * 89 + 10));
    const cpf = `${d1}.${d2}.${d3}-${d4}`;
    const phone = `(11) 9${Math.floor(Math.random() * 8999 + 1000)}-${Math.floor(Math.random() * 8999 + 1000)}`;

    const cli = await prisma.client.create({
      data: {
        id: `cli-${i + 1}`,
        name,
        email,
        phone,
        cpf,
        status: "Ativo",
        initials: getInitials(name),
      },
    });
    createdClients.push(cli);
  }

  const baseDate = new Date("2026-08-07T12:00:00Z");
  const timeSlots = ["08:30", "09:15", "10:00", "10:45", "11:30", "13:30", "14:30", "15:15", "16:00", "17:00", "18:00"];
  const channels = ["digital", "whatsapp", "presencial", "telefone"];
  const weightedServiceIndices = [0, 0, 0, 1, 2, 2, 2, 3, 3, 3, 3, 4, 4, 5, 6, 7];
  const weightedUserIndices = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4];

  let apptCount = 0;
  for (let dayOffset = 90; dayOffset >= 0; dayOffset--) {
    const currentDate = new Date(baseDate);
    currentDate.setDate(currentDate.getDate() - dayOffset);
    const dayOfWeek = currentDate.getDay();

    let countForDay = 0;
    if (dayOfWeek === 0) countForDay = Math.random() < 0.2 ? 1 : 0;
    else if (dayOfWeek === 1) countForDay = Math.floor(Math.random() * 3) + 1;
    else if (dayOfWeek === 6) countForDay = Math.floor(Math.random() * 4) + 2;
    else countForDay = Math.floor(Math.random() * 4) + 3;

    const usedSlots = new Set<string>();
    for (let k = 0; k < countForDay; k++) {
      const slotIndex = Math.floor(Math.random() * timeSlots.length);
      const time = timeSlots[slotIndex];
      if (usedSlots.has(time)) continue;
      usedSlots.add(time);

      const client = createdClients[Math.floor(Math.random() * createdClients.length)];
      const service = createdServices[weightedServiceIndices[Math.floor(Math.random() * weightedServiceIndices.length)]];
      const user = users[weightedUserIndices[Math.floor(Math.random() * weightedUserIndices.length)]];
      const channelId = channels[Math.floor(Math.random() * channels.length)];

      let status = "Concluído";
      if (dayOffset <= 2) {
        status = Math.random() > 0.3 ? "Confirmado" : "Concluído";
      } else {
        const rand = Math.random();
        if (rand < 0.82) status = "Concluído";
        else if (rand < 0.90) status = "Confirmado";
        else if (rand < 0.96) status = "Cancelado";
        else status = "Pendente";
      }

      apptCount++;
      const id = `apt-${apptCount}`;
      const dateStr = formatDate(currentDate);

      await prisma.appointment.create({
        data: {
          id,
          date: dateStr,
          time,
          name: client.name,
          service: service.name,
          duration: `${service.duration}m`,
          status,
          initials: client.initials,
          channelId,
          userId: user.id,
          clientId: client.id,
          serviceId: service.id,
          createdAt: new Date(currentDate.getTime() + (slotIndex * 3600000)),
        },
      });
    }
  }

  let salesCount = 0;
  const paymentMethods = ["Pix", "Pix", "Pix", "Crédito", "Crédito", "Débito", "Dinheiro"];

  for (let dayOffset = 90; dayOffset >= 0; dayOffset--) {
    const currentDate = new Date(baseDate);
    currentDate.setDate(currentDate.getDate() - dayOffset);
    if (currentDate.getDay() === 0 && Math.random() > 0.2) continue;

    const salesForDay = Math.floor(Math.random() * 4) + 2;
    for (let k = 0; k < salesForDay; k++) {
      const prod = createdProducts[Math.floor(Math.random() * createdProducts.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      const totalPrice = Number((prod.price * quantity).toFixed(2));
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

      salesCount++;
      const id = `sale-${salesCount}`;
      const saleDate = new Date(currentDate.getTime() + (Math.floor(Math.random() * 8 + 9) * 3600000));

      await prisma.sale.create({
        data: {
          id,
          productId: prod.id,
          quantity,
          unitPrice: prod.price,
          totalPrice,
          paymentMethod,
          createdById: user.id,
          createdAt: saleDate,
        },
      });
    }
  }

  console.log("=== Seed Gabriel Concluído com Sucesso! ===");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
