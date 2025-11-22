import { describe, it, expect, mock } from 'bun:test';
import { ListAllTenantsRepository } from '../ListAllTenantsRepository';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';

describe('ListAllTenantsRepository', () => {
  const setup = () => {
    const mockFindMany = mock(async () => [
      {
        id: 'tenant-1',
        name: 'Tenant 1',
        createdBy: 'user-123',
        createdAt: new Date('2024-01-01'),
        updatedBy: null,
        updatedAt: new Date('2024-01-01'),
        deletedBy: null,
        deletedAt: null,
      },
      {
        id: 'tenant-2',
        name: 'Tenant 2',
        createdBy: 'user-456',
        createdAt: new Date('2024-01-02'),
        updatedBy: null,
        updatedAt: new Date('2024-01-02'),
        deletedBy: 'user-789',
        deletedAt: new Date('2024-01-03'),
      },
    ]);

    const mockPrisma = {
      tenant: {
        findMany: mockFindMany,
      },
    } as unknown as PrismaHandler;

    return { mockPrisma, mockFindMany };
  };

  describe('listAll', () => {
    it('should list all tenants excluding deleted by default', async () => {
      const { mockPrisma, mockFindMany } = setup();
      const repository = new ListAllTenantsRepository({
        [AppProviders.prisma]: mockPrisma,
      });

      await repository.listAll();

      expect(mockFindMany).toHaveBeenCalledTimes(1);
      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
        },
        skip: undefined,
        take: undefined,
        select: expect.any(Object),
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should include deleted tenants when includeDeleted is true', async () => {
      const { mockPrisma, mockFindMany } = setup();
      const repository = new ListAllTenantsRepository({
        [AppProviders.prisma]: mockPrisma,
      });

      await repository.listAll({ includeDeleted: true });

      expect(mockFindMany).toHaveBeenCalledTimes(1);
      const callArgs = mockFindMany.mock.calls[0]?.[0];
      expect(callArgs?.where?.deletedAt).toBeUndefined();
    });

    it('should support pagination', async () => {
      const { mockPrisma, mockFindMany } = setup();
      const repository = new ListAllTenantsRepository({
        [AppProviders.prisma]: mockPrisma,
      });

      await repository.listAll({ skip: 10, take: 20 });

      expect(mockFindMany).toHaveBeenCalledTimes(1);
      const callArgs = mockFindMany.mock.calls[0]?.[0];
      expect(callArgs?.skip).toBe(10);
      expect(callArgs?.take).toBe(20);
    });

    it('should return tenants with all fields', async () => {
      const { mockPrisma } = setup();
      const repository = new ListAllTenantsRepository({
        [AppProviders.prisma]: mockPrisma,
      });

      const result = await repository.listAll();

      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0]?.id).toBe('tenant-1');
      expect(result[0]?.name).toBe('Tenant 1');
      expect(result[0]?.createdBy).toBe('user-123');
    });

    it('should order by createdAt descending', async () => {
      const { mockPrisma, mockFindMany } = setup();
      const repository = new ListAllTenantsRepository({
        [AppProviders.prisma]: mockPrisma,
      });

      await repository.listAll();

      const callArgs = mockFindMany.mock.calls[0]?.[0];
      expect(callArgs?.orderBy).toEqual({
        createdAt: 'desc',
      });
    });
  });
});

