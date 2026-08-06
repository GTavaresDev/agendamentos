import { StaffRole, User } from "@core/domain/users/User";
import { UserRepository } from "@core/domain/users/UserRepository";

export interface UpdateUserInput {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: StaffRole;
  status?: "Ativo" | "Inativo";
  failedLoginAttempts?: number;
  lockedUntil?: Date | null;
  last?: string | null;
}

export class UpdateUser {
  constructor(private userRepository: UserRepository) {}

  async execute(input: UpdateUserInput): Promise<User> {
    const user = await this.userRepository.findById(input.id);
    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    const raw = user.toPersistenceJSON();
    const updated = new User({
      id: user.id,
      name: input.name ?? user.name,
      email: input.email ?? user.email,
      phone: input.phone ?? user.phone,
      password: input.password ?? user.password,
      role: input.role ?? user.role,
      status: input.status ?? user.status,
      last: input.last !== undefined ? input.last : user.last,
      initials: input.name ? User.generateInitials(input.name) : user.initials,
      permissions: user.permissions,
      failedLoginAttempts:
        input.failedLoginAttempts ?? raw.failedLoginAttempts ?? 0,
      lockedUntil:
        input.lockedUntil !== undefined ? input.lockedUntil : raw.lockedUntil,
      createdAt: user.createdAt,
    });

    return await this.userRepository.update(updated);
  }
}
