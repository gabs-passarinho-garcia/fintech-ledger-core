import { Decimal } from 'decimal.js';
import type { IService } from '@/common/interfaces/IService';
import type { ITransactionManager } from '@/common/adapters/ITransactionManager';
import type { IQueueProducer } from '@/common/interfaces/IQueueProducer';
import type { ILogger } from '@/common/interfaces/ILogger';
import type { SessionHandler } from '@/common/providers/SessionHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { LedgerEntryFactory } from '../domain/LedgerEntry.factory';
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
      // Validate accounts exist and get their profileIds
      let fromAccountProfileId: string | null = null;
      let toAccountProfileId: string | null = null;

      if (input.fromAccountId) {
        const fromAccount = await this.getAccountRepository.findByIdOrThrow({
          accountId: input.fromAccountId,
          tenantId: input.tenantId,
          tx: ctx.prisma,
        });
        fromAccountProfileId = fromAccount.profileId;

        // Validate profile ownership for common users
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
          tx: ctx.prisma,
        });
        toAccountProfileId = toAccount.profileId;

        // Validate profile ownership for common users
        if (toAccountProfileId) {
          await this.authorizationHelper.requireProfileOwnershipOrMaster({
            profileId: toAccountProfileId,
          });
        }
      }

      // Handle balance updates based on transaction type
      if (input.type === 'TRANSFER') {
        if (!input.fromAccountId || !input.toAccountId) {
          throw new DomainError({
            message: 'Transfer transactions require both fromAccountId and toAccountId',
          });
        }

        // Debit from source account
        await this.updateAccountBalanceRepository.debit({
          accountId: input.fromAccountId,
          tenantId: input.tenantId,
          amount,
          tx: ctx.prisma,
        });

        // Credit to destination account
        await this.updateAccountBalanceRepository.credit({
          accountId: input.toAccountId,
          tenantId: input.tenantId,
          amount,
          tx: ctx.prisma,
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
      } else if (input.type === 'WITHDRAWAL') {
        if (!input.fromAccountId) {
          throw new DomainError({
            message: 'Withdrawal transactions require fromAccountId',
          });
        }

        // Debit from account
        await this.updateAccountBalanceRepository.debit({
          accountId: input.fromAccountId,
          tenantId: input.tenantId,
          amount,
          tx: ctx.prisma,
        });

        this.logger.info(
          {
            fromAccountId: input.fromAccountId,
            amount: amount.toString(),
          },
          'create_ledger_entry:withdrawal_executed',
          CreateLedgerEntryUseCase.name,
        );
      } else if (input.type === 'DEPOSIT') {
        if (!input.toAccountId) {
          throw new DomainError({
            message: 'Deposit transactions require toAccountId',
          });
        }

        // Credit to account
        await this.updateAccountBalanceRepository.credit({
          accountId: input.toAccountId,
          tenantId: input.tenantId,
          amount,
          tx: ctx.prisma,
        });

        this.logger.info(
          {
            toAccountId: input.toAccountId,
            amount: amount.toString(),
          },
          'create_ledger_entry:deposit_executed',
          CreateLedgerEntryUseCase.name,
        );
      }

      // Create the ledger entry
      const entry = LedgerEntryFactory.create({
        tenantId: input.tenantId,
        fromAccountId: input.fromAccountId,
        toAccountId: input.toAccountId,
        amount,
        type: input.type,
        createdBy,
      });

      // Mark as completed since balance updates succeeded
      entry.markAsCompleted(createdBy);

      const createdEntry = await this.createLedgerEntryRepository.create({
        ledgerEntry: entry,
        tx: ctx.prisma,
      });

      // Update profile balances for affected profiles
      const affectedProfileIds = new Set<string>();
      if (fromAccountProfileId) {
        affectedProfileIds.add(fromAccountProfileId);
      }
      if (toAccountProfileId && toAccountProfileId !== fromAccountProfileId) {
        affectedProfileIds.add(toAccountProfileId);
      }

      // Update each affected profile's balance
      await Promise.all(
        Array.from(affectedProfileIds).map(async (profileId) => {
          const calculatedBalance = await this.getProfileBalanceRepository.calculateBalance({
            profileId,
            tenantId: input.tenantId,
            tx: ctx.prisma,
          });

          await this.updateProfileBalanceRepository.updateBalance({
            profileId,
            tenantId: input.tenantId,
            balance: calculatedBalance,
            updatedBy: createdBy,
            tx: ctx.prisma,
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
