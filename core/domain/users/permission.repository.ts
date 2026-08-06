import { UserPermission } from './user-permission.entity';
import { SystemPermission, SystemPermissionProps } from './system-permission.entity';

export interface IPermissionRepository {
  // User Permissions
  findUserPermissions(userId: string): Promise<UserPermission[]>;
  findUserPermission(userId: string, permissionName: string): Promise<UserPermission | null>;
  grantPermission(userId: string, permissionName: string): Promise<UserPermission>;
  revokePermission(userId: string, permissionName: string): Promise<void>;
  hasPermission(userId: string, permissionName: string): Promise<boolean>;

  // System Permissions
  findAllSystemPermissions(): Promise<SystemPermission[]>;
  findActiveSystemPermissions(): Promise<SystemPermission[]>;
  findSystemPermission(name: string): Promise<SystemPermission | null>;
  createSystemPermission(props: SystemPermissionProps): Promise<SystemPermission>;
  updateSystemPermission(id: number, updates: Partial<SystemPermissionProps>): Promise<SystemPermission>;
  deleteSystemPermission(id: number): Promise<void>;
}
