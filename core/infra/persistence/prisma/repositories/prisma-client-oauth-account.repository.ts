import { prisma } from "../client";
import { ClientOAuthAccountRepository } from "../../../../domain/clients/client-oauth-account.repository";

export class PrismaClientOAuthAccountRepository
  implements ClientOAuthAccountRepository
{
  async findClientIdByProviderAccount(
    provider: string,
    providerAccountId: string,
  ): Promise<string | null> {
    const row = await prisma.clientOAuthAccount.findUnique({
      where: { provider_providerAccountId: { provider, providerAccountId } },
      select: { clientId: true },
    });
    return row?.clientId ?? null;
  }

  async hasLink(clientId: string, provider: string): Promise<boolean> {
    const row = await prisma.clientOAuthAccount.findFirst({
      where: { clientId, provider },
      select: { id: true },
    });
    return row !== null;
  }

  async link(input: {
    clientId: string;
    provider: string;
    providerAccountId: string;
  }): Promise<void> {
    // upsert: login repetido não duplica vínculo (a unique é (provider, id)).
    await prisma.clientOAuthAccount.upsert({
      where: {
        provider_providerAccountId: {
          provider: input.provider,
          providerAccountId: input.providerAccountId,
        },
      },
      create: input,
      update: { clientId: input.clientId },
    });
  }
}
