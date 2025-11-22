import { describe, it, expect, mock } from 'bun:test';
import { ListTenantsByUserRepository } from '../ListTenantsByUserRepository';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';

describe('ListTenantsByUserRepository', () => {
  const setup = () => {
    const mockProfileFindMany = mock(async () => [
      {
        tenantId: 'tenant-1',
      },
      {
        tenantId: 'tenant-2',
      },
    ]);

    const mockTenantFindMany = mock(async () => [
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
        createdBy: 'user-123',
        createdAt: new Date('2024-01-02'),
        updatedBy: null,
        updatedAt: new Date('2024-01-02'),
        deletedBy: null,
        deletedAt: null,
      },
    ]);

    const mockPrisma = {
      profile: {
        findMany: mockProfileFindMany,
      },
      tenant: {
        findMany: mockTenantFindMany,
      },
    } as unknown as PrismaHandler;

    return { mockPrisma, mockProfileFindMany, mockTenantFindMany };
  };

  describe('listByUserId', () => {
    it('should return list of tenants for user', async () => {
      const { mockPrisma } = setup();
      const repository = new ListTenantsByUserRepository({
        [AppProviders.prisma]: mockPrisma,
      });

      const result = await repository.listByUserId({ userId: 'user-123' });

      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0]?.id).toBe('tenant-1');
      expect(result[1]?.id).toBe('tenant-2');
    });

    it('should return empty array when user has no profiles', async () => {
      const mockProfileFindMany = mock(async () => []);
      const mockTenantFindMany = mock(async () => []);

      const mockPrisma = {
        profile: {
          findMany: mockProfileFindMany,
        },
        tenant: {
          findMany: mockTenantFindMany,
        },
      } as unknown as PrismaHandler;

      const repository = new ListTenantsByUserRepository({
        [AppProviders.prisma]: mockPrisma,
      });

      const result = await repository.listByUserId({ userId: 'user-123' });

      expect(result).toEqual([]);
      expect(mockTenantFindMany).not.toHaveBeenCalled();
    });

    it('should filter profiles by userId and exclude deleted', async () => {
      const { mockPrisma, mockProfileFindMany } = setup();
      const repository = new ListTenantsByUserRepository({
        [AppProviders.prisma]: mockPrisma,
      });

      await repository.listByUserId({ userId: 'user-123' });

      expect(mockProfileFindMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          deletedAt: null,
        },
        select: {
          tenantId: true,
        },
        distinct: ['tenantId'],
      });
    });

    it('should filter tenants by IDs from profiles and exclude deleted', async () => {
      const { mockPrisma, mockTenantFindMany } = setup();
      const repository = new ListTenantsByUserRepository({
        [AppProviders.prisma]: mockPrisma,
      });

      await repository.listByUserId({ userId: 'user-123' });

      expect(mockTenantFindMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: ['tenant-1', 'tenant-2'],
          },
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          createdBy: true,
          createdAt: true,
          updatedBy: true,
          updatedAt: true,
          deletedBy: true,
          deletedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should support transaction context', async () => {
      const { mockPrisma } = setup();
      const mockTx = {
        profile: {
          findMany: mock(async () => [{ tenantId: 'tenant-1' }]),
        },
        tenant: {
          findMany: mock(async () => [
            {
              id: 'tenant-1',
              name: 'Tenant 1',
              createdBy: 'user-123',
              createdAt: new Date(),
              updatedBy: null,
              updatedAt: new Date(),
              deletedBy: null,
              deletedAt: null,
            },
          ]),
        },
      };

      const repository = new ListTenantsByUserRepository({
        [AppProviders.prisma]: mockPrisma,
      });

      const result = await repository.listByUserId({
        userId: 'user-123',
        tx: mockTx as never,
      });

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
    });
  });
});

