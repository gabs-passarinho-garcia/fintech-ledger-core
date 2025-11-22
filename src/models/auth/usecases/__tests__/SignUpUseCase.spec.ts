import { describe, it, expect, mock } from 'bun:test';
import { SignUpUseCase } from '../SignUpUseCase';
import type { ITransactionManager } from '@/common/adapters/ITransactionManager';
import type { ILogger } from '@/common/interfaces/ILogger';
import type { PasswordHandler } from '@/common/providers/auth/PasswordHandler';
import type { CreateUserRepository } from '../../infra/repositories/CreateUserRepository';
import type { CreateProfileRepository } from '../../infra/repositories/CreateProfileRepository';
import type { GetUserByUsernameRepository } from '../../infra/repositories/GetUserByUsernameRepository';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { InternalError } from '@/common/errors';
import { UserFactory } from '../../domain/User.factory';
import { ProfileFactory } from '../../domain/Profile.factory';

describe('SignUpUseCase', () => {
  const setup = () => {
    const mockLogger: ILogger = {
      debug: mock(),
      info: mock(),
      warn: mock(),
      error: mock(),
      log: mock(),
    };

    const mockPasswordHandler: PasswordHandler = {
      hash: mock(async () => '$argon2id$v=19$m=65536,t=3,p=4$salt$hash'),
      verify: mock(),
    } as unknown as PasswordHandler;

    const mockCreateUserRepository: CreateUserRepository = {
      create: mock(),
    } as unknown as CreateUserRepository;

    const mockCreateProfileRepository: CreateProfileRepository = {
      create: mock(),
    } as unknown as CreateProfileRepository;

    const mockGetUserByUsernameRepository: GetUserByUsernameRepository = {
      findByUsername: mock(),
    } as unknown as GetUserByUsernameRepository;

    const mockTransactionManager: ITransactionManager = {
      runInTransaction: mock(async (fn) => await fn({ prisma: {} as never })),
    } as unknown as ITransactionManager;

    const useCase = new SignUpUseCase({
      [AppProviders.transactionManager]: mockTransactionManager,
      [AppProviders.logger]: mockLogger,
      [AppProviders.passwordHandler]: mockPasswordHandler,
      [AppProviders.createUserRepository]: mockCreateUserRepository,
      [AppProviders.createProfileRepository]: mockCreateProfileRepository,
      [AppProviders.getUserByUsernameRepository]: mockGetUserByUsernameRepository,
    });

    return {
      useCase,
      mockLogger,
      mockPasswordHandler,
      mockCreateUserRepository,
      mockCreateProfileRepository,
      mockGetUserByUsernameRepository,
      mockTransactionManager,
    };
  };

  describe('execute', () => {
    it('should create user and profile when tenantId is provided', async () => {
      const {
        useCase,
        mockGetUserByUsernameRepository,
        mockPasswordHandler,
        mockCreateUserRepository,
        mockCreateProfileRepository,
      } = setup();

      (mockGetUserByUsernameRepository.findByUsername as ReturnType<typeof mock>).mockResolvedValue(
        null,
      );

      const user = UserFactory.create({
        username: 'testuser',
        passwordHash: 'hash',
        isMaster: false,
      });

      (mockCreateUserRepository.create as ReturnType<typeof mock>).mockResolvedValue(user);

      const profile = ProfileFactory.create({
        userId: user.id,
        tenantId: 'tenant-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      });

      (mockCreateProfileRepository.create as ReturnType<typeof mock>).mockResolvedValue(profile);

      const result = await useCase.execute({
        username: 'testuser',
        password: 'password123',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        tenantId: 'tenant-123',
      });

      expect(result.user).toBeDefined();
      expect(result.profile).toBeDefined();
      expect(result.user.username).toBe('testuser');
      expect(result.profile?.email).toBe('john@example.com');
      expect(mockPasswordHandler.hash).toHaveBeenCalledWith('password123');
    });

    it('should create user without profile when tenantId is not provided', async () => {
      const {
        useCase,
        mockGetUserByUsernameRepository,
        mockCreateUserRepository,
      } = setup();

      (mockGetUserByUsernameRepository.findByUsername as ReturnType<typeof mock>).mockResolvedValue(
        null,
      );

      const user = UserFactory.create({
        username: 'testuser',
        passwordHash: 'hash',
        isMaster: false,
      });

      (mockCreateUserRepository.create as ReturnType<typeof mock>).mockResolvedValue(user);

      const result = await useCase.execute({
        username: 'testuser',
        password: 'password123',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(result.user).toBeDefined();
      expect(result.profile).toBeUndefined();
    });

    it('should throw InternalError when user already exists', async () => {
      const { useCase, mockGetUserByUsernameRepository } = setup();

      (mockGetUserByUsernameRepository.findByUsername as ReturnType<typeof mock>).mockResolvedValue(
        {
          id: 'user-123',
          username: 'testuser',
          passwordHash: 'hash',
          isMaster: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      );

      await expect(async () => {
        await useCase.execute({
          username: 'testuser',
          password: 'password123',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
        });
      }).toThrow(InternalError);
    });

    it('should execute within transaction', async () => {
      const {
        useCase,
        mockGetUserByUsernameRepository,
        mockPasswordHandler,
        mockCreateUserRepository,
        mockTransactionManager,
      } = setup();

      (mockGetUserByUsernameRepository.findByUsername as ReturnType<typeof mock>).mockResolvedValue(
        null,
      );

      const user = UserFactory.create({
        username: 'testuser',
        passwordHash: 'hash',
        isMaster: false,
      });

      (mockCreateUserRepository.create as ReturnType<typeof mock>).mockResolvedValue(user);

      await useCase.execute({
        username: 'testuser',
        password: 'password123',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(mockTransactionManager.runInTransaction).toHaveBeenCalledTimes(1);
      expect(mockPasswordHandler.hash).toHaveBeenCalled();
      expect(mockCreateUserRepository.create).toHaveBeenCalled();
    });
  });
});

