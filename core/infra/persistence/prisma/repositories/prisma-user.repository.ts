import { prisma } from "../client";
import { User } from "@core/domain/users/user.entity";
import { UserRepository } from "@core/domain/users/user.repository";
import { UserMapper } from "../mappers/user.mapper";
import { CacheKeys, CacheTTL, getCached, invalidate } from "../../../cache";

export class PrismaUserRepository implements UserRepository {
  async findAll(): Promise<User[]> {
    try {
      const records = await getCached(CacheKeys.users, CacheTTL.users, async () => {
        // O hash de senha nunca entra no Redis. Quem autentica é findByEmail,
        // que não passa por cache — findAll só alimenta listagens.
        const rows = await prisma.user.findMany({
          omit: { password: true },
          include: { permissions: { where: { enabled: true } } },
          orderBy: { createdAt: "desc" },
        });
        return rows.map((row) => ({ ...row, password: null }));
      });
      return records.map(UserMapper.toDomain);
    } catch (error) {
      console.error("[PrismaUserRepository.findAll] Database query failed:", error);
      throw error;
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const record = await prisma.user.findUnique({
        where: { id },
        include: { permissions: { where: { enabled: true } } },
      });
      return record ? UserMapper.toDomain(record) : null;
    } catch (error) {
      console.error("[PrismaUserRepository.findById] Database query failed:", error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const record = await prisma.user.findUnique({
        where: { email },
        include: { permissions: { where: { enabled: true } } },
      });
      return record ? UserMapper.toDomain(record) : null;
    } catch (error) {
      console.error("[PrismaUserRepository.findByEmail] Database query failed:", error);
      throw error;
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
      include: { permissions: { where: { enabled: true } } },
    });
    await invalidate(CacheKeys.users);
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
      include: { permissions: { where: { enabled: true } } },
    });
    await invalidate(CacheKeys.users);
    return UserMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
    await invalidate(CacheKeys.users);
  }
}
