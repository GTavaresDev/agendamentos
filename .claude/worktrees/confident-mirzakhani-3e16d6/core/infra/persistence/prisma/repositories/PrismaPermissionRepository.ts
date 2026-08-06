import { PrismaClient } from '@prisma/client';
import { IPermissionRepository } from '@core/domain/users/PermissionRepository';
import { UserPermission, UserPermissionProps } from '@core/domain/users/UserPermission';
import { SystemPermission, SystemPermissionProps } from '@core/domain/users/SystemPermission';

const prisma = new PrismaClient();

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
    return new UserPermission(perm as UserPermissionProps);
  }

  async revokePermission(userId: string, permissionName: string): Promise<void> {
    await prisma.userPermission.updateMany({
      where: { userId, name: permissionName },
      data: { enabled: false, updatedAt: new Date() },
    });
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
