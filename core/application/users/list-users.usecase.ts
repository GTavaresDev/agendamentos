import { User } from "@core/domain/users/user.entity";
import { UserRepository } from "@core/domain/users/user.repository";

export interface ListUsersFilter {
  search?: string;
  role?: string;
  status?: string;
}

export class ListUsers {
  constructor(private userRepository: UserRepository) {}

  async execute(filter?: ListUsersFilter): Promise<User[]> {
    let allUsers = await this.userRepository.findAll();

    if (filter?.search) {
      const query = filter.search.toLowerCase();
      allUsers = allUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          u.phone.includes(query),
      );
    }

    if (filter?.role && filter.role !== "Todos") {
      allUsers = allUsers.filter((u) => u.role === filter.role);
    }

    if (filter?.status && filter.status !== "Todos") {
      allUsers = allUsers.filter((u) => u.status === filter.status);
    }

    return allUsers;
  }
}
