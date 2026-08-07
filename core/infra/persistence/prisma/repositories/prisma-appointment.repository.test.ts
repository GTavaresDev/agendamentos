import { describe, expect, it, vi, beforeEach } from "vitest";

const prismaMock = {
  appointment: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

vi.mock("../client", () => ({ prisma: prismaMock }));

const { PrismaAppointmentRepository } = await import("./prisma-appointment.repository");

const rawAppointment = {
  id: "a1",
  date: "2026-08-06",
  time: "09:00",
  name: "Maria Silva",
  service: "Corte",
  duration: "30 min",
  status: "Confirmado",
  initials: "MS",
  channelId: "site",
  notes: null,
  userId: null,
  clientId: null,
  serviceId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("PrismaAppointmentRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("findAll maps records to domain entities", async () => {
    prismaMock.appointment.findMany.mockResolvedValue([rawAppointment]);
    const repo = new PrismaAppointmentRepository();

    const result = await repo.findAll();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("a1");
  });

  it("findAll rethrows and logs on query failure", async () => {
    const error = new Error("db down");
    prismaMock.appointment.findMany.mockRejectedValue(error);
    const repo = new PrismaAppointmentRepository();

    await expect(repo.findAll()).rejects.toThrow(error);
  });

  it("findById returns null when not found", async () => {
    prismaMock.appointment.findUnique.mockResolvedValue(null);
    const repo = new PrismaAppointmentRepository();

    expect(await repo.findById("missing")).toBeNull();
  });

  it("findByDate scopes the query by date", async () => {
    prismaMock.appointment.findMany.mockResolvedValue([rawAppointment]);
    const repo = new PrismaAppointmentRepository();

    await repo.findByDate("2026-08-06");

    expect(prismaMock.appointment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { date: "2026-08-06" } }),
    );
  });

  it("delete calls prisma.appointment.delete with the given id", async () => {
    prismaMock.appointment.delete.mockResolvedValue(undefined);
    const repo = new PrismaAppointmentRepository();

    await repo.delete("a1");

    expect(prismaMock.appointment.delete).toHaveBeenCalledWith({ where: { id: "a1" } });
  });
});
