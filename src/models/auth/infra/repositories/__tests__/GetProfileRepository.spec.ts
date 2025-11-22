import { describe, it, expect, mock } from 'bun:test';
import { GetProfileRepository } from '../GetProfileRepository';
import { NotFoundError } from '@/common/errors';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';

describe('GetProfileRepository', () => {
  const createMockPrisma = (profile: any = null) => {
    const mockFindFirst = mock(async () => profile);

    return {
      profile: {
        findFirst: mockFindFirst,
      },
    } as unknown as PrismaHandler;
  };

  describe('findById', () => {
    it('should return profile when found', async () => {
      const mockProfile = {
        id: 'profile-123',
        userId: 'user-123',
        tenantId: 'tenant-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const mockPrisma = createMockPrisma(mockProfile);
      const repository = new GetProfileRepository({ [AppProviders.prisma]: mockPrisma });

      const result = await repository.findById({ profileId: 'profile-123' });

      expect(result).toBeDefined();
      expect(result?.id).toBe('profile-123');
      expect(result?.userId).toBe('user-123');
      expect(mockPrisma.profile.findFirst).toHaveBeenCalled();
    });

    it('should return null when profile not found', async () => {
      const mockPrisma = createMockPrisma(null);
      const repository = new GetProfileRepository({ [AppProviders.prisma]: mockPrisma });

      const result = await repository.findById({ profileId: 'non-existent' });

      expect(result).toBeNull();
    });
  });

  describe('findByUserIdAndTenantIdOrThrow', () => {
    it('should return profile when found', async () => {
      const mockProfile = {
        id: 'profile-123',
        userId: 'user-123',
        tenantId: 'tenant-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const mockPrisma = createMockPrisma(mockProfile);
      const repository = new GetProfileRepository({ [AppProviders.prisma]: mockPrisma });

      const result = await repository.findByUserIdAndTenantIdOrThrow({
        userId: 'user-123',
        tenantId: 'tenant-123',
      });

      expect(result).toBeDefined();
      expect(result.id).toBe('profile-123');
    });

    it('should throw NotFoundError when profile not found', async () => {
      const mockPrisma = createMockPrisma(null);
      const repository = new GetProfileRepository({ [AppProviders.prisma]: mockPrisma });

      await expect(async () => {
        await repository.findByUserIdAndTenantIdOrThrow({
          userId: 'user-123',
          tenantId: 'tenant-123',
        });
      }).toThrow(NotFoundError);
    });
  });
});

