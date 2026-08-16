import { prisma } from '../client';
import { IPermissionRepository } from '@core/domain/users/permission.repository';
import { UserPermission, UserPermissionProps } from '@core/domain/users/user-permission.entity';
import { SystemPermission, SystemPermissionProps } from '@core/domain/users/system-permission.entity';
import { CacheKeys, invalidate } from '../../../cache';

export class PrismaPermissionRepository implements IPermissionRepository {
  async findUserPermissions(userId: string): Promise<UserPermission[]> {
    const perms = await prisma.userPermission.findMany({
      where: { userId, enabled: true },
    });
    return perms.map(p => new UserPermission(p as UserPermissionProps));
  }

  async findUserPermission(userId: string, permissionName: string): Promise<UserPermission | null> {
    const perm = await prisma.userPermission.findUnique({
      where: { userId_name: { userId, name: permissionName } },
    });
    return perm ? new UserPermission(perm as UserPermissionProps) : null;
  }

  async grantPermission(userId: string, permissionName: string): Promise<UserPermission> {
    const perm = await prisma.userPermission.upsert({
      where: { userId_name: { userId, name: permissionName } },
      update: { enabled: true, updatedAt: new Date() },
      create: {
        userId,
        name: permissionName,
        enabled: true,
        isSystemPermission: false,
      },
    });
    // `users:all` carrega as permissões habilitadas de cada usuário.
    await invalidate(CacheKeys.users);
    return new UserPermission(perm as UserPermissionProps);
  }

  async revokePermission(userId: string, permissionName: string): Promise<void> {
    await prisma.userPermission.updateMany({
      where: { userId, name: permissionName },
      data: { enabled: false, updatedAt: new Date() },
    });
    await invalidate(CacheKeys.users);
  }

  async hasPermission(userId: string, permissionName: string): Promise<boolean> {
    const perm = await this.findUserPermission(userId, permissionName);
    return perm !== null;
  }

  async findAllSystemPermissions(): Promise<SystemPermission[]> {
    const perms = await prisma.systemPermission.findMany({
      orderBy: { category: 'asc' },
    });
    return perms.map(p => new SystemPermission(p as SystemPermissionProps));
  }

  async findActiveSystemPermissions(): Promise<SystemPermission[]> {
    const perms = await prisma.systemPermission.findMany({
      where: { enabled: true },
      orderBy: { category: 'asc' },
    });
    return perms.map(p => new SystemPermission(p as SystemPermissionProps));
  }

  async findSystemPermission(name: string): Promise<SystemPermission | null> {
    const perm = await prisma.systemPermission.findUnique({
      where: { name },
    });
    return perm ? new SystemPermission(perm as SystemPermissionProps) : null;
  }

  async createSystemPermission(props: SystemPermissionProps): Promise<SystemPermission> {
    const perm = await prisma.systemPermission.create({
      data: {
        name: props.name,
        description: props.description,
        category: props.category,
        enabled: props.enabled,
        requiresHierarchy: props.requiresHierarchy,
      },
    });
    return new SystemPermission(perm as SystemPermissionProps);
  }

  async updateSystemPermission(id: number, updates: Partial<SystemPermissionProps>): Promise<SystemPermission> {
    const perm = await prisma.systemPermission.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    });
    return new SystemPermission(perm as SystemPermissionProps);
  }

  async deleteSystemPermission(id: number): Promise<void> {
    await prisma.systemPermission.delete({
      where: { id },
    });
  }
}
