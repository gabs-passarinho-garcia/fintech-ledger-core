import { describe, it, expect, mock } from 'bun:test';
import { CreateUserRepository } from '../CreateUserRepository';
import { UserFactory } from '../../../domain';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import type { ITransactionContext } from '@/common/adapters/ITransactionManager';
import { AppProviders } from '@/common/interfaces/IAppContainer';

describe('CreateUserRepository', () => {
  const setup = () => {
    const mockUser = UserFactory.create({
      username: 'testuser',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$salt$hash',
      isMaster: false,
    });

    return { mockUser };
  };

  describe('create', () => {
    it('should persist user in database', async () => {
      const { mockUser } = setup();
      const mockCreate = mock(async () => ({
        id: mockUser.id,
        username: mockUser.username,
        passwordHash: mockUser.passwordHash,
        isMaster: mockUser.isMaster,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
        deletedAt: mockUser.deletedAt,
      }));

      const mockPrisma = {
        user: {
          create: mockCreate,
        },
      } as unknown as PrismaHandler;

      const repository = new CreateUserRepository({ [AppProviders.prisma]: mockPrisma });

      const result = await repository.create({ user: mockUser });

      expect(result).toBeDefined();
      expect(result.id).toBe(mockUser.id);
      expect(result.username).toBe(mockUser.username);
      expect(result.passwordHash).toBe(mockUser.passwordHash);
      expect(result.isMaster).toBe(mockUser.isMaster);
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    it('should use transaction context when provided', async () => {
      const { mockUser } = setup();
      const mockCreate = mock(async () => ({
        id: mockUser.id,
        username: mockUser.username,
        passwordHash: mockUser.passwordHash,
        isMaster: mockUser.isMaster,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
        deletedAt: mockUser.deletedAt,
      }));

      const mockTxClient = {
        user: {
          create: mockCreate,
        },
      } as unknown as Prisma.TransactionClient;

      const mockTxContext: ITransactionContext = {
        prisma: mockTxClient,
      };

      const mockPrisma = {
        user: {
          create: mock(async () => ({})),
        },
      } as unknown as PrismaHandler;

      const repository = new CreateUserRepository({ [AppProviders.prisma]: mockPrisma });

      const result = await repository.create({ user: mockUser, tx: mockTxContext });

      expect(result).toBeDefined();
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    it('should map domain entity to Prisma model correctly', async () => {
      const { mockUser } = setup();
      const mockCreate = mock(async (args: any) => ({
        id: args.data.id,
        username: args.data.username,
        passwordHash: args.data.passwordHash,
        isMaster: args.data.isMaster,
        createdAt: args.data.createdAt,
        updatedAt: args.data.updatedAt,
        deletedAt: args.data.deletedAt,
      }));

      const mockPrisma = {
        user: {
          create: mockCreate,
        },
      } as unknown as PrismaHandler;

      const repository = new CreateUserRepository({ [AppProviders.prisma]: mockPrisma });

      await repository.create({ user: mockUser });

      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          id: mockUser.id,
          username: mockUser.username,
          passwordHash: mockUser.passwordHash,
          isMaster: mockUser.isMaster,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
          deletedAt: mockUser.deletedAt,
        },
      });
    });

    it('should reconstruct entity from database data', async () => {
      const { mockUser } = setup();
      const dbData = {
        id: mockUser.id,
        username: mockUser.username,
        passwordHash: mockUser.passwordHash,
        isMaster: mockUser.isMaster,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
        deletedAt: mockUser.deletedAt,
      };

      const mockCreate = mock(async () => dbData);

      const mockPrisma = {
        user: {
          create: mockCreate,
        },
      } as unknown as PrismaHandler;

      const repository = new CreateUserRepository({ [AppProviders.prisma]: mockPrisma });

      const result = await repository.create({ user: mockUser });

      expect(result).toBeInstanceOf(Object);
      expect(result.id).toBe(dbData.id);
      expect(result.username).toBe(dbData.username);
    });
  });
});

