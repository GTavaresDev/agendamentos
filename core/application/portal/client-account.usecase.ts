import { Client } from "@core/domain/clients/client.entity";
import { ClientRepository } from "@core/domain/clients/client.repository";
import { hashPassword, verifyPassword } from "@core/infra/auth/password";

export const MIN_CLIENT_PASSWORD_LENGTH = 8;

export class ClientAccountError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClientAccountError";
  }
}

/** Dados do cliente autenticado. Nunca inclui senha, CPF, status interno ou notas. */
export interface ClientAccountDTO {
  id: string;
  name: string;
  email: string;
  initials: string;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function toDTO(client: Client): ClientAccountDTO {
  return {
    id: client.id,
    name: client.name,
    email: client.email,
    initials: client.initials,
  };
}

export interface RegisterClientAccountInput {
  name: string;
  email: string;
  phone: string;
  password: string;
}

/**
 * Cria a conta de acesso do cliente ao portal.
 *
 * Não duplica clientes: se a clínica já cadastrou a pessoa internamente
 * (registro sem senha), a conta é vinculada ao registro existente — desde que
 * o telefone informado confira, para que ninguém assuma o cadastro alheio só
 * conhecendo o e-mail.
 */
export class RegisterClientAccount {
  constructor(private clientRepository: ClientRepository) {}

  async execute(input: RegisterClientAccountInput): Promise<ClientAccountDTO> {
    const email = normalizeEmail(input.email);
    const name = input.name.trim();
    const phone = input.phone.trim();

    if (name.length < 3) {
      throw new ClientAccountError("Informe seu nome completo.");
    }
    if (!email.includes("@")) {
      throw new ClientAccountError("Informe um e-mail válido.");
    }
    if (onlyDigits(phone).length < 10) {
      throw new ClientAccountError("Informe um telefone válido com DDD.");
    }
    if (input.password.length < MIN_CLIENT_PASSWORD_LENGTH) {
      throw new ClientAccountError(
        `A senha deve ter pelo menos ${MIN_CLIENT_PASSWORD_LENGTH} caracteres.`,
      );
    }

    const passwordHash = await hashPassword(input.password);
    const existing = await this.clientRepository.findByEmail(email);

    if (existing) {
      if (existing.password) {
        throw new ClientAccountError(
          "Este e-mail já possui uma conta. Faça login ou recupere sua senha.",
        );
      }

      if (onlyDigits(existing.phone) !== onlyDigits(phone)) {
        throw new ClientAccountError(
          "Não foi possível concluir o cadastro. Confira seus dados ou entre em contato com a clínica.",
        );
      }

      existing.setPassword(passwordHash);
      await this.clientRepository.update(existing);
      return toDTO(existing);
    }

    const client = new Client({
      name,
      email,
      phone,
      password: passwordHash,
      status: "Ativo",
    });

    await this.clientRepository.save(client);
    return toDTO(client);
  }
}

/** Login do portal. Só autentica registros de Client — nunca usuários internos. */
export class AuthenticateClient {
  constructor(private clientRepository: ClientRepository) {}

  async execute(email: string, password: string): Promise<ClientAccountDTO> {
    const client = await this.clientRepository.findByEmail(normalizeEmail(email));

    if (!client || !client.password) {
      throw new ClientAccountError("E-mail ou senha inválidos.");
    }

    if (client.status !== "Ativo") {
      throw new ClientAccountError(
        "Sua conta está inativa. Entre em contato com a clínica.",
      );
    }

    const valid = await verifyPassword(password, client.password);
    if (!valid) {
      throw new ClientAccountError("E-mail ou senha inválidos.");
    }

    return toDTO(client);
  }
}
