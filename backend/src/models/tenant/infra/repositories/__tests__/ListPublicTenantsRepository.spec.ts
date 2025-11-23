import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { ListPublicTenantsRepository } from '../ListPublicTenantsRepository';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';

describe('ListPublicTenantsRepository', () => {
  const setup = () => {
    const mockPrisma = {
      tenant: {
        findMany: mock(),
      },
    } as unknown as PrismaHandler;

    const repository = new ListPublicTenantsRepository({
      [AppProviders.prisma]: mockPrisma,
    });

    return { repository, mockPrisma };
  };

  beforeEach(() => {
    mock.restore();
  });

  describe('listPublic', () => {
    it('should return list of non-deleted tenants with id and name only', async () => {
      const { repository, mockPrisma } = setup();

      const mockTenants = [
        {
          id: 'tenant-1',
          name: 'Tenant 1',
        },
        {
          id: 'tenant-2',
          name: 'Tenant 2',
        },
      ];

      (mockPrisma.tenant.findMany as ReturnType<typeof mock>).mockResolvedValue(mockTenants);

      const result = await repository.listPublic();

      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0]?.id).toBe('tenant-1');
      expect(result[0]?.name).toBe('Tenant 1');
      expect(result[1]?.id).toBe('tenant-2');
      expect(result[1]?.name).toBe('Tenant 2');
      expect(mockPrisma.tenant.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
    });

    it('should return empty array when no tenants exist', async () => {
      const { repository, mockPrisma } = setup();

      (mockPrisma.tenant.findMany as ReturnType<typeof mock>).mockResolvedValue([]);

      const result = await repository.listPublic();

      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });

    it('should filter out deleted tenants', async () => {
      const { repository, mockPrisma } = setup();

      const mockTenants = [
        {
          id: 'tenant-1',
          name: 'Active Tenant',
        },
      ];

      (mockPrisma.tenant.findMany as ReturnType<typeof mock>).mockResolvedValue(mockTenants);

      const result = await repository.listPublic();

      expect(result.length).toBe(1);
      expect(mockPrisma.tenant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            deletedAt: null,
          },
        }),
      );
    });

    it('should order tenants by name ascending', async () => {
      const { repository, mockPrisma } = setup();

      (mockPrisma.tenant.findMany as ReturnType<typeof mock>).mockResolvedValue([]);

      await repository.listPublic();

      expect(mockPrisma.tenant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            name: 'asc',
          },
        }),
      );
    });
  });
});

