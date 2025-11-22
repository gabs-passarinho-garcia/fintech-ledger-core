import { describe, it, expect, mock } from 'bun:test';
import { GetUserByUsernameRepository } from '../GetUserByUsernameRepository';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { Prisma } from 'prisma/client';
import { AppProviders } from '@/common/interfaces/IAppContainer';

describe('GetUserByUsernameRepository', () => {
  const createMockPrisma = (user: any = null) => {
    const mockFindFirst = mock(async () => user);

    return {
      user: {
        findFirst: mockFindFirst,
      },
    } as unknown as PrismaHandler;
  };

  describe('findByUsername', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$salt$hash',
        isMaster: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const mockPrisma = createMockPrisma(mockUser);
      const repository = new GetUserByUsernameRepository({ [AppProviders.prisma]: mockPrisma });

      const result = await repository.findByUsername({ username: 'testuser' });

      expect(result).toBeDefined();
      expect(result?.id).toBe('user-123');
      expect(result?.username).toBe('testuser');
      expect(mockPrisma.user.findFirst).toHaveBeenCalled();
    });

    it('should return null when user not found', async () => {
      const mockPrisma = createMockPrisma(null);
      const repository = new GetUserByUsernameRepository({ [AppProviders.prisma]: mockPrisma });

      const result = await repository.findByUsername({ username: 'non-existent' });

      expect(result).toBeNull();
    });

    it('should filter out deleted users', async () => {
      const mockPrisma = createMockPrisma(null);
      const repository = new GetUserByUsernameRepository({ [AppProviders.prisma]: mockPrisma });

      await repository.findByUsername({ username: 'testuser' });

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          username: 'testuser',
          deletedAt: null,
        },
        select: {
          id: true,
          username: true,
          passwordHash: true,
          isMaster: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      });
    });

    it('should use transaction client when provided', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$salt$hash',
        isMaster: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const mockFindFirst = mock(async () => mockUser);
      const mockTxClient = {
        user: {
          findFirst: mockFindFirst,
        },
      } as unknown as Prisma.TransactionClient;

      const mockPrisma = createMockPrisma(null);
      const repository = new GetUserByUsernameRepository({ [AppProviders.prisma]: mockPrisma });

      const result = await repository.findByUsername({ username: 'testuser', tx: mockTxClient });

      expect(result).toBeDefined();
      expect(mockFindFirst).toHaveBeenCalledTimes(1);
      expect(mockPrisma.user.findFirst).not.toHaveBeenCalled();
    });
  });
});

