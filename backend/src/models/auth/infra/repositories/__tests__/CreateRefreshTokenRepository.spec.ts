import { describe, it, expect, mock } from 'bun:test';
import { CreateRefreshTokenRepository } from '../CreateRefreshTokenRepository';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { Prisma } from 'prisma/client';
import { AppProviders } from '@/common/interfaces/IAppContainer';

describe('CreateRefreshTokenRepository', () => {
  const setup = () => {
    const mockCreate = mock(async () => ({}));

    const mockPrisma = {
      refreshToken: {
        create: mockCreate,
      },
    } as unknown as PrismaHandler;

    return { mockPrisma, mockCreate };
  };

  describe('create', () => {
    it('should persist refresh token in database', async () => {
      const { mockPrisma, mockCreate } = setup();
      const repository = new CreateRefreshTokenRepository({ [AppProviders.prisma]: mockPrisma });

      const token = 'refresh-token-123';
      const userId = 'user-123';
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      await repository.create({ token, userId, expiresAt });

      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          token,
          userId,
          expiresAt,
        },
      });
    });

    it('should set correct expiration date', async () => {
      const { mockPrisma, mockCreate } = setup();
      const repository = new CreateRefreshTokenRepository({ [AppProviders.prisma]: mockPrisma });

      const expiresAt = new Date('2024-12-31T23:59:59Z');

      await repository.create({
        token: 'token-123',
        userId: 'user-123',
        expiresAt,
      });

      const callArgs = mockCreate.mock.calls[0]?.[0];
      expect(callArgs?.data?.expiresAt).toEqual(expiresAt);
    });

    it('should use transaction client when provided', async () => {
      const mockCreate = mock(async () => ({}));
      const mockTxClient = {
        refreshToken: {
          create: mockCreate,
        },
      } as unknown as Prisma.TransactionClient;

      const { mockPrisma } = setup();
      const repository = new CreateRefreshTokenRepository({ [AppProviders.prisma]: mockPrisma });

      await repository.create({
        token: 'token-123',
        userId: 'user-123',
        expiresAt: new Date(),
        tx: mockTxClient,
      });

      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockPrisma.refreshToken.create).not.toHaveBeenCalled();
    });
  });
});

