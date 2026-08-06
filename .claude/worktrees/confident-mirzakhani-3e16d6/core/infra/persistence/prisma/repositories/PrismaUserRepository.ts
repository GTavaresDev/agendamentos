import { prisma } from "../client";
import { User } from "@core/domain/users/User";
import { UserRepository } from "@core/domain/users/UserRepository";
import { UserMapper } from "../mappers/UserMapper";

export class PrismaUserRepository implements UserRepository {
  async findAll(): Promise<User[]> {
    try {
      const records = await prisma.user.findMany({
        include: { permissions: true },
        orderBy: { createdAt: "desc" },
      });
      return records.map(UserMapper.toDomain);
    } catch {
      return [];
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const record = await prisma.user.findUnique({
        where: { id },
        include: { permissions: true },
      });
      return record ? UserMapper.toDomain(record) : null;
    } catch {
      return null;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const record = await prisma.user.findUnique({
        where: { email },
        include: { permissions: true },
      });
      return record ? UserMapper.toDomain(record) : null;
    } catch {
      return null;
    }
  }

  async save(user: User): Promise<User> {
    const raw = UserMapper.toPersistence(user);

    const created = await prisma.user.create({
      data: {
        id: raw.id,
        name: raw.name,
        email: raw.email,
        phone: raw.phone,
        ...(raw.password ? { password: raw.password } : {}),
        role: raw.role,
        status: raw.status,
        last: raw.last,
        initials: raw.initials,
        failedLoginAttempts: raw.failedLoginAttempts,
        lockedUntil: raw.lockedUntil,
        permissions: {
          create: [{ name: raw.role }],
        },
      },
      include: { permissions: true },
    });
    return UserMapper.toDomain(created);
  }

  async update(user: User): Promise<User> {
    const raw = UserMapper.toPersistence(user);
    const updated = await prisma.user.update({
      where: { id: raw.id },
      data: {
        name: raw.name,
        email: raw.email,
        phone: raw.phone,
        ...(raw.password ? { password: raw.password } : {}),
        role: raw.role,
        status: raw.status,
        last: raw.last,
        initials: raw.initials,
        failedLoginAttempts: raw.failedLoginAttempts,
        lockedUntil: raw.lockedUntil,
      },
      include: { permissions: true },
    });
    return UserMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }
}
