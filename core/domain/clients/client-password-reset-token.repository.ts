export interface ClientPasswordResetTokenRepository {
  create(input: { clientId: string; tokenHash: string; expiresAt: Date }): Promise<void>;
  findValidByTokenHash(tokenHash: string): Promise<{ clientId: string } | null>;
  markUsed(tokenHash: string): Promise<void>;
  invalidateAllForClient(clientId: string): Promise<void>;
}
