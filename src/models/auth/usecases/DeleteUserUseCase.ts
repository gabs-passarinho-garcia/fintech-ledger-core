import type { IService } from '@/common/interfaces/IService';
import type { ITransactionManager } from '@/common/adapters/ITransactionManager';
import type { ILogger } from '@/common/interfaces/ILogger';
import type { SessionHandler } from '@/common/providers/SessionHandler';
import type { DeleteUserRepository } from '../infra/repositories/DeleteUserRepository';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { AuthorizationHelper } from './helpers/AuthorizationHelper';
import type { GetUserRepository } from '../infra/repositories/GetUserRepository';
import type { GetProfileRepository } from '../infra/repositories/GetProfileRepository';
import type { DeleteUserInput, DeleteUserResponse } from '../dtos/DeleteUser.dto';

export type DeleteUserOutput = DeleteUserResponse;

/**
 * Use case for soft deleting a user and all their profiles.
 * Verifies authorization (owner or master user) before deleting.
 * All operations are executed within a transaction to ensure atomicity.
 */
export class DeleteUserUseCase implements IService<DeleteUserInput, DeleteUserOutput> {
  private readonly transactionManager: ITransactionManager;
  private readonly logger: ILogger;
  private readonly deleteUserRepository: DeleteUserRepository;
  private readonly authorizationHelper: AuthorizationHelper;

  public constructor(opts: {
    [AppProviders.transactionManager]: ITransactionManager;
    [AppProviders.logger]: ILogger;
    [AppProviders.deleteUserRepository]: DeleteUserRepository;
    [AppProviders.sessionHandler]: SessionHandler;
    [AppProviders.getUserRepository]: GetUserRepository;
    [AppProviders.getProfileRepository]: GetProfileRepository;
  }) {
    this.transactionManager = opts[AppProviders.transactionManager];
    this.logger = opts[AppProviders.logger];
    this.deleteUserRepository = opts[AppProviders.deleteUserRepository];
    this.authorizationHelper = new AuthorizationHelper({
      sessionHandler: opts[AppProviders.sessionHandler],
      getUserRepository: opts[AppProviders.getUserRepository],
      getProfileRepository: opts[AppProviders.getProfileRepository],
    });
  }

  /**
   * Executes the delete user use case.
   * Verifies authorization before soft deleting the user and all their profiles.
   * All operations are atomic (all or nothing).
   *
   * @param input - The input data containing user ID
   * @returns Success status
   * @throws {ForbiddenError} If user is not authorized
   * @throws {NotFoundError} If user is not found
   */
  public async execute(input: DeleteUserInput): Promise<DeleteUserOutput> {
    this.logger.info(
      {
        userId: input.userId,
      },
      'delete_user:start',
      DeleteUserUseCase.name,
    );

    // Check authorization
    await this.authorizationHelper.checkUserOwnership(input.userId);

    // Soft delete user and all profiles within transaction
    await this.transactionManager.runInTransaction(async (tx) => {
      await this.deleteUserRepository.delete({
        userId: input.userId,
        tx,
      });
    });

    this.logger.info(
      {
        userId: input.userId,
      },
      'delete_user:success',
      DeleteUserUseCase.name,
    );

    return { success: true };
  }
}
