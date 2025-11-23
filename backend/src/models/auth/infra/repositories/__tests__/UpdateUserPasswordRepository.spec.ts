import { describe, it, expect, mock } from 'bun:test';
import { UpdateUserPasswordRepository } from '../UpdateUserPasswordRepository';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import { Prisma } from 'prisma/client';
import { AppProviders } from '@/common/interfaces/IAppContainer';

describe('UpdateUserPasswordRepository', () => {
  const setup = () => {
    const mockUpdate = mock(async () => ({}));

    const mockPrisma = {
      user: {
        update: mockUpdate,
      },
    } as unknown as PrismaHandler;

    return { mockPrisma, mockUpdate };
  };

  describe('update', () => {
    it('should update password hash', async () => {
      const { mockPrisma, mockUpdate } = setup();
      const repository = new UpdateUserPasswordRepository({ [AppProviders.prisma]: mockPrisma });

      const userId = 'user-123';
      const newPasswordHash = '$argon2id$v=19$m=65536,t=3,p=4$newsalt$newhash';

      await repository.update({ userId, passwordHash: newPasswordHash });

      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          passwordHash: newPasswordHash,
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should update updatedAt timestamp', async () => {
      const { mockPrisma, mockUpdate } = setup();
      const repository = new UpdateUserPasswordRepository({ [AppProviders.prisma]: mockPrisma });

      await repository.update({
        userId: 'user-123',
        passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$salt$hash',
      });

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$salt$hash',
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should use transaction client when provided', async () => {
      const mockUpdate = mock(async () => ({}));
      const mockTxClient = {
        user: {
          update: mockUpdate,
        },
      } as unknown as Prisma.TransactionClient;

      const { mockPrisma } = setup();
      const repository = new UpdateUserPasswordRepository({ [AppProviders.prisma]: mockPrisma });

      await repository.update({
        userId: 'user-123',
        passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$salt$hash',
        tx: mockTxClient,
      });

      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });
  });
});

