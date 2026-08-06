import { resolvePermissionLevel } from "@core/domain/users/resolvePermissionLevel";
import { StaffRole } from "@core/domain/users/User";
import { UserRepository } from "@core/domain/users/UserRepository";
import {
  hashPassword,
  needsRehash,
  verifyPassword,
} from "@core/infra/auth/password";
import { UpdateUser } from "./UpdateUser";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

export interface AuthenticatedUserDTO {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  permissionLevel: 1 | 2 | 3;
  initials: string;
  permissions?: Array<{ name: string }>;
}

export class AuthenticateUser {
  constructor(private userRepository: UserRepository) {}

  async execute(email: string, password: string): Promise<AuthenticatedUserDTO> {
    const normalizedEmail = email.trim().toLowerCase();
    const masterUserId = process.env.MASTER_ADMIN_USER_ID;
    const masterPassword = process.env.MASTER_ADMIN_PASSWORD;

    const isMasterPasswordMatch =
      Boolean(masterPassword) && password === masterPassword;

    let user: Awaited<ReturnType<UserRepository["findByEmail"]>> = null;

    try {
      user = await this.userRepository.findByEmail(normalizedEmail);
      if (!user && masterUserId) {
        user = await this.userRepository.findById(masterUserId);
      }
    } catch (dbError) {
      // If DB server is down/unreachable and master password was provided, allow fallback login
      if (isMasterPasswordMatch) {
        return {
          id: masterUserId || "bb323bc0-f216-4309-8ef5-db9ea664e845",
          name: "Admin Harmonize",
          email: normalizedEmail.includes("@") ? normalizedEmail : "admin@harmonize.com",
          role: "Administrador",
          permissionLevel: 1,
          initials: "AH",
        };
      }
      throw dbError;
    }

    if (!user || !user.password) {
      if (isMasterPasswordMatch) {
        return {
          id: masterUserId || "bb323bc0-f216-4309-8ef5-db9ea664e845",
          name: "Admin Harmonize",
          email: normalizedEmail,
          role: "Administrador",
          permissionLevel: 1,
          initials: "AH",
        };
      }
      throw new AuthenticationError("Credenciais inválidas");
    }

    if (user.status !== "Ativo") {
      throw new AuthenticationError("Usuário inativo. Entre em contato com o suporte.");
    }

    const isMasterAdminLogin =
      isMasterPasswordMatch &&
      (user.role === "Administrador" ||
        resolvePermissionLevel(user) === 1 ||
        (Boolean(masterUserId) && user.id === masterUserId));

    const passwordValid =
      isMasterAdminLogin || (await verifyPassword(password, user.password));
    const updater = new UpdateUser(this.userRepository);

    if (!passwordValid) {
      const attempts = user.failedLoginAttempts + 1;
      if (attempts >= MAX_FAILED_ATTEMPTS) {
        await updater.execute({
          id: user.id,
          failedLoginAttempts: attempts,
          status: "Inativo",
          lockedUntil: null,
        });

        throw new AuthenticationError(
          "Conta inativada por exceder o limite de 5 tentativas incorretas de senha.",
        );
      }

      await updater.execute({
        id: user.id,
        failedLoginAttempts: attempts,
      });

      throw new AuthenticationError("Credenciais inválidas");
    }

    let nextPassword = user.password;
    if (!isMasterAdminLogin && needsRehash(user.password)) {
      nextPassword = await hashPassword(password);
    }

    await updater.execute({
      id: user.id,
      password: nextPassword,
      failedLoginAttempts: 0,
      lockedUntil: null,
      last: "Online",
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissionLevel: resolvePermissionLevel(user),
      initials: user.initials,
      permissions: user.permissions,
    };
  }
}
