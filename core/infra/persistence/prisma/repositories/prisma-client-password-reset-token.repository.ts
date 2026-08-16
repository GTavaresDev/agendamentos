import { prisma } from "../client";
import { ClientPasswordResetTokenRepository } from "../../../../domain/clients/client-password-reset-token.repository";

export class PrismaClientPasswordResetTokenRepository
  implements ClientPasswordResetTokenRepository
{
  async create(input: {
    clientId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    await prisma.clientPasswordResetToken.create({ data: input });
  }

  async findValidByTokenHash(tokenHash: string): Promise<{ clientId: string } | null> {
    const row = await prisma.clientPasswordResetToken.findFirst({
      where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
      select: { clientId: true },
    });
    return row;
  }

  async markUsed(tokenHash: string): Promise<void> {
    await prisma.clientPasswordResetToken.updateMany({
      where: { tokenHash },
      data: { usedAt: new Date() },
    });
  }

  async invalidateAllForClient(clientId: string): Promise<void> {
    await prisma.clientPasswordResetToken.updateMany({
      where: { clientId, usedAt: null },
      data: { usedAt: new Date() },
    });
  }
}
