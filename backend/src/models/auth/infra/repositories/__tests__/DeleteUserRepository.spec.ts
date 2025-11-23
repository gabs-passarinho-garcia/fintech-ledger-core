import { describe, it, expect, mock } from 'bun:test';
import { DeleteUserRepository } from '../DeleteUserRepository';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import type { ITransactionContext } from '@/common/adapters/ITransactionManager';
import { Prisma } from 'prisma/client';

describe('DeleteUserRepository', () => {
  const setup = () => {
    const mockProfileUpdateMany = mock(async () => ({ count: 2 }));
    const mockUserUpdateMany = mock(async () => ({ count: 1 }));

    const mockPrisma = {
      profile: {
        updateMany: mockProfileUpdateMany,
      },
      user: {
        updateMany: mockUserUpdateMany,
      },
    } as unknown as PrismaHandler;

    return { mockPrisma, mockProfileUpdateMany, mockUserUpdateMany };
  };

  describe('delete', () => {
    it('should soft delete user and all profiles', async () => {
      const { mockPrisma, mockProfileUpdateMany, mockUserUpdateMany } = setup();
      const repository = new DeleteUserRepository({ [AppProviders.prisma]: mockPrisma });

      const userId = 'user-123';

      await repository.delete({ userId });

      expect(mockProfileUpdateMany).toHaveBeenCalledTimes(1);
      expect(mockUserUpdateMany).toHaveBeenCalledTimes(1);

      // Check profiles are deleted first
      expect(mockProfileUpdateMany).toHaveBeenCalledWith({
        where: {
          userId,
          deletedAt: null,
        },
        data: {
          deletedAt: expect.any(Date),
        },
      });

      // Check user is deleted
      expect(mockUserUpdateMany).toHaveBeenCalledWith({
        where: {
          id: userId,
          deletedAt: null,
        },
        data: {
          deletedAt: expect.any(Date),
        },
      });
    });

    it('should use same timestamp for user and profiles', async () => {
      let profileDeletedAt: Date | undefined;
      let userDeletedAt: Date | undefined;

      const mockProfileUpdateMany = mock(async (args: any) => {
        profileDeletedAt = args.data.deletedAt;
        return { count: 2 };
      });

      const mockUserUpdateMany = mock(async (args: any) => {
        userDeletedAt = args.data.deletedAt;
        return { count: 1 };
      });

      const mockPrisma = {
        profile: {
          updateMany: mockProfileUpdateMany,
        },
        user: {
          updateMany: mockUserUpdateMany,
        },
      } as unknown as PrismaHandler;

      const repository = new DeleteUserRepository({ [AppProviders.prisma]: mockPrisma });

      await repository.delete({ userId: 'user-123' });

      expect(profileDeletedAt).toBeInstanceOf(Date);
      expect(userDeletedAt).toBeInstanceOf(Date);
      expect(profileDeletedAt?.getTime()).toBe(userDeletedAt?.getTime());
    });

    it('should use transaction context when provided', async () => {
      const mockProfileUpdateMany = mock(async () => ({ count: 2 }));
      const mockUserUpdateMany = mock(async () => ({ count: 1 }));

      const mockTxClient = {
        profile: {
          updateMany: mockProfileUpdateMany,
        },
        user: {
          updateMany: mockUserUpdateMany,
        },
      } as unknown as Prisma.TransactionClient;

      const mockTxContext: ITransactionContext = {
        prisma: mockTxClient,
      };

      const { mockPrisma } = setup();
      const repository = new DeleteUserRepository({ [AppProviders.prisma]: mockPrisma });

      await repository.delete({ userId: 'user-123', tx: mockTxContext });

      expect(mockProfileUpdateMany).toHaveBeenCalledTimes(1);
      expect(mockUserUpdateMany).toHaveBeenCalledTimes(1);
      expect(mockPrisma.profile.updateMany).not.toHaveBeenCalled();
      expect(mockPrisma.user.updateMany).not.toHaveBeenCalled();
    });

    it('should not throw error when user has no profiles', async () => {
      const { mockPrisma, mockProfileUpdateMany } = setup();
      mockProfileUpdateMany.mockResolvedValue({ count: 0 });

      const repository = new DeleteUserRepository({ [AppProviders.prisma]: mockPrisma });

      await expect(async () => {
        await repository.delete({ userId: 'user-123' });
      }).not.toThrow();
    });
  });
});

