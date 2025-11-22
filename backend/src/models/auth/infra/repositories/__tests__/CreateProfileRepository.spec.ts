import { describe, it, expect, mock } from 'bun:test';
import { CreateProfileRepository } from '../CreateProfileRepository';
import { ProfileFactory } from '../../../domain';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import type { ITransactionContext } from '@/common/adapters/ITransactionManager';
import { Prisma } from 'prisma/client';
import { AppProviders } from '@/common/interfaces/IAppContainer';

describe('CreateProfileRepository', () => {
  const setup = () => {
    const mockProfile = ProfileFactory.create({
      userId: 'user-123',
      tenantId: 'tenant-123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    });

    return { mockProfile };
  };

  describe('create', () => {
    it('should persist profile in database', async () => {
      const { mockProfile } = setup();
      const mockCreate = mock(async () => ({
        id: mockProfile.id,
        userId: mockProfile.userId,
        tenantId: mockProfile.tenantId,
        firstName: mockProfile.firstName,
        lastName: mockProfile.lastName,
        email: mockProfile.email,
        createdAt: mockProfile.createdAt,
        updatedAt: mockProfile.updatedAt,
        deletedAt: mockProfile.deletedAt,
      }));

      const mockPrisma = {
        profile: {
          create: mockCreate,
        },
      } as unknown as PrismaHandler;

      const repository = new CreateProfileRepository({ [AppProviders.prisma]: mockPrisma });

      const result = await repository.create({ profile: mockProfile });

      expect(result).toBeDefined();
      expect(result.id).toBe(mockProfile.id);
      expect(result.userId).toBe(mockProfile.userId);
      expect(result.tenantId).toBe(mockProfile.tenantId);
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    it('should use transaction context when provided', async () => {
      const { mockProfile } = setup();
      const mockCreate = mock(async () => ({
        id: mockProfile.id,
        userId: mockProfile.userId,
        tenantId: mockProfile.tenantId,
        firstName: mockProfile.firstName,
        lastName: mockProfile.lastName,
        email: mockProfile.email,
        createdAt: mockProfile.createdAt,
        updatedAt: mockProfile.updatedAt,
        deletedAt: mockProfile.deletedAt,
      }));

      const mockTxClient = {
        profile: {
          create: mockCreate,
        },
      } as unknown as Prisma.TransactionClient;

      const mockTxContext: ITransactionContext = {
        prisma: mockTxClient,
      };

      const mockPrisma = {
        profile: {
          create: mock(async () => ({})),
        },
      } as unknown as PrismaHandler;

      const repository = new CreateProfileRepository({ [AppProviders.prisma]: mockPrisma });

      const result = await repository.create({ profile: mockProfile, tx: mockTxContext });

      expect(result).toBeDefined();
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });
  });
});

