import { describe, it, expect, mock } from 'bun:test';
import { UpdateProfileRepository } from '../UpdateProfileRepository';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import type { ITransactionContext } from '@/common/adapters/ITransactionManager';
import { Prisma } from 'prisma/client';

describe('UpdateProfileRepository', () => {
  const setup = () => {
    const mockUpdate = mock(async () => ({
      id: 'profile-123',
      userId: 'user-123',
      tenantId: 'tenant-123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    }));

    const mockPrisma = {
      profile: {
        update: mockUpdate,
      },
    } as unknown as PrismaHandler;

    return { mockPrisma, mockUpdate };
  };

  describe('update', () => {
    it('should update firstName', async () => {
      const { mockPrisma, mockUpdate } = setup();
      const repository = new UpdateProfileRepository({ [AppProviders.prisma]: mockPrisma });

      await repository.update({
        profileId: 'profile-123',
        firstName: 'Jane',
      });

      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith({
        where: {
          id: 'profile-123',
          deletedAt: null,
        },
        data: {
          firstName: 'Jane',
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should update lastName', async () => {
      const { mockPrisma, mockUpdate } = setup();
      const repository = new UpdateProfileRepository({ [AppProviders.prisma]: mockPrisma });

      await repository.update({
        profileId: 'profile-123',
        lastName: 'Smith',
      });

      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith({
        where: {
          id: 'profile-123',
          deletedAt: null,
        },
        data: {
          lastName: 'Smith',
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should update email and lowercase it', async () => {
      const { mockPrisma, mockUpdate } = setup();
      const repository = new UpdateProfileRepository({ [AppProviders.prisma]: mockPrisma });

      await repository.update({
        profileId: 'profile-123',
        email: 'JANE@EXAMPLE.COM',
      });

      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith({
        where: {
          id: 'profile-123',
          deletedAt: null,
        },
        data: {
          email: 'jane@example.com',
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should update multiple fields', async () => {
      const { mockPrisma, mockUpdate } = setup();
      const repository = new UpdateProfileRepository({ [AppProviders.prisma]: mockPrisma });

      await repository.update({
        profileId: 'profile-123',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
      });

      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith({
        where: {
          id: 'profile-123',
          deletedAt: null,
        },
        data: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should update updatedAt timestamp', async () => {
      const { mockPrisma, mockUpdate } = setup();
      const repository = new UpdateProfileRepository({ [AppProviders.prisma]: mockPrisma });

      await repository.update({
        profileId: 'profile-123',
        firstName: 'Jane',
      });

      expect(mockUpdate).toHaveBeenCalledWith({
        where: {
          id: 'profile-123',
          deletedAt: null,
        },
        data: {
          firstName: 'Jane',
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should use transaction context when provided', async () => {
      const mockUpdate = mock(async () => ({
        id: 'profile-123',
        userId: 'user-123',
        tenantId: 'tenant-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      }));

      const mockTxClient = {
        profile: {
          update: mockUpdate,
        },
      } as unknown as Prisma.TransactionClient;

      const mockTxContext: ITransactionContext = {
        prisma: mockTxClient,
      };

      const { mockPrisma } = setup();
      const repository = new UpdateProfileRepository({ [AppProviders.prisma]: mockPrisma });

      await repository.update({
        profileId: 'profile-123',
        firstName: 'Jane',
        tx: mockTxContext,
      });

      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockPrisma.profile.update).not.toHaveBeenCalled();
    });

    it('should return updated profile entity', async () => {
      const { mockPrisma } = setup();
      const repository = new UpdateProfileRepository({ [AppProviders.prisma]: mockPrisma });

      const result = await repository.update({
        profileId: 'profile-123',
        firstName: 'Jane',
      });

      expect(result).toBeDefined();
      expect(result.id).toBe('profile-123');
      expect(result.firstName).toBe('John'); // From mock return
    });
  });
});

