/**
 * Cadastro mínimo do cliente do portal.
 *
 * Nome e e-mail chegam do provedor (Google) ou do formulário de cadastro, mas
 * telefone e data de nascimento não vêm de nenhum provedor — a clínica precisa
 * dos dois para atender. Enquanto faltar qualquer um, o portal fica travado.
 *
 * A regra vive no domínio porque vale para todos os caminhos: a tela, a Server
 * Action e o agendamento consultam a mesma função.
 */
export type ClientProfileField = "phone" | "birthDate";

export interface ClientProfileInput {
  name: string;
  phone: string;
  birthDate: string;
}

const MIN_PHONE_DIGITS = 10;
const MIN_BIRTH_YEAR = 1900;

export function isValidClientPhone(phone: string): boolean {
  return phone.replace(/\D/g, "").length >= MIN_PHONE_DIGITS;
}

/** Aceita apenas `YYYY-MM-DD` real, no passado e em um ano plausível. */
export function isValidClientBirthDate(
  birthDate: string,
  now: Date = new Date(),
): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate.trim());
  if (!match) return false;

  const [, rawYear, rawMonth, rawDay] = match;
  const year = Number(rawYear);
  const month = Number(rawMonth);
  const day = Number(rawDay);

  if (year < MIN_BIRTH_YEAR || month < 1 || month > 12 || day < 1) {
    return false;
  }

  // Rejeita 31/02 e afins: o Date normaliza, então comparamos de volta.
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return false;
  }

  const today = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
  );
  return parsed.getTime() <= today.getTime();
}

/** Campos que ainda faltam. Vazio = cadastro completo. */
export function missingClientProfileFields(
  client: Pick<ClientProfileInput, "phone" | "birthDate">,
  now: Date = new Date(),
): ClientProfileField[] {
  const missing: ClientProfileField[] = [];

  if (!isValidClientPhone(client.phone ?? "")) {
    missing.push("phone");
  }
  if (!isValidClientBirthDate(client.birthDate ?? "", now)) {
    missing.push("birthDate");
  }

  return missing;
}

export function isClientProfileComplete(
  client: Pick<ClientProfileInput, "phone" | "birthDate">,
  now: Date = new Date(),
): boolean {
  return missingClientProfileFields(client, now).length === 0;
}
