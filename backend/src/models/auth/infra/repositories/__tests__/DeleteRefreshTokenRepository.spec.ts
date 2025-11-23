import { describe, it, expect, mock } from 'bun:test';
import { DeleteRefreshTokenRepository } from '../DeleteRefreshTokenRepository';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { Prisma } from 'prisma/client';
import { AppProviders } from '@/common/interfaces/IAppContainer';

describe('DeleteRefreshTokenRepository', () => {
  const setup = () => {
    const mockUpdateMany = mock(async () => ({ count: 1 }));

    const mockPrisma = {
      refreshToken: {
        updateMany: mockUpdateMany,
      },
    } as unknown as PrismaHandler;

    return { mockPrisma, mockUpdateMany };
  };

  describe('revoke', () => {
    it('should revoke refresh token by setting revokedAt', async () => {
      const { mockPrisma, mockUpdateMany } = setup();
      const repository = new DeleteRefreshTokenRepository({ [AppProviders.prisma]: mockPrisma });

      const token = 'refresh-token-123';

      await repository.revoke({ token });

      expect(mockUpdateMany).toHaveBeenCalledTimes(1);
      expect(mockUpdateMany).toHaveBeenCalledWith({
        where: {
          token,
          revokedAt: null,
        },
        data: {
          revokedAt: expect.any(Date),
        },
      });
    });

    it('should set revokedAt to current timestamp', async () => {
      const { mockPrisma, mockUpdateMany } = setup();
      const repository = new DeleteRefreshTokenRepository({ [AppProviders.prisma]: mockPrisma });

      await repository.revoke({ token: 'token-123' });

      expect(mockUpdateMany).toHaveBeenCalledWith({
        where: {
          token: 'token-123',
          revokedAt: null,
        },
        data: {
          revokedAt: expect.any(Date),
        },
      });
    });

    it('should only revoke tokens that are not already revoked', async () => {
      const { mockPrisma, mockUpdateMany } = setup();
      const repository = new DeleteRefreshTokenRepository({ [AppProviders.prisma]: mockPrisma });

      await repository.revoke({ token: 'token-123' });

      expect(mockUpdateMany).toHaveBeenCalledWith({
        where: {
          token: 'token-123',
          revokedAt: null,
        },
        data: {
          revokedAt: expect.any(Date),
        },
      });
    });

    it('should use transaction client when provided', async () => {
      const mockUpdateMany = mock(async () => ({ count: 1 }));
      const mockTxClient = {
        refreshToken: {
          updateMany: mockUpdateMany,
        },
      } as unknown as Prisma.TransactionClient;

      const { mockPrisma } = setup();
      const repository = new DeleteRefreshTokenRepository({ [AppProviders.prisma]: mockPrisma });

      await repository.revoke({ token: 'token-123', tx: mockTxClient });

      expect(mockUpdateMany).toHaveBeenCalledTimes(1);
      expect(mockPrisma.refreshToken.updateMany).not.toHaveBeenCalled();
    });

    it('should not throw error when token does not exist', async () => {
      const { mockPrisma, mockUpdateMany } = setup();
      mockUpdateMany.mockResolvedValue({ count: 0 });

      const repository = new DeleteRefreshTokenRepository({ [AppProviders.prisma]: mockPrisma });

      await expect(async () => {
        await repository.revoke({ token: 'non-existent' });
      }).not.toThrow();
    });
  });
});

