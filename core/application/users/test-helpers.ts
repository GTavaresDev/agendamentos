import { vi, type Mocked } from "vitest";
import { User, type UserProps } from "@core/domain/users/user.entity";
import type { UserRepository } from "@core/domain/users/user.repository";
import type { IPermissionRepository } from "@core/domain/users/permission.repository";

export function buildUser(overrides: Partial<UserProps> = {}): User {
  return new User({
    id: "u1",
    name: "Maria Silva",
    email: "maria@example.com",
    phone: "11999999999",
    password: "$2a$12$hashedpasswordvalueabcdefghijklmno",
    role: "Funcionario",
    status: "Ativo",
    initials: "MS",
    failedLoginAttempts: 0,
    lockedUntil: null,
    permissions: [],
    ...overrides,
  });
}

export function mockUserRepository(): Mocked<UserRepository> {
  return {
    findAll: vi.fn(),
    findById: vi.fn(),
    findByEmail: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  } as unknown as Mocked<UserRepository>;
}

export function mockPermissionRepository(): Mocked<IPermissionRepository> {
  return {
    findUserPermissions: vi.fn(),
    findUserPermission: vi.fn(),
    grantPermission: vi.fn(),
    revokePermission: vi.fn(),
    hasPermission: vi.fn(),
    findAllSystemPermissions: vi.fn(),
    findActiveSystemPermissions: vi.fn(),
    findSystemPermission: vi.fn(),
    createSystemPermission: vi.fn(),
    updateSystemPermission: vi.fn(),
    deleteSystemPermission: vi.fn(),
  } as unknown as Mocked<IPermissionRepository>;
}
