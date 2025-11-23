import { describe, it, expect, mock } from 'bun:test';
import { CreateLedgerEntryUseCase } from '../CreateLedgerEntry.usecase';
import type { ITransactionManager } from '@/common/adapters/ITransactionManager';
import type { IQueueProducer } from '@/common/interfaces/IQueueProducer';
import type { ILogger } from '@/common/interfaces/ILogger';
import type { PrismaHandler } from '@/common/providers/PrismaHandler';
import type { SessionHandler } from '@/common/providers/SessionHandler';
import { DomainError, NotFoundError } from '@/common/errors';
import { Decimal } from 'decimal.js';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { GetAccountRepository } from '../../infra/repositories/GetAccountRepository';
import { UpdateAccountBalanceRepository } from '../../infra/repositories/UpdateAccountBalanceRepository';
import { CreateLedgerEntryRepository } from '../../infra/repositories/CreateLedgerEntryRepository';
import type { GetProfileRepository } from '@/models/auth/infra/repositories/GetProfileRepository';
import type { GetProfileBalanceRepository } from '@/models/auth/infra/repositories/GetProfileBalanceRepository';
import type { UpdateProfileBalanceRepository } from '@/models/auth/infra/repositories/UpdateProfileBalanceRepository';
import type { GetUserRepository } from '@/models/auth/infra/repositories/GetUserRepository';

describe('CreateLedgerEntryUseCase', () => {
  const setup = () => {
    const mockQueueProducer: IQueueProducer = {
      sendMessage: mock(async () => {
        // Mock successful message send
      }),
    };

    const mockLogger: ILogger = {
      log: mock(() => {}),
      info: mock(() => {}),
      warn: mock(() => {}),
      error: mock(() => {}),
      debug: mock(() => {}),
    };

    const mockSessionHandler: SessionHandler = {
      getAgent: mock(() => 'user-123'),
      get: mock(() => ({
        userId: 'user-123',
        tenantId: 'tenant-1',
        accessType: 'AUTH_USER' as const,
      })),
      enrich: mock(),
      initialize: mock(),
      run: mock((fn) => fn()),
      clear: mock(),
    } as unknown as SessionHandler;

    const mockPrisma: PrismaHandler = {} as PrismaHandler;

    return {
      mockQueueProducer,
      mockLogger,
      mockSessionHandler,
      mockPrisma,
    };
  };

  const createMockAccount = (id: string, balance: string = '1000.00', profileId: string | null = 'profile-1') => ({
    id,
    tenantId: 'tenant-1',
    profileId,
    name: `Account ${id}`,
    balance: { toString: () => balance },
  });

  const createMockUseCase = (opts: {
    mockTransactionManager: ITransactionManager;
    mockQueueProducer: IQueueProducer;
    mockLogger: ILogger;
    mockSessionHandler: SessionHandler;
    mockPrisma: PrismaHandler;
    mockGetProfileRepository?: GetProfileRepository;
    mockGetProfileBalanceRepository?: GetProfileBalanceRepository;
    mockUpdateProfileBalanceRepository?: UpdateProfileBalanceRepository;
    mockGetUserRepository?: GetUserRepository;
  }) => {
    const getAccountRepository = new GetAccountRepository({ [AppProviders.prisma]: opts.mockPrisma });
    const updateAccountBalanceRepository = new UpdateAccountBalanceRepository({
      [AppProviders.prisma]: opts.mockPrisma,
    });
    const createLedgerEntryRepository = new CreateLedgerEntryRepository({
      [AppProviders.prisma]: opts.mockPrisma,
    });

    const mockGetProfileRepository: GetProfileRepository = opts.mockGetProfileRepository || ({
      findById: mock(async (args: { profileId: string }) => {
        // Return a mock profile for profile-1
        if (args.profileId === 'profile-1') {
          return {
            id: 'profile-1',
            userId: 'user-123',
            tenantId: 'tenant-1',
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            balance: { toString: () => '0' },
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          } as any;
        }
        return null;
      }),
    } as unknown as GetProfileRepository);

    const mockGetProfileBalanceRepository: GetProfileBalanceRepository =
      opts.mockGetProfileBalanceRepository ||
      ({
        calculateBalance: mock(async () => new Decimal(0)),
      } as unknown as GetProfileBalanceRepository);

    const mockUpdateProfileBalanceRepository: UpdateProfileBalanceRepository =
      opts.mockUpdateProfileBalanceRepository ||
      ({
        updateBalance: mock(async () => {}),
      } as unknown as UpdateProfileBalanceRepository);

    const mockGetUserRepository: GetUserRepository =
      opts.mockGetUserRepository ||
      ({
        findById: mock(async () => ({ id: 'user-123', isMaster: false })),
      } as unknown as GetUserRepository);

    return new CreateLedgerEntryUseCase({
      [AppProviders.transactionManager]: opts.mockTransactionManager,
      [AppProviders.queueProducer]: opts.mockQueueProducer,
      [AppProviders.logger]: opts.mockLogger,
      [AppProviders.sessionHandler]: opts.mockSessionHandler,
      [AppProviders.getAccountRepository]: getAccountRepository,
      [AppProviders.updateAccountBalanceRepository]: updateAccountBalanceRepository,
      [AppProviders.createLedgerEntryRepository]: createLedgerEntryRepository,
      [AppProviders.getProfileRepository]: mockGetProfileRepository,
      [AppProviders.getProfileBalanceRepository]: mockGetProfileBalanceRepository,
      [AppProviders.updateProfileBalanceRepository]: mockUpdateProfileBalanceRepository,
      [AppProviders.getUserRepository]: mockGetUserRepository,
    });
  };

  const createMockPrismaClient = (accounts: Record<string, any> = {}) => {
    const mockAccountFindFirst = mock(async (args: any) => {
      const account = accounts[args.where.id];
      return account || null;
    });

    const mockAccountUpdate = mock(async () => ({
      id: 'account-1',
      tenantId: 'tenant-1',
      profileId: 'profile-1',
      balance: new Decimal('900.00'),
    }));

    return {
      account: {
        findFirst: mockAccountFindFirst,
        update: mockAccountUpdate,
      },
      ledgerEntry: {
        create: mock(async (args: any) => ({
          id: 'entry-1',
          tenantId: args.data.tenantId,
          fromAccountId: args.data.fromAccountId,
          toAccountId: args.data.toAccountId,
          amount: args.data.amount,
          type: args.data.type,
          status: args.data.status,
          createdBy: args.data.createdBy,
          createdAt: new Date(),
          updatedBy: args.data.updatedBy,
          updatedAt: new Date(),
          deletedBy: null,
          deletedAt: null,
        })),
      },
    };
  };

  describe('execute', () => {
    it('should validate that amount must be greater than zero', async () => {
      const { mockQueueProducer, mockLogger, mockPrisma, mockSessionHandler } = setup();

      // Mock transaction manager that should not be called for amount validation
      const mockTransactionManager: ITransactionManager = {
        runInTransaction: mock(async () => {
          throw new Error('Transaction should not be called when amount validation fails');
        }),
      };

      const useCase = createMockUseCase({
        mockTransactionManager,
        mockQueueProducer,
        mockLogger,
        mockSessionHandler,
        mockPrisma,
      });

      await expect(
        useCase.execute({
          tenantId: 'tenant-1',
          fromAccountId: 'account-1',
          toAccountId: 'account-1',
          amount: '0',
          type: 'DEPOSIT',
        }),
      ).rejects.toThrow(DomainError);

      // Verify transaction was not called (validation happened before)
      expect(mockTransactionManager.runInTransaction).not.toHaveBeenCalled();
    });

    it('should validate that TRANSFER requires both accounts', async () => {
      const { mockQueueProducer, mockLogger, mockPrisma, mockSessionHandler } = setup();

      const mockPrismaClient = createMockPrismaClient({
        'account-1': createMockAccount('account-1'),
      });

      // Mock transaction manager that executes the callback to allow validation inside transaction
      const mockTransactionManager: ITransactionManager = {
        runInTransaction: mock(async (callback) => {
          // Create a mock transaction context with mocked Prisma
          const mockTx = {
            prisma: mockPrismaClient as any,
          };

          // Execute the callback which will perform the validation
          return await callback(mockTx);
        }),
      };

      const useCase = createMockUseCase({
        mockTransactionManager,
        mockQueueProducer,
        mockLogger,
        mockSessionHandler,
        mockPrisma,
      });

      await expect(
        useCase.execute({
          tenantId: 'tenant-1',
          fromAccountId: 'account-1',
          amount: '100.00',
          type: 'TRANSFER',
        }),
      ).rejects.toThrow(DomainError);

      // Verify transaction was called (validation happens inside transaction)
      expect(mockTransactionManager.runInTransaction).toHaveBeenCalled();
    });

    it('should successfully create a DEPOSIT transaction', async () => {
      const { mockQueueProducer, mockLogger, mockPrisma, mockSessionHandler } = setup();

      const mockPrismaClient = createMockPrismaClient({
        'account-1': createMockAccount('account-1'),
      });

      const mockTransactionManager: ITransactionManager = {
        runInTransaction: mock(async (callback) => {
          const mockTx = {
            prisma: mockPrismaClient as any,
          };
          return await callback(mockTx);
        }),
      };

      const useCase = createMockUseCase({
        mockTransactionManager,
        mockQueueProducer,
        mockLogger,
        mockSessionHandler,
        mockPrisma,
      });

      const result = await useCase.execute({
        tenantId: 'tenant-1',
        fromAccountId: 'account-1',
        toAccountId: 'account-1',
        amount: '100.00',
        type: 'DEPOSIT',
      });

      expect(result).toBeDefined();
      expect(result.type).toBe('DEPOSIT');
      expect(result.status).toBe('COMPLETED');
      expect(mockTransactionManager.runInTransaction).toHaveBeenCalled();
      expect(mockQueueProducer.sendMessage).toHaveBeenCalled();
    });

    it('should successfully create a WITHDRAWAL transaction', async () => {
      const { mockQueueProducer, mockLogger, mockPrisma, mockSessionHandler } = setup();

      const mockPrismaClient = createMockPrismaClient({
        'account-1': createMockAccount('account-1', '1000.00'),
      });

      const mockTransactionManager: ITransactionManager = {
        runInTransaction: mock(async (callback) => {
          const mockTx = {
            prisma: mockPrismaClient as any,
          };
          return await callback(mockTx);
        }),
      };

      const useCase = createMockUseCase({
        mockTransactionManager,
        mockQueueProducer,
        mockLogger,
        mockSessionHandler,
        mockPrisma,
      });

      const result = await useCase.execute({
        tenantId: 'tenant-1',
        fromAccountId: 'account-1',
        amount: '100.00',
        type: 'WITHDRAWAL',
      });

      expect(result).toBeDefined();
      expect(result.type).toBe('WITHDRAWAL');
      expect(result.status).toBe('COMPLETED');
      expect(mockTransactionManager.runInTransaction).toHaveBeenCalled();
    });

    it('should successfully create a TRANSFER transaction', async () => {
      const { mockQueueProducer, mockLogger, mockPrisma, mockSessionHandler } = setup();

      const mockPrismaClient = createMockPrismaClient({
        'account-1': createMockAccount('account-1', '1000.00'),
        'account-2': createMockAccount('account-2', '500.00'),
      });

      const mockTransactionManager: ITransactionManager = {
        runInTransaction: mock(async (callback) => {
          const mockTx = {
            prisma: mockPrismaClient as any,
          };
          return await callback(mockTx);
        }),
      };

      const useCase = createMockUseCase({
        mockTransactionManager,
        mockQueueProducer,
        mockLogger,
        mockSessionHandler,
        mockPrisma,
      });

      const result = await useCase.execute({
        tenantId: 'tenant-1',
        fromAccountId: 'account-1',
        toAccountId: 'account-2',
        amount: '100.00',
        type: 'TRANSFER',
      });

      expect(result).toBeDefined();
      expect(result.type).toBe('TRANSFER');
      expect(result.status).toBe('COMPLETED');
      expect(result.fromAccountId).toBe('account-1');
      expect(result.toAccountId).toBe('account-2');
      expect(mockTransactionManager.runInTransaction).toHaveBeenCalled();
    });

    it('should throw NotFoundError when fromAccount does not exist', async () => {
      const { mockQueueProducer, mockLogger, mockPrisma, mockSessionHandler } = setup();

      const mockPrismaClient = createMockPrismaClient({});

      const mockTransactionManager: ITransactionManager = {
        runInTransaction: mock(async (callback) => {
          const mockTx = {
            prisma: mockPrismaClient as any,
          };
          return await callback(mockTx);
        }),
      };

      const useCase = createMockUseCase({
        mockTransactionManager,
        mockQueueProducer,
        mockLogger,
        mockSessionHandler,
        mockPrisma,
      });

      await expect(
        useCase.execute({
          tenantId: 'tenant-1',
          fromAccountId: 'non-existent-account',
          amount: '100.00',
          type: 'WITHDRAWAL',
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when toAccount does not exist', async () => {
      const { mockQueueProducer, mockLogger, mockPrisma, mockSessionHandler } = setup();

      const mockPrismaClient = createMockPrismaClient({});

      const mockTransactionManager: ITransactionManager = {
        runInTransaction: mock(async (callback) => {
          const mockTx = {
            prisma: mockPrismaClient as any,
          };
          return await callback(mockTx);
        }),
      };

      const useCase = createMockUseCase({
        mockTransactionManager,
        mockQueueProducer,
        mockLogger,
        mockSessionHandler,
        mockPrisma,
      });

      await expect(
        useCase.execute({
          tenantId: 'tenant-1',
          fromAccountId: 'account-1',
          toAccountId: 'non-existent-account',
          amount: '100.00',
          type: 'DEPOSIT',
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it('should validate that WITHDRAWAL requires fromAccountId', async () => {
      const { mockQueueProducer, mockLogger, mockPrisma, mockSessionHandler } = setup();

      const mockPrismaClient = createMockPrismaClient({});

      const mockTransactionManager: ITransactionManager = {
        runInTransaction: mock(async (callback) => {
          const mockTx = {
            prisma: mockPrismaClient as any,
          };
          return await callback(mockTx);
        }),
      };

      const useCase = createMockUseCase({
        mockTransactionManager,
        mockQueueProducer,
        mockLogger,
        mockSessionHandler,
        mockPrisma,
      });

      await expect(
        useCase.execute({
          tenantId: 'tenant-1',
          fromAccountId: '',
          amount: '100.00',
          type: 'WITHDRAWAL',
        }),
      ).rejects.toThrow(DomainError);
    });

    it('should validate that DEPOSIT requires toAccountId', async () => {
      const { mockQueueProducer, mockLogger, mockPrisma, mockSessionHandler } = setup();

      // Mock account exists so we can test toAccountId validation
      const mockPrismaClient = createMockPrismaClient({
        'account-1': createMockAccount('account-1'),
      });

      const mockTransactionManager: ITransactionManager = {
        runInTransaction: mock(async (callback) => {
          const mockTx = {
            prisma: mockPrismaClient as any,
          };
          return await callback(mockTx);
        }),
      };

      const useCase = createMockUseCase({
        mockTransactionManager,
        mockQueueProducer,
        mockLogger,
        mockSessionHandler,
        mockPrisma,
      });

      await expect(
        useCase.execute({
          tenantId: 'tenant-1',
          fromAccountId: 'account-1',
          amount: '100.00',
          type: 'DEPOSIT',
        }),
      ).rejects.toThrow(DomainError);
    });

    it('should handle queue producer errors gracefully', async () => {
      const { mockLogger, mockPrisma, mockSessionHandler } = setup();

      const mockQueueProducer: IQueueProducer = {
        sendMessage: mock(async () => {
          throw new Error('Queue error');
        }),
      };

      const mockPrismaClient = createMockPrismaClient({
        'account-1': createMockAccount('account-1'),
      });

      const mockTransactionManager: ITransactionManager = {
        runInTransaction: mock(async (callback) => {
          const mockTx = {
            prisma: mockPrismaClient as any,
          };
          return await callback(mockTx);
        }),
      };

      const useCase = createMockUseCase({
        mockTransactionManager,
        mockQueueProducer,
        mockLogger,
        mockSessionHandler,
        mockPrisma,
      });

      // Should still succeed even if queue fails
      const result = await useCase.execute({
        tenantId: 'tenant-1',
        fromAccountId: 'account-1',
        toAccountId: 'account-1',
        amount: '100.00',
        type: 'DEPOSIT',
      });

      expect(result).toBeDefined();
      expect(result.status).toBe('COMPLETED');
      // Verify error was logged
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should obtain createdBy from SessionHandler.getAgent()', async () => {
      const { mockQueueProducer, mockLogger, mockPrisma } = setup();

      const mockSessionHandler: SessionHandler = {
        getAgent: mock(() => 'agent-from-session'),
        get: mock(() => ({
          userId: 'user-123',
          tenantId: 'tenant-1',
          accessType: 'AUTH_USER' as const,
        })),
        enrich: mock(),
        initialize: mock(),
        run: mock((fn) => fn()),
        clear: mock(),
      } as unknown as SessionHandler;

      const mockPrismaClient = createMockPrismaClient({
        'account-1': createMockAccount('account-1'),
      });

      const mockTransactionManager: ITransactionManager = {
        runInTransaction: mock(async (callback) => {
          const mockTx = {
            prisma: mockPrismaClient as any,
          };
          return await callback(mockTx);
        }),
      };

      const useCase = createMockUseCase({
        mockTransactionManager,
        mockQueueProducer,
        mockLogger,
        mockSessionHandler,
        mockPrisma,
      });

      const result = await useCase.execute({
        tenantId: 'tenant-1',
        fromAccountId: 'account-1',
        toAccountId: 'account-1',
        amount: '100.00',
        type: 'DEPOSIT',
      });

      expect(result).toBeDefined();
      expect(mockSessionHandler.getAgent).toHaveBeenCalled();
      // Verify that the createdBy from session handler was used in the ledger entry
      expect(mockPrismaClient.ledgerEntry.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            createdBy: 'agent-from-session',
          }),
        }),
      );
    });
  });
});
