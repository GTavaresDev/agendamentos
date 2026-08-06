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
  console.log("URL:", targetUrl.replace(/:[^:@]+@/, ":****@"));

  const passwordHash = await hashPassword("zxcasd");

  console.log("\n1. Criando/Atualizando usuário Admin Master...");
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@harmonize.com" },
    update: {
      id: MASTER_ADMIN_ID,
      name: "Admin Harmonize",
      phone: "(11) 90000-0001",
      password: passwordHash,
      role: "Administrador",
      status: "Ativo",
      initials: "AH",
      last: "Online",
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    create: {
      id: MASTER_ADMIN_ID,
      name: "Admin Harmonize",
      email: "admin@harmonize.com",
      phone: "(11) 90000-0001",
      password: passwordHash,
      role: "Administrador",
      status: "Ativo",
      initials: "AH",
      last: "Online",
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    include: { permissions: true },
  });

  console.log(` Admin pronto: ${adminUser.email} (${adminUser.id})`);

  console.log("\n2. Atribuindo permissão 'Administrador'...");
  const hasAdminPerm = adminUser.permissions.some((p) => p.name === "Administrador");

  if (!hasAdminPerm) {
    await prisma.userPermission.create({
      data: {
        name: "Administrador",
        userId: adminUser.id,
      },
    });
    console.log(" Permissão 'Administrador' vinculada com sucesso!");
  } else {
    console.log(" Permissão 'Administrador' já existente.");
  }

  console.log("\n=== Setup Concluído com Sucesso! ===");
}

main()
  .catch((e) => {
    console.error("\n Erro ao executar setup de produção:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
