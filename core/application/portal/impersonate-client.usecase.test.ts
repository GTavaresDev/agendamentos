import { describe, expect, it } from "vitest";
import {
  buildClient,
  mockClientRepository,
} from "@core/application/clients/test-helpers";
import {
  ImpersonateClient,
  ImpersonationError,
  type ImpersonationActor,
} from "./impersonate-client.usecase";

/**
 * "Ver como cliente".
 *
 * A decisão de quem pode visualizar quem mora aqui — a tela só chama. Todo
 * caminho de recusa é servidor: mandar um id direto pelo navegador não é
 * atalho para nada.
 */
const admin: ImpersonationActor = {
  id: "admin-1",
  name: "Gabriel Tavares",
  role: "Administrador",
};

function useCaseWith(client: ReturnType<typeof buildClient> | null) {
  const repository = mockClientRepository();
  repository.findById.mockResolvedValue(client);
  return { useCase: new ImpersonateClient(repository), repository };
}

describe("ImpersonateClient", () => {
  it("administrador assume a identidade de um cliente ativo", async () => {
    const { useCase } = useCaseWith(buildClient({ id: "c1", name: "Maria Silva" }));

    await expect(useCase.execute(admin, "c1")).resolves.toEqual({
      id: "c1",
      name: "Maria Silva",
      email: "maria@example.com",
      initials: "MS",
    });
  });

  it("devolve só dados públicos do cliente", async () => {
    const { useCase } = useCaseWith(
      buildClient({ password: "hash-secreto", cpf: "12345678900" }),
    );

    const account = await useCase.execute(admin, "c1");

    expect(account).not.toHaveProperty("password");
    expect(account).not.toHaveProperty("cpf");
    expect(account).not.toHaveProperty("status");
  });

  it("não escreve nada: nem cria, nem altera o cliente", async () => {
    const { useCase, repository } = useCaseWith(buildClient());

    await useCase.execute(admin, "c1");

    expect(repository.save).not.toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it.each(["Gestor", "Funcionario"] as const)(
    "recusa %s: não é administrador",
    async (role) => {
      const { useCase, repository } = useCaseWith(buildClient());

      await expect(
        useCase.execute({ ...admin, role }, "c1"),
      ).rejects.toThrow(ImpersonationError);
      // Nem chega a consultar o cliente.
      expect(repository.findById).not.toHaveBeenCalled();
    },
  );

  it("recusa sem sessão", async () => {
    const { useCase } = useCaseWith(buildClient());

    await expect(useCase.execute(null, "c1")).rejects.toThrow(ImpersonationError);
  });

  it("recusa encadeamento: quem já está personificando não inicia outra", async () => {
    const { useCase, repository } = useCaseWith(buildClient());

    await expect(
      useCase.execute({ ...admin, impersonating: true }, "c1"),
    ).rejects.toThrow("Saia da visualização atual antes de iniciar outra.");
    expect(repository.findById).not.toHaveBeenCalled();
  });

  it("recusa id que não é de um cliente", async () => {
    const { useCase } = useCaseWith(null);

    await expect(useCase.execute(admin, "id-inventado")).rejects.toThrow(
      "Cliente não encontrado.",
    );
  });

  it("recusa cliente inativo, como o login do portal faria", async () => {
    const { useCase } = useCaseWith(buildClient({ status: "Inativo" }));

    await expect(useCase.execute(admin, "c1")).rejects.toThrow(
      /inativo não tem acesso ao portal/i,
    );
  });
});
