import { describe, it, expect, mock } from 'bun:test';
import { ListAllUsersRepository } from '../ListAllUsersRepository';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';

describe('ListAllUsersRepository', () => {
  const setup = () => {
    const mockFindMany = mock(async () => [
      {
        id: 'user-1',
        username: 'user1',
        isMaster: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        profiles: [],
      },
      {
        id: 'user-2',
        username: 'user2',
        isMaster: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        profiles: [
          {
            id: 'profile-1',
            userId: 'user-2',
            tenantId: 'tenant-1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          },
        ],
      },
    ]);

    const mockPrisma = {
      user: {
        findMany: mockFindMany,
      },
    } as unknown as PrismaHandler;

    return { mockPrisma, mockFindMany };
  };

  describe('listAll', () => {
    it('should list all users excluding deleted by default', async () => {
      const { mockPrisma, mockFindMany } = setup();
      const repository = new ListAllUsersRepository({ [AppProviders.prisma]: mockPrisma });

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

    it('should include deleted users when includeDeleted is true', async () => {
      const { mockPrisma, mockFindMany } = setup();
      const repository = new ListAllUsersRepository({ [AppProviders.prisma]: mockPrisma });

      await repository.listAll({ includeDeleted: true });

      expect(mockFindMany).toHaveBeenCalledTimes(1);
      const callArgs = mockFindMany.mock.calls[0]?.[0];
      expect(callArgs?.where?.deletedAt).toBeUndefined();
    });

    it('should support pagination', async () => {
      const { mockPrisma, mockFindMany } = setup();
      const repository = new ListAllUsersRepository({ [AppProviders.prisma]: mockPrisma });

      await repository.listAll({ skip: 10, take: 20 });

      expect(mockFindMany).toHaveBeenCalledTimes(1);
      const callArgs = mockFindMany.mock.calls[0]?.[0];
      expect(callArgs?.skip).toBe(10);
      expect(callArgs?.take).toBe(20);
    });

    it('should return users with profiles', async () => {
      const { mockPrisma } = setup();
      const repository = new ListAllUsersRepository({ [AppProviders.prisma]: mockPrisma });

      const result = await repository.listAll();

      expect(result[1]?.profiles).toHaveLength(1);
      expect(result[1]?.profiles[0]?.email).toBe('john@example.com');
    });

    it('should order by createdAt descending', async () => {
      const { mockPrisma, mockFindMany } = setup();
      const repository = new ListAllUsersRepository({ [AppProviders.prisma]: mockPrisma });

      await repository.listAll();

      const callArgs = mockFindMany.mock.calls[0]?.[0];
      expect(callArgs?.orderBy).toEqual({
        createdAt: 'desc',
      });
    });
  });
});

