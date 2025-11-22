import { describe, it, expect, mock } from 'bun:test';
import { ListAllProfilesRepository } from '../ListAllProfilesRepository';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';

describe('ListAllProfilesRepository', () => {
  const setup = () => {
    const mockFindMany = mock(async () => [
      {
        id: 'profile-1',
        userId: 'user-1',
        tenantId: 'tenant-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        user: {
          id: 'user-1',
          username: 'user1',
          isMaster: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      },
      {
        id: 'profile-2',
        userId: 'user-2',
        tenantId: 'tenant-2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        user: {
          id: 'user-2',
          username: 'user2',
          isMaster: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      },
    ]);

    const mockPrisma = {
      profile: {
        findMany: mockFindMany,
      },
    } as unknown as PrismaHandler;

    return { mockPrisma, mockFindMany };
  };

  describe('listAll', () => {
    it('should list all profiles excluding deleted by default', async () => {
      const { mockPrisma, mockFindMany } = setup();
      const repository = new ListAllProfilesRepository({ [AppProviders.prisma]: mockPrisma });

      const result = await repository.listAll();

      expect(mockFindMany).toHaveBeenCalledTimes(1);
      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
        },
        skip: undefined,
        take: undefined,
        orderBy: {
          createdAt: 'desc',
        },
        select: expect.any(Object),
      });
      expect(result).toHaveLength(2);
    });

    it('should include deleted profiles when includeDeleted is true', async () => {
      const { mockPrisma, mockFindMany } = setup();
      const repository = new ListAllProfilesRepository({ [AppProviders.prisma]: mockPrisma });

      await repository.listAll({ includeDeleted: true });

      expect(mockFindMany).toHaveBeenCalledTimes(1);
      const callArgs = mockFindMany.mock.calls[0]?.[0];
      expect(callArgs?.where?.deletedAt).toBeUndefined();
    });

    it('should support pagination', async () => {
      const { mockPrisma, mockFindMany } = setup();
      const repository = new ListAllProfilesRepository({ [AppProviders.prisma]: mockPrisma });

      await repository.listAll({ skip: 10, take: 20 });

      expect(mockFindMany).toHaveBeenCalledTimes(1);
      const callArgs = mockFindMany.mock.calls[0]?.[0];
      expect(callArgs?.skip).toBe(10);
      expect(callArgs?.take).toBe(20);
    });

    it('should return profiles with user information', async () => {
      const { mockPrisma } = setup();
      const repository = new ListAllProfilesRepository({ [AppProviders.prisma]: mockPrisma });

      const result = await repository.listAll();

      expect(result[0]?.user).toBeDefined();
      expect(result[0]?.user.username).toBe('user1');
      expect(result[1]?.user.isMaster).toBe(true);
    });

    it('should order by createdAt descending', async () => {
      const { mockPrisma, mockFindMany } = setup();
      const repository = new ListAllProfilesRepository({ [AppProviders.prisma]: mockPrisma });

      await repository.listAll();

      const callArgs = mockFindMany.mock.calls[0]?.[0];
      expect(callArgs?.orderBy).toEqual({
        createdAt: 'desc',
      });
    });
  });
});

