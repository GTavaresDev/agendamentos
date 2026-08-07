import { describe, expect, it } from "vitest";
import { CreateClient } from "./create-client.usecase";
import { buildClient, mockClientRepository } from "./test-helpers";

describe("CreateClient", () => {
  it("rejects a duplicate email", async () => {
    const repo = mockClientRepository();
    repo.findByEmail.mockResolvedValue(buildClient());
    const useCase = new CreateClient(repo);

    await expect(
      useCase.execute({ name: "Novo", email: "maria@example.com", phone: "111" }),
    ).rejects.toThrow(/já existe/i);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it("creates and saves a new client", async () => {
    const repo = mockClientRepository();
    repo.findByEmail.mockResolvedValue(null);
    const useCase = new CreateClient(repo);

    const result = await useCase.execute({
      name: "João Souza",
      email: "joao@example.com",
      phone: "222",
    });

    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(result.name).toBe("João Souza");
    expect(result.initials).toBe("JS");
  });
});
