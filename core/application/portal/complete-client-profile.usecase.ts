import {
  isValidClientBirthDate,
  isValidClientPhone,
  missingClientProfileFields,
  type ClientProfileField,
} from "@core/domain/clients/client-profile.business-rule";
import { ClientRepository } from "@core/domain/clients/client.repository";
import { ClientAccountError } from "./client-account.usecase";

/** O que a tela precisa saber para montar (ou não) o bloqueio. */
export interface ClientProfileStatusDTO {
  complete: boolean;
  missing: ClientProfileField[];
  name: string;
  /** Só leitura: é a identidade da conta e a chave do vínculo com o Google. */
  email: string;
  phone: string;
  birthDate: string;
}

export interface CompleteClientProfileInput {
  /** Sempre da sessão — o navegador não escolhe de quem é o cadastro. */
  clientId: string;
  name: string;
  phone: string;
  birthDate: string;
}

export class GetClientProfileStatus {
  constructor(private clientRepository: ClientRepository) {}

  async execute(
    clientId: string,
    now: Date = new Date(),
  ): Promise<ClientProfileStatusDTO> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw new ClientAccountError("Não foi possível carregar seu cadastro.");
    }

    const missing = missingClientProfileFields(
      { phone: client.phone, birthDate: client.birthDate },
      now,
    );

    return {
      complete: missing.length === 0,
      missing,
      name: client.name,
      email: client.email,
      phone: client.phone,
      birthDate: client.birthDate,
    };
  }
}

/**
 * Completa o cadastro do cliente do portal.
 *
 * Só mexe em nome, telefone e nascimento. E-mail, status, senha e id ficam
 * intactos: completar cadastro não é caminho para trocar de identidade nem
 * para reativar conta desativada.
 */
export class CompleteClientProfile {
  constructor(private clientRepository: ClientRepository) {}

  async execute(
    input: CompleteClientProfileInput,
    now: Date = new Date(),
  ): Promise<ClientProfileStatusDTO> {
    const client = await this.clientRepository.findById(input.clientId);
    if (!client) {
      throw new ClientAccountError("Não foi possível carregar seu cadastro.");
    }

    if (client.status !== "Ativo") {
      throw new ClientAccountError(
        "Esta conta está desativada. Entre em contato com a clínica.",
      );
    }

    const name = input.name.trim();
    const phone = input.phone.trim();
    const birthDate = input.birthDate.trim();

    if (name.length < 3) {
      throw new ClientAccountError("Informe seu nome completo.");
    }
    if (!isValidClientPhone(phone)) {
      throw new ClientAccountError("Informe um telefone válido com DDD.");
    }
    if (!isValidClientBirthDate(birthDate, now)) {
      throw new ClientAccountError("Informe uma data de nascimento válida.");
    }

    client.updateDetails({ name, phone, birthDate });
    await this.clientRepository.update(client);

    return {
      complete: true,
      missing: [],
      name: client.name,
      email: client.email,
      phone: client.phone,
      birthDate: client.birthDate,
    };
  }
}
