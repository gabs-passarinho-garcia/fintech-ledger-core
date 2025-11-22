import { describe, it, expect, mock } from 'bun:test';
import { GetRefreshTokenRepository } from '../GetRefreshTokenRepository';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { Prisma } from 'prisma/client';
import { AppProviders } from '@/common/interfaces/IAppContainer';

describe('GetRefreshTokenRepository', () => {
  const createMockPrisma = (token: any = null) => {
    const mockFindFirst = mock(async () => token);

    return {
      refreshToken: {
        findFirst: mockFindFirst,
      },
    } as unknown as PrismaHandler;
  };

  describe('findByToken', () => {
    it('should return refresh token when found', async () => {
      const mockToken = {
        id: 'token-123',
        token: 'refresh-token-string',
        userId: 'user-123',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        revokedAt: null,
      };

      const mockPrisma = createMockPrisma(mockToken);
      const repository = new GetRefreshTokenRepository({ [AppProviders.prisma]: mockPrisma });

      const result = await repository.findByToken({
        token: 'refresh-token-string',
        userId: 'user-123',
      });

      expect(result).toBeDefined();
      expect(result?.token).toBe('refresh-token-string');
      expect(result?.userId).toBe('user-123');
      expect(mockPrisma.refreshToken.findFirst).toHaveBeenCalled();
    });

    it('should return null when token not found', async () => {
      const mockPrisma = createMockPrisma(null);
      const repository = new GetRefreshTokenRepository({ [AppProviders.prisma]: mockPrisma });

      const result = await repository.findByToken({
        token: 'non-existent',
        userId: 'user-123',
      });

      expect(result).toBeNull();
    });

    it('should filter by token and userId', async () => {
      const mockPrisma = createMockPrisma(null);
      const repository = new GetRefreshTokenRepository({ [AppProviders.prisma]: mockPrisma });

      await repository.findByToken({
        token: 'refresh-token-string',
        userId: 'user-123',
      });

      expect(mockPrisma.refreshToken.findFirst).toHaveBeenCalledWith({
        where: {
          token: 'refresh-token-string',
          userId: 'user-123',
        },
        select: {
          id: true,
          token: true,
          userId: true,
          expiresAt: true,
          createdAt: true,
          revokedAt: true,
        },
      });
    });

    it('should use transaction client when provided', async () => {
      const mockToken = {
        id: 'token-123',
        token: 'refresh-token-string',
        userId: 'user-123',
        expiresAt: new Date(),
        createdAt: new Date(),
        revokedAt: null,
      };

      const mockFindFirst = mock(async () => mockToken);
      const mockTxClient = {
        refreshToken: {
          findFirst: mockFindFirst,
        },
      } as unknown as Prisma.TransactionClient;

      const mockPrisma = createMockPrisma(null);
      const repository = new GetRefreshTokenRepository({ [AppProviders.prisma]: mockPrisma });

      const result = await repository.findByToken({
        token: 'refresh-token-string',
        userId: 'user-123',
        tx: mockTxClient,
      });

      expect(result).toBeDefined();
      expect(mockFindFirst).toHaveBeenCalledTimes(1);
      expect(mockPrisma.refreshToken.findFirst).not.toHaveBeenCalled();
    });
  });
});

