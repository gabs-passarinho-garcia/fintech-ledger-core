import { describe, it, expect, mock } from 'bun:test';
import { ListProfilesByUserIdRepository } from '../ListProfilesByUserIdRepository';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';

describe('ListProfilesByUserIdRepository', () => {
  const createMockPrisma = (profiles: any[] = []) => {
    const mockFindMany = mock(async () => profiles);

    return {
      profile: {
        findMany: mockFindMany,
      },
    } as unknown as PrismaHandler;
  };

  describe('listByUserId', () => {
    it('should return list of profiles for user', async () => {
      const mockProfiles = [
        {
          id: 'profile-1',
          userId: 'user-123',
          tenantId: 'tenant-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@tenant1.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          id: 'profile-2',
          userId: 'user-123',
          tenantId: 'tenant-2',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@tenant2.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];

      const mockPrisma = createMockPrisma(mockProfiles);
      const repository = new ListProfilesByUserIdRepository({ [AppProviders.prisma]: mockPrisma });

      const result = await repository.listByUserId({ userId: 'user-123' });

      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0]?.userId).toBe('user-123');
      expect(mockPrisma.profile.findMany).toHaveBeenCalled();
    });

    it('should return empty array when no profiles found', async () => {
      const mockPrisma = createMockPrisma([]);
      const repository = new ListProfilesByUserIdRepository({ [AppProviders.prisma]: mockPrisma });

      const result = await repository.listByUserId({ userId: 'user-123' });

      expect(result).toEqual([]);
    });

    it('should filter by userId', async () => {
      const mockPrisma = createMockPrisma([]);
      const repository = new ListProfilesByUserIdRepository({ [AppProviders.prisma]: mockPrisma });

      await repository.listByUserId({ userId: 'user-123' });

      expect(mockPrisma.profile.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          deletedAt: null,
        },
        select: {
          id: true,
          userId: true,
          tenantId: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });
});

