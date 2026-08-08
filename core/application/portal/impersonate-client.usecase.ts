import type { ClientRepository } from "@core/domain/clients/client.repository";
import type { StaffRole } from "@core/domain/users/user.entity";
import { toClientAccountDTO, type ClientAccountDTO } from "./client-account.usecase";

/**
 * "Ver como cliente": um administrador passa a ver o portal com a identidade
 * efetiva de um cliente, sem senha, sem Google e sem tocar na conta dele.
 *
 * Aqui mora só a DECISÃO (quem pode, sobre quem). A sessão em si é escrita
 * pelo cookie do portal (src/lib/client-session.ts) — o cookie da equipe fica
 * intacto, e é ele que devolve o administrador ao sistema interno na saída.
 */
export class ImpersonationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImpersonationError";
  }
}

/** Quem está pedindo. `impersonating` é o estado da sessão interna. */
export interface ImpersonationActor {
  id: string;
  name: string;
  role: StaffRole;
  impersonating?: boolean;
}

export class ImpersonateClient {
  constructor(private clientRepository: ClientRepository) {}

  async execute(
    actor: ImpersonationActor | null,
    clientId: string,
  ): Promise<ClientAccountDTO> {
    if (!actor) {
      throw new ImpersonationError("Faça login para continuar.");
    }

    if (actor.role !== "Administrador") {
      throw new ImpersonationError(
        "Apenas administradores podem visualizar o portal como cliente.",
      );
    }

    // Sem encadeamento: quem já está personificando alguém sai antes de entrar
    // em outra identidade.
    if (actor.impersonating) {
      throw new ImpersonationError(
        "Saia da visualização atual antes de iniciar outra.",
      );
    }

    // O id vem do navegador, então só vale depois de existir de fato.
    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw new ImpersonationError("Cliente não encontrado.");
    }

    // Mesma regra do login do portal: conta inativa não entra. A visualização
    // não é atalho para furar o status.
    if (client.status !== "Ativo") {
      throw new ImpersonationError(
        "Cliente inativo não tem acesso ao portal. Reative o cadastro para visualizá-lo.",
      );
    }

    // DTO público: sem senha, sem CPF, sem nada que a tela do cliente não use.
    return toClientAccountDTO(client);
  }
}
