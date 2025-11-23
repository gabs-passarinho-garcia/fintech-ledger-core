import { Decimal } from 'decimal.js';
import { Prisma } from 'prisma/client';
import type { IService } from '@/common/interfaces/IService';
import type { ITransactionManager } from '@/common/adapters/ITransactionManager';
import type { IQueueProducer } from '@/common/interfaces/IQueueProducer';
import type { ILogger } from '@/common/interfaces/ILogger';
import type { SessionHandler } from '@/common/providers/SessionHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { LedgerEntryFactory } from '../domain/LedgerEntry.factory';
import type { LedgerEntry } from '../domain/LedgerEntry.entity';
import type { GetAccountRepository } from '../infra/repositories/GetAccountRepository';
import type { UpdateAccountBalanceRepository } from '../infra/repositories/UpdateAccountBalanceRepository';
import type { CreateLedgerEntryRepository } from '../infra/repositories/CreateLedgerEntryRepository';
import type { GetProfileRepository } from '@/models/auth/infra/repositories/GetProfileRepository';
import type { GetProfileBalanceRepository } from '@/models/auth/infra/repositories/GetProfileBalanceRepository';
import type { UpdateProfileBalanceRepository } from '@/models/auth/infra/repositories/UpdateProfileBalanceRepository';
import type { GetUserRepository } from '@/models/auth/infra/repositories/GetUserRepository';
import { AuthorizationHelper } from '@/models/auth/usecases/helpers/AuthorizationHelper';
import { DomainError } from '@/common/errors';

export interface CreateLedgerEntryInput {
  tenantId: string;
  fromAccountId: string;
  toAccountId?: string | null;
  amount: number | string | Decimal;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
}

export interface CreateLedgerEntryOutput {
  id: string;
  tenantId: string;
  fromAccountId?: string | null;
  toAccountId?: string | null;
  amount: string;
  type: string;
  status: string;
  createdAt: Date;
}

/**
 * Use case for creating ledger entries with atomic transaction support.
 * This use case demonstrates ACID compliance by executing all operations
 * (balance updates and entry creation) within a single database transaction.
 */
export class CreateLedgerEntryUseCase
  implements IService<CreateLedgerEntryInput, CreateLedgerEntryOutput>
{
  private readonly transactionManager: ITransactionManager;
  private readonly queueProducer: IQueueProducer;
  private readonly logger: ILogger;
  private readonly sessionHandler: SessionHandler;
  private readonly getAccountRepository: GetAccountRepository;
  private readonly updateAccountBalanceRepository: UpdateAccountBalanceRepository;
  private readonly createLedgerEntryRepository: CreateLedgerEntryRepository;
  private readonly getProfileBalanceRepository: GetProfileBalanceRepository;
  private readonly updateProfileBalanceRepository: UpdateProfileBalanceRepository;
  private readonly authorizationHelper: AuthorizationHelper;

  public constructor(opts: {
    [AppProviders.transactionManager]: ITransactionManager;
    [AppProviders.queueProducer]: IQueueProducer;
    [AppProviders.logger]: ILogger;
    [AppProviders.sessionHandler]: SessionHandler;
    [AppProviders.getAccountRepository]: GetAccountRepository;
    [AppProviders.updateAccountBalanceRepository]: UpdateAccountBalanceRepository;
    [AppProviders.createLedgerEntryRepository]: CreateLedgerEntryRepository;
    [AppProviders.getProfileRepository]: GetProfileRepository;
    [AppProviders.getProfileBalanceRepository]: GetProfileBalanceRepository;
    [AppProviders.updateProfileBalanceRepository]: UpdateProfileBalanceRepository;
    [AppProviders.getUserRepository]: GetUserRepository;
  }) {
    this.transactionManager = opts[AppProviders.transactionManager];
    this.queueProducer = opts[AppProviders.queueProducer];
    this.logger = opts[AppProviders.logger];
    this.sessionHandler = opts[AppProviders.sessionHandler];
    this.getAccountRepository = opts[AppProviders.getAccountRepository];
    this.updateAccountBalanceRepository = opts[AppProviders.updateAccountBalanceRepository];
    this.createLedgerEntryRepository = opts[AppProviders.createLedgerEntryRepository];
    this.getProfileBalanceRepository = opts[AppProviders.getProfileBalanceRepository];
    this.updateProfileBalanceRepository = opts[AppProviders.updateProfileBalanceRepository];
    this.authorizationHelper = new AuthorizationHelper({
      sessionHandler: opts[AppProviders.sessionHandler],
      getUserRepository: opts[AppProviders.getUserRepository],
      getProfileRepository: opts[AppProviders.getProfileRepository],
    });
  }

  /**
   * Validates account existence and retrieves their profile IDs.
   * Also validates profile ownership for common users.
   *
   * @param input - The input data containing account IDs
   * @param tx - The Prisma transaction client
   * @returns Object containing fromAccountProfileId and toAccountProfileId
   */
  private async validateAndGetAccountProfileIds(
    input: CreateLedgerEntryInput,
    tx: Prisma.TransactionClient,
  ): Promise<{ fromAccountProfileId: string | null; toAccountProfileId: string | null }> {
    let fromAccountProfileId: string | null = null;
    let toAccountProfileId: string | null = null;

    if (input.fromAccountId) {
      const fromAccount = await this.getAccountRepository.findByIdOrThrow({
        accountId: input.fromAccountId,
        tenantId: input.tenantId,
        tx,
      });
      fromAccountProfileId = fromAccount.profileId;

      if (fromAccountProfileId) {
        await this.authorizationHelper.requireProfileOwnershipOrMaster({
          profileId: fromAccountProfileId,
        });
      }
    }

    if (input.toAccountId) {
      const toAccount = await this.getAccountRepository.findByIdOrThrow({
        accountId: input.toAccountId,
        tenantId: input.tenantId,
        tx,
      });
      toAccountProfileId = toAccount.profileId;

      if (toAccountProfileId) {
        await this.authorizationHelper.requireProfileOwnershipOrMaster({
          profileId: toAccountProfileId,
        });
      }
    }

    return { fromAccountProfileId, toAccountProfileId };
  }

  /**
   * Executes balance updates based on transaction type.
   *
   * @param input - The input data containing transaction type and account IDs
   * @param amount - The transaction amount
   * @param tx - The Prisma transaction client
   * @throws {DomainError} If required accounts are missing for the transaction type
   */
  private async executeBalanceUpdates(
    input: CreateLedgerEntryInput,
    amount: Decimal,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const balanceUpdateStrategies = {
      TRANSFER: async (): Promise<void> => {
        if (!input.fromAccountId || !input.toAccountId) {
          throw new DomainError({
            message: 'Transfer transactions require both fromAccountId and toAccountId',
          });
        }

        await this.updateAccountBalanceRepository.debit({
          accountId: input.fromAccountId,
          tenantId: input.tenantId,
          amount,
          tx,
        });

        await this.updateAccountBalanceRepository.credit({
          accountId: input.toAccountId,
          tenantId: input.tenantId,
          amount,
          tx,
        });

        this.logger.info(
          {
            fromAccountId: input.fromAccountId,
            toAccountId: input.toAccountId,
            amount: amount.toString(),
          },
          'create_ledger_entry:transfer_executed',
          CreateLedgerEntryUseCase.name,
        );
      },
      WITHDRAWAL: async (): Promise<void> => {
        if (!input.fromAccountId) {
          throw new DomainError({
            message: 'Withdrawal transactions require fromAccountId',
          });
        }

        await this.updateAccountBalanceRepository.debit({
          accountId: input.fromAccountId,
          tenantId: input.tenantId,
          amount,
          tx,
        });

        this.logger.info(
          {
            fromAccountId: input.fromAccountId,
            amount: amount.toString(),
          },
          'create_ledger_entry:withdrawal_executed',
          CreateLedgerEntryUseCase.name,
        );
      },
      DEPOSIT: async (): Promise<void> => {
        if (!input.toAccountId) {
          throw new DomainError({
            message: 'Deposit transactions require toAccountId',
          });
        }

        await this.updateAccountBalanceRepository.credit({
          accountId: input.toAccountId,
          tenantId: input.tenantId,
          amount,
          tx,
        });

        this.logger.info(
          {
            toAccountId: input.toAccountId,
            amount: amount.toString(),
          },
          'create_ledger_entry:deposit_executed',
          CreateLedgerEntryUseCase.name,
        );
      },
    };

    const strategy = balanceUpdateStrategies[input.type];
    if (strategy) {
      await strategy();
    }
  }

  /**
   * Creates and persists the ledger entry entity.
   *
   * @param input - The input data for creating the ledger entry
   * @param amount - The transaction amount
   * @param createdBy - The user ID who created the entry
   * @param tx - The Prisma transaction client
   * @returns The created ledger entry
   */
  private async createAndPersistLedgerEntry(
    input: CreateLedgerEntryInput,
    amount: Decimal,
    createdBy: string,
    tx: Prisma.TransactionClient,
  ): Promise<LedgerEntry> {
    const entry = LedgerEntryFactory.create({
      tenantId: input.tenantId,
      fromAccountId: input.fromAccountId,
      toAccountId: input.toAccountId,
      amount,
      type: input.type,
      createdBy,
    });

    entry.markAsCompleted(createdBy);

    return await this.createLedgerEntryRepository.create({
      ledgerEntry: entry,
      tx,
    });
  }

  /**
   * Updates balance for all affected profiles.
   *
   * @param fromAccountProfileId - Profile ID of the source account (if any)
   * @param toAccountProfileId - Profile ID of the destination account (if any)
   * @param tenantId - The tenant ID
   * @param updatedBy - The user ID who triggered the update
   * @param tx - The Prisma transaction client
   */
  private async updateAffectedProfileBalances(
    fromAccountProfileId: string | null,
    toAccountProfileId: string | null,
    tenantId: string,
    updatedBy: string,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const affectedProfileIds = new Set<string>();
    if (fromAccountProfileId) {
      affectedProfileIds.add(fromAccountProfileId);
    }
    if (toAccountProfileId && toAccountProfileId !== fromAccountProfileId) {
      affectedProfileIds.add(toAccountProfileId);
    }

    await Promise.all(
      Array.from(affectedProfileIds).map(async (profileId) => {
        const calculatedBalance = await this.getProfileBalanceRepository.calculateBalance({
          profileId,
          tenantId,
          tx,
        });

        await this.updateProfileBalanceRepository.updateBalance({
          profileId,
          tenantId,
          balance: calculatedBalance,
          updatedBy,
          tx,
        });

        this.logger.info(
          {
            profileId,
            newBalance: calculatedBalance.toString(),
          },
          'create_ledger_entry:profile_balance_updated',
          CreateLedgerEntryUseCase.name,
        );
      }),
    );
  }

  /**
   * Executes the create ledger entry use case.
   * This method performs all operations within a single database transaction to ensure atomicity.
   *
   * Steps performed atomically:
   * 1. Validates account existence (if applicable)
   * 2. Validates account balance (for withdrawals and transfers)
   * 3. Debits from source account (if applicable)
   * 4. Credits to destination account (if applicable)
   * 5. Creates the ledger entry
   *
   * After successful transaction, dispatches an event to SQS for async processing.
   *
   * @param input - The input data for creating the ledger entry
   * @returns The created ledger entry output
   * @throws {DomainError} If business rules are violated
   */
  public async execute(input: CreateLedgerEntryInput): Promise<CreateLedgerEntryOutput> {
    const createdBy = this.sessionHandler.getAgent();

    this.logger.info(
      {
        tenantId: input.tenantId,
        type: input.type,
        amount: input.amount.toString(),
        createdBy,
      },
      'create_ledger_entry:start',
      CreateLedgerEntryUseCase.name,
    );

    const amount = input.amount instanceof Decimal ? input.amount : new Decimal(input.amount);

    // Validate amount
    if (amount.lessThanOrEqualTo(0)) {
      throw new DomainError({
        message: 'Amount must be greater than zero',
      });
    }

    // Execute all operations within a single transaction
    const ledgerEntry = await this.transactionManager.runInTransaction(async (ctx) => {
      const { fromAccountProfileId, toAccountProfileId } =
        await this.validateAndGetAccountProfileIds(input, ctx.prisma);

      await this.executeBalanceUpdates(input, amount, ctx.prisma);

      const createdEntry = await this.createAndPersistLedgerEntry(
        input,
        amount,
        createdBy,
        ctx.prisma,
      );

      await this.updateAffectedProfileBalances(
        fromAccountProfileId,
        toAccountProfileId,
        input.tenantId,
        createdBy,
        ctx.prisma,
      );

      this.logger.info(
        {
          ledgerEntryId: createdEntry.id,
          status: createdEntry.status,
        },
        'create_ledger_entry:entry_created',
        CreateLedgerEntryUseCase.name,
      );

      return createdEntry;
    });

    // Dispatch event to SQS asynchronously (non-blocking)
    // This happens after the transaction is committed
    try {
      await this.queueProducer.sendMessage({
        queueName: 'transaction-created',
        message: JSON.stringify({
          ledgerEntryId: ledgerEntry.id,
          tenantId: ledgerEntry.tenantId,
          amount: ledgerEntry.amount.toString(),
          type: ledgerEntry.type,
          status: ledgerEntry.status,
        }),
        delay: 0, // Process immediately
      });

      this.logger.info(
        {
          ledgerEntryId: ledgerEntry.id,
        },
        'create_ledger_entry:event_dispatched',
        CreateLedgerEntryUseCase.name,
      );
    } catch (error) {
      // Log error but don't fail the operation
      // The transaction was already committed successfully
      this.logger.error(
        {
          ledgerEntryId: ledgerEntry.id,
          error: error as Error,
        },
        'create_ledger_entry:event_dispatch_failed',
        CreateLedgerEntryUseCase.name,
      );
    }

    return {
      id: ledgerEntry.id,
      tenantId: ledgerEntry.tenantId,
      fromAccountId: ledgerEntry.fromAccountId,
      toAccountId: ledgerEntry.toAccountId,
      amount: ledgerEntry.amount.toString(),
      type: ledgerEntry.type,
      status: ledgerEntry.status,
      createdAt: ledgerEntry.createdAt,
    };
  }
}
