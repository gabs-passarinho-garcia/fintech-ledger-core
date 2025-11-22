import type { IService } from '@/common/interfaces/IService';
import type { ITransactionManager } from '@/common/adapters/ITransactionManager';
import type { ILogger } from '@/common/interfaces/ILogger';
import type { SessionHandler } from '@/common/providers/SessionHandler';
import type { DeleteProfileRepository } from '../infra/repositories/DeleteProfileRepository';
import type { GetProfileRepository } from '../infra/repositories/GetProfileRepository';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { AuthorizationHelper } from './helpers/AuthorizationHelper';
import type { GetUserRepository } from '../infra/repositories/GetUserRepository';
import type { DeleteProfileInput, DeleteProfileResponse } from '../dtos/DeleteProfile.dto';

export type DeleteProfileOutput = DeleteProfileResponse;

/**
 * Use case for soft deleting a profile.
 * Verifies authorization (owner or master user) before deleting.
 */
export class DeleteProfileUseCase implements IService<DeleteProfileInput, DeleteProfileOutput> {
  private readonly transactionManager: ITransactionManager;
  private readonly logger: ILogger;
  private readonly deleteProfileRepository: DeleteProfileRepository;
  private readonly authorizationHelper: AuthorizationHelper;

  public constructor(opts: {
    [AppProviders.transactionManager]: ITransactionManager;
    [AppProviders.logger]: ILogger;
    [AppProviders.deleteProfileRepository]: DeleteProfileRepository;
    [AppProviders.getProfileRepository]: GetProfileRepository;
    [AppProviders.sessionHandler]: SessionHandler;
    [AppProviders.getUserRepository]: GetUserRepository;
  }) {
    this.transactionManager = opts[AppProviders.transactionManager];
    this.logger = opts[AppProviders.logger];
    this.deleteProfileRepository = opts[AppProviders.deleteProfileRepository];
    this.authorizationHelper = new AuthorizationHelper({
      sessionHandler: opts[AppProviders.sessionHandler],
      getUserRepository: opts[AppProviders.getUserRepository],
      getProfileRepository: opts[AppProviders.getProfileRepository],
    });
  }

  /**
   * Executes the delete profile use case.
   * Verifies authorization before soft deleting the profile.
   *
   * @param input - The input data containing profile ID
   * @returns Success status
   * @throws {ForbiddenError} If user is not authorized
   * @throws {NotFoundError} If profile is not found
   */
  public async execute(input: DeleteProfileInput): Promise<DeleteProfileOutput> {
    this.logger.info(
      {
        profileId: input.profileId,
      },
      'delete_profile:start',
      DeleteProfileUseCase.name,
    );

    // Check authorization
    await this.authorizationHelper.checkProfileOwnership(input.profileId);

    // Soft delete profile within transaction
    await this.transactionManager.runInTransaction(async (tx) => {
      await this.deleteProfileRepository.delete({
        profileId: input.profileId,
        tx,
      });
    });

    this.logger.info(
      {
        profileId: input.profileId,
      },
      'delete_profile:success',
      DeleteProfileUseCase.name,
    );

    return { success: true };
  }
}
