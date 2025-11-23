import type { IService } from '@/common/interfaces/IService';
import type { ITransactionManager } from '@/common/adapters/ITransactionManager';
import type { ILogger } from '@/common/interfaces/ILogger';
import type { SessionHandler } from '@/common/providers/SessionHandler';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { AccountFactory } from '../domain/Account.factory';
import type { CreateAccountRepository } from '../infra/repositories/CreateAccountRepository';
import type { GetProfileRepository } from '@/models/auth/infra/repositories/GetProfileRepository';
import type { GetProfileBalanceRepository } from '@/models/auth/infra/repositories/GetProfileBalanceRepository';
import type { UpdateProfileBalanceRepository } from '@/models/auth/infra/repositories/UpdateProfileBalanceRepository';
import type { GetUserRepository } from '@/models/auth/infra/repositories/GetUserRepository';
import { AuthorizationHelper } from '@/models/auth/usecases/helpers/AuthorizationHelper';
import { NotFoundError, DomainError } from '@/common/errors';
import type { CreateAccountRequest, CreateAccountResponse } from '../dtos/CreateAccount.dto';

export type CreateAccountInput = CreateAccountRequest;

export type CreateAccountOutput = CreateAccountResponse;

/**
 * Use case for creating an account.
 * Validates that the profile exists and user has access (owner or master).
 * All operations are executed within a transaction to ensure atomicity.
 */
export class CreateAccountUseCase implements IService<CreateAccountInput, CreateAccountOutput> {
  private readonly transactionManager: ITransactionManager;
  private readonly logger: ILogger;
  private readonly sessionHandler: SessionHandler;
  private readonly createAccountRepository: CreateAccountRepository;
  private readonly getProfileRepository: GetProfileRepository;
  private readonly getProfileBalanceRepository: GetProfileBalanceRepository;
  private readonly updateProfileBalanceRepository: UpdateProfileBalanceRepository;
  private readonly authorizationHelper: AuthorizationHelper;

  public constructor(opts: {
    [AppProviders.transactionManager]: ITransactionManager;
    [AppProviders.logger]: ILogger;
    [AppProviders.sessionHandler]: SessionHandler;
    [AppProviders.createAccountRepository]: CreateAccountRepository;
    [AppProviders.getProfileRepository]: GetProfileRepository;
    [AppProviders.getProfileBalanceRepository]: GetProfileBalanceRepository;
    [AppProviders.updateProfileBalanceRepository]: UpdateProfileBalanceRepository;
    [AppProviders.getUserRepository]: GetUserRepository;
  }) {
    this.transactionManager = opts[AppProviders.transactionManager];
    this.logger = opts[AppProviders.logger];
    this.sessionHandler = opts[AppProviders.sessionHandler];
    this.createAccountRepository = opts[AppProviders.createAccountRepository];
    this.getProfileRepository = opts[AppProviders.getProfileRepository];
    this.getProfileBalanceRepository = opts[AppProviders.getProfileBalanceRepository];
    this.updateProfileBalanceRepository = opts[AppProviders.updateProfileBalanceRepository];
    this.authorizationHelper = new AuthorizationHelper({
      sessionHandler: opts[AppProviders.sessionHandler],
      getUserRepository: opts[AppProviders.getUserRepository],
      getProfileRepository: opts[AppProviders.getProfileRepository],
    });
  }

  /**
   * Executes the create account use case.
   * Creates an account for a profile within a transaction.
   *
   * @param input - The input data for creating the account
   * @returns The created account
   * @throws {NotFoundError} If the profile is not found
   * @throws {DomainError} If validation fails
   */
  public async execute(input: CreateAccountInput): Promise<CreateAccountOutput> {
    const createdBy = this.sessionHandler.getAgent();

    this.logger.info(
      {
        profileId: input.profileId,
        tenantId: input.tenantId,
        name: input.name,
      },
      'create_account:start',
      CreateAccountUseCase.name,
    );

    // Validate profileId is provided
    if (!input.profileId) {
      throw new DomainError({
        message: 'Profile ID is required',
      });
    }

    // Validate profile exists
    const profile = await this.getProfileRepository.findById({
      profileId: input.profileId,
    });

    if (!profile) {
      throw new NotFoundError({
        message: `Profile with ID ${input.profileId} not found`,
      });
    }

    // Validate profile belongs to tenant
    if (profile.tenantId !== input.tenantId) {
      throw new DomainError({
        message: 'Profile does not belong to the specified tenant',
      });
    }

    // Validate user has access to this profile (owner or master)
    await this.authorizationHelper.requireProfileOwnershipOrMaster({
      profileId: input.profileId,
    });

    // Execute within transaction
    const result = await this.transactionManager.runInTransaction(async (tx) => {
      const accountEntity = AccountFactory.create({
        tenantId: input.tenantId,
        profileId: input.profileId,
        name: input.name,
        balance: input.initialBalance ?? 0,
        createdBy,
      });

      const createdAccount = await this.createAccountRepository.create({
        account: accountEntity,
        tx,
      });

      // Update profile balance after account creation
      const currentProfileBalance = await this.getProfileBalanceRepository.calculateBalance({
        profileId: input.profileId,
        tenantId: input.tenantId,
        tx: tx.prisma,
      });

      await this.updateProfileBalanceRepository.updateBalance({
        profileId: input.profileId,
        tenantId: input.tenantId,
        balance: currentProfileBalance,
        updatedBy: createdBy,
        tx: tx.prisma,
      });

      return {
        id: createdAccount.id,
        tenantId: createdAccount.tenantId,
        profileId: createdAccount.profileId,
        name: createdAccount.name,
        balance: createdAccount.balance.toString(),
        createdAt: createdAccount.createdAt,
        updatedAt: createdAccount.updatedAt,
      };
    });

    this.logger.info(
      {
        accountId: result.id,
        profileId: result.profileId,
        tenantId: result.tenantId,
      },
      'create_account:success',
      CreateAccountUseCase.name,
    );

    return result;
  }
}
