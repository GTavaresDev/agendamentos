import { Prisma } from "@prisma/client";

/**
 * Normaliza e sanitiza mensagens de erro em Server Actions.
 * Garante que detalhes técnicos de banco de dados, erros do Prisma,
 * nomes de colunas ou exceções de infraestrutura NUNCA vazem para o cliente.
 */
export function formatActionError(
  error: unknown,
  fallbackMessage = "Ocorreu um erro interno ao processar a solicitação. Tente novamente mais tarde."
): string {
  // 1. Sempre registra o log técnico detalhado no servidor para análise
  console.error("[Server Action Error Log]:", error);

  // 2. Se for uma exceção conhecida do Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return "Já existe um registro cadastrado com as informações fornecidas.";
      case "P2025":
        return "O registro solicitado não foi encontrado.";
      case "P2003":
        return "Não foi possível concluir a operação pois este registro possui vínculos com outros dados.";
      case "P2014":
        return "A alteração solicitada viola o relacionamento entre os dados.";
      case "P2000":
        return "Um dos campos informados excede o tamanho máximo permitido.";
      default:
        return fallbackMessage;
    }
  }

  // Outras exceções de infraestrutura do Prisma (validação de campo, coluna inexistente, conexão, etc)
  if (
    error instanceof Prisma.PrismaClientUnknownRequestError ||
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientValidationError ||
    error instanceof Prisma.PrismaClientRustPanicError
  ) {
    return fallbackMessage;
  }

  // 3. Se for uma instância de Error do JavaScript
  if (error instanceof Error) {
    const msg = error.message || "";
    // Filtro de termos técnicos de banco de dados / Prisma / SQL
    const isTechnical =
      msg.includes("Prisma") ||
      msg.includes("prisma") ||
      msg.includes("invocation") ||
      msg.includes("does not exist") ||
      msg.includes("column") ||
      msg.includes("relation") ||
      msg.includes("foreign key") ||
      msg.includes("constraint") ||
      msg.includes("syntax error") ||
      msg.includes("SQLSTATE");

    if (isTechnical) {
      return fallbackMessage;
    }

    // Se for mensagem amigável de validação de regra de negócio (ex: "Senha atual incorreta", "Sem permissão", etc)
    return msg;
  }

  return fallbackMessage;
}
