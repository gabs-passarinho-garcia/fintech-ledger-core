import { describe, it, expect, mock } from 'bun:test';
import { ListProfilesByTenantRepository } from '../ListProfilesByTenantRepository';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';

describe('ListProfilesByTenantRepository', () => {
  const createMockPrisma = (profiles: any[] = []) => {
    const mockFindMany = mock(async () => profiles);

    return {
      profile: {
        findMany: mockFindMany,
      },
    } as unknown as PrismaHandler;
  };

  describe('listByTenantId', () => {
    it('should return list of profiles for tenant', async () => {
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
          userId: 'user-456',
          tenantId: 'tenant-1',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@tenant1.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];

      const mockPrisma = createMockPrisma(mockProfiles);
      const repository = new ListProfilesByTenantRepository({
        [AppProviders.prisma]: mockPrisma,
      });

      const result = await repository.listByTenantId({ tenantId: 'tenant-1' });

      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0]?.tenantId).toBe('tenant-1');
      expect(result[1]?.tenantId).toBe('tenant-1');
      expect(mockPrisma.profile.findMany).toHaveBeenCalled();
    });

    it('should return empty array when no profiles found', async () => {
      const mockPrisma = createMockPrisma([]);
      const repository = new ListProfilesByTenantRepository({
        [AppProviders.prisma]: mockPrisma,
      });

      const result = await repository.listByTenantId({ tenantId: 'tenant-1' });

      expect(result).toEqual([]);
    });

    it('should filter by tenantId', async () => {
      const mockPrisma = createMockPrisma([]);
      const repository = new ListProfilesByTenantRepository({
        [AppProviders.prisma]: mockPrisma,
      });

      await repository.listByTenantId({ tenantId: 'tenant-1' });

      expect(mockPrisma.profile.findMany).toHaveBeenCalledWith({
        where: {
          tenantId: 'tenant-1',
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

    it('should exclude deleted profiles', async () => {
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
          userId: 'user-456',
          tenantId: 'tenant-1',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@tenant1.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: new Date(), // Deleted profile
        },
      ];

      const mockPrisma = createMockPrisma(mockProfiles.filter((p) => p.deletedAt === null));
      const repository = new ListProfilesByTenantRepository({
        [AppProviders.prisma]: mockPrisma,
      });

      const result = await repository.listByTenantId({ tenantId: 'tenant-1' });

      expect(result.length).toBe(1);
      expect(result[0]?.id).toBe('profile-1');
      expect(mockPrisma.profile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
          }),
        }),
      );
    });

    it('should use transaction client when provided', async () => {
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
      ];

      const mockTx = createMockPrisma(mockProfiles);
      const mockPrisma = createMockPrisma([]);
      const repository = new ListProfilesByTenantRepository({
        [AppProviders.prisma]: mockPrisma,
      });

      await repository.listByTenantId({ tenantId: 'tenant-1', tx: mockTx as any });

      expect(mockTx.profile.findMany).toHaveBeenCalled();
      expect(mockPrisma.profile.findMany).not.toHaveBeenCalled();
    });
  });
});

