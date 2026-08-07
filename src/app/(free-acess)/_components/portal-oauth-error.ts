import type { PortalOAuthErrorCode } from "@core/application/portal/google-account-link.usecase";

const MESSAGES: Record<PortalOAuthErrorCode, string> = {
  email_nao_verificado:
    "O Google não confirmou este e-mail. Entre com e-mail e senha ou verifique seu e-mail no Google.",
  conta_desativada:
    "Esta conta está desativada. Entre em contato com a clínica.",
  conta_indisponivel:
    "Não foi possível entrar com o Google usando este e-mail. Entre em contato com a clínica.",
  falha: "Não foi possível entrar com o Google. Tente novamente.",
};

/**
 * Traduz o código vindo da URL. Só códigos conhecidos viram texto — assim a
 * query string não consegue injetar mensagem arbitrária na tela de login.
 */
export function portalOAuthErrorMessage(code: unknown): string | null {
  if (typeof code !== "string") return null;
  return MESSAGES[code as PortalOAuthErrorCode] ?? MESSAGES.falha;
}
