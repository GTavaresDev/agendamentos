import { decode } from "@auth/core/jwt";
import { beforeAll, describe, expect, it } from "vitest";
import {
  clientSessionCookieName,
  decodeClientSessionToken,
  encodeClientSessionToken,
} from "./client-session-token";
import { sessionCookieName } from "./create-auth-session";

/**
 * Isolamento das duas sessões.
 *
 * O portal e o sistema interno compartilham o AUTH_SECRET, mas usam salts
 * diferentes (o nome do cookie). Sessão de cliente não vale como sessão de
 * equipe — nem depois de um login pelo Google, que emite exatamente este mesmo
 * token de portal.
 */
beforeAll(() => {
  process.env.AUTH_SECRET ||= "segredo-de-teste-nao-usado-em-producao";
});

const session = {
  clientId: "abc123",
  name: "Maria Silva",
  email: "maria@gmail.com",
  initials: "MS",
};

describe("token de sessão do portal", () => {
  it("vai e volta preservando o cliente", async () => {
    const token = await encodeClientSessionToken(session);
    expect(await decodeClientSessionToken(token)).toEqual(session);
  });

  it("usa cookie diferente do cookie da equipe", () => {
    expect(clientSessionCookieName()).not.toBe(sessionCookieName());
  });

  it("não é aceito como sessão da equipe", async () => {
    const token = await encodeClientSessionToken(session);

    await expect(
      decode({
        token,
        secret: process.env.AUTH_SECRET!,
        salt: sessionCookieName(),
      }),
    ).rejects.toThrow();
  });

  it("token da equipe não é aceito como sessão de cliente", async () => {
    const { encode } = await import("@auth/core/jwt");
    const staffToken = await encode({
      token: { id: "u1", role: "Administrador", permissionLevel: 1 },
      secret: process.env.AUTH_SECRET!,
      salt: sessionCookieName(),
    });

    expect(await decodeClientSessionToken(staffToken)).toBeNull();
  });

  it("token adulterado é rejeitado", async () => {
    const token = await encodeClientSessionToken(session);
    expect(await decodeClientSessionToken(`${token}x`)).toBeNull();
  });
});
