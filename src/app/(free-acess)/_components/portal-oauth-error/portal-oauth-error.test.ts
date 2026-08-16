import { describe, expect, it } from "vitest";
import { portalOAuthErrorMessage } from "./portal-oauth-error";

describe("portal-oauth-error", () => {
  it("returns appropriate message for known error codes", () => {
    expect(portalOAuthErrorMessage("email_nao_verificado")).toContain(
      "O Google não confirmou este e-mail",
    );
    expect(portalOAuthErrorMessage("conta_desativada")).toContain(
      "Esta conta está desativada",
    );
    expect(portalOAuthErrorMessage("conta_indisponivel")).toContain(
      "Não foi possível entrar com o Google usando este e-mail",
    );
    expect(portalOAuthErrorMessage("falha")).toContain(
      "Não foi possível entrar com o Google. Tente novamente.",
    );
  });

  it("falls back to generic failure for unknown string codes", () => {
    expect(portalOAuthErrorMessage("unknown_code")).toBe(
      "Não foi possível entrar com o Google. Tente novamente.",
    );
  });

  it("returns null for non-string codes", () => {
    expect(portalOAuthErrorMessage(null)).toBeNull();
    expect(portalOAuthErrorMessage(undefined)).toBeNull();
    expect(portalOAuthErrorMessage(123)).toBeNull();
  });
});
