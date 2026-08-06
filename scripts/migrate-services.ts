import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrateServices() {
  console.log("Starting service migration...");

  // Get all unique services from appointments
  const appointments = await prisma.appointment.findMany({
    select: { service: true },
    distinct: ["service"],
  });

  const uniqueServices = appointments
    .map((a) => a.service)
    .filter(Boolean) as string[];

  console.log(`Found ${uniqueServices.length} unique services`);

  // Create Service records for each unique service
  const serviceMap = new Map<string, string>();

  for (const serviceName of uniqueServices) {
    let service = await prisma.service.findFirst({
      where: { name: serviceName },
    });

    if (!service) {
      service = await prisma.service.create({
        data: {
          name: serviceName,
          description: "",
          duration: 60,
          status: "Ativo",
        },
      });
      console.log(`Created service: ${serviceName}`);
    }

    serviceMap.set(serviceName, service.id);
  }

  // Link appointments to services
  let updatedCount = 0;
  for (const [serviceName, serviceId] of serviceMap) {
    const result = await prisma.appointment.updateMany({
      where: { service: serviceName },
      data: { serviceId },
    });
    updatedCount += result.count;
    console.log(`Updated ${result.count} appointments for service: ${serviceName}`);
  }

  console.log(`✓ Migration complete: ${updatedCount} appointments linked to services`);
}

migrateServices()
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
