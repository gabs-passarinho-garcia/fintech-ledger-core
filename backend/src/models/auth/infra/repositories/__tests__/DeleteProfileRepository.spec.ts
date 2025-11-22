import { describe, it, expect, mock } from 'bun:test';
import { DeleteProfileRepository } from '../DeleteProfileRepository';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import type { ITransactionContext } from '@/common/adapters/ITransactionManager';
import { Prisma } from 'prisma/client';

describe('DeleteProfileRepository', () => {
  const setup = () => {
    const mockUpdateMany = mock(async () => ({ count: 1 }));

    const mockPrisma = {
      profile: {
        updateMany: mockUpdateMany,
      },
    } as unknown as PrismaHandler;

    return { mockPrisma, mockUpdateMany };
  };

  describe('delete', () => {
    it('should soft delete profile by setting deletedAt', async () => {
      const { mockPrisma, mockUpdateMany } = setup();
      const repository = new DeleteProfileRepository({ [AppProviders.prisma]: mockPrisma });

      const profileId = 'profile-123';

      await repository.delete({ profileId });

      expect(mockUpdateMany).toHaveBeenCalledTimes(1);
      expect(mockUpdateMany).toHaveBeenCalledWith({
        where: {
          id: profileId,
          deletedAt: null,
        },
        data: {
          deletedAt: expect.any(Date),
        },
      });
    });

    it('should set deletedAt to current timestamp', async () => {
      const { mockPrisma, mockUpdateMany } = setup();
      const repository = new DeleteProfileRepository({ [AppProviders.prisma]: mockPrisma });

      const before = new Date();
      await repository.delete({ profileId: 'profile-123' });
      const after = new Date();

      const callArgs = mockUpdateMany.mock.calls[0]?.[0];
      const deletedAt = callArgs?.data?.deletedAt as Date;

      expect(deletedAt).toBeInstanceOf(Date);
      expect(deletedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(deletedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should only delete profiles that are not already deleted', async () => {
      const { mockPrisma, mockUpdateMany } = setup();
      const repository = new DeleteProfileRepository({ [AppProviders.prisma]: mockPrisma });

      await repository.delete({ profileId: 'profile-123' });

      const callArgs = mockUpdateMany.mock.calls[0]?.[0];
      expect(callArgs?.where?.deletedAt).toBeNull();
    });

    it('should use transaction context when provided', async () => {
      const mockUpdateMany = mock(async () => ({ count: 1 }));
      const mockTxClient = {
        profile: {
          updateMany: mockUpdateMany,
        },
      } as unknown as Prisma.TransactionClient;

      const mockTxContext: ITransactionContext = {
        prisma: mockTxClient,
      };

      const { mockPrisma } = setup();
      const repository = new DeleteProfileRepository({ [AppProviders.prisma]: mockPrisma });

      await repository.delete({ profileId: 'profile-123', tx: mockTxContext });

      expect(mockUpdateMany).toHaveBeenCalledTimes(1);
      expect(mockPrisma.profile.updateMany).not.toHaveBeenCalled();
    });

    it('should not throw error when profile does not exist', async () => {
      const { mockPrisma, mockUpdateMany } = setup();
      mockUpdateMany.mockResolvedValue({ count: 0 });

      const repository = new DeleteProfileRepository({ [AppProviders.prisma]: mockPrisma });

      await expect(async () => {
        await repository.delete({ profileId: 'non-existent' });
      }).not.toThrow();
    });
  });
});

