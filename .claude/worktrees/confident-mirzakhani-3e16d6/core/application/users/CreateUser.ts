import { StaffRole, User } from "@core/domain/users/User";
import { UserRepository } from "@core/domain/users/UserRepository";

export interface CreateUserInput {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role?: StaffRole;
  status?: "Ativo" | "Inativo";
}

export class CreateUser {
  constructor(private userRepository: UserRepository) {}

  async execute(input: CreateUserInput): Promise<User> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new Error("Já existe um usuário cadastrado com este e-mail.");
    }

    const initials = User.generateInitials(input.name);
    const user = new User({
      id: crypto.randomUUID(),
      name: input.name,
      email: input.email.trim().toLowerCase(),
      phone: input.phone || "",
      password: input.password || null,
      role: input.role || "Funcionario",
      status: input.status || "Ativo",
      last: "Recém criado",
      initials,
      failedLoginAttempts: 0,
      lockedUntil: null,
    });

    return await this.userRepository.save(user);
  }
}
