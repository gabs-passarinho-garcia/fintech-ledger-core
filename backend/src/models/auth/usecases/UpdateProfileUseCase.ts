import type { IService } from '@/common/interfaces/IService';
import type { ILogger } from '@/common/interfaces/ILogger';
import type { SessionHandler } from '@/common/providers/SessionHandler';
import type { UpdateProfileRepository } from '../infra/repositories/UpdateProfileRepository';
import type { GetProfileRepository } from '../infra/repositories/GetProfileRepository';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { AuthorizationHelper } from './helpers/AuthorizationHelper';
import type { GetUserRepository } from '../infra/repositories/GetUserRepository';
import type { UpdateProfileInput, UpdateProfileResponse } from '../dtos/UpdateProfile.dto';

export type UpdateProfileOutput = UpdateProfileResponse;

/**
 * Use case for updating a profile.
 * Verifies authorization (owner or master user) before updating.
 */
export class UpdateProfileUseCase implements IService<UpdateProfileInput, UpdateProfileOutput> {
  private readonly logger: ILogger;
  private readonly updateProfileRepository: UpdateProfileRepository;
  private readonly authorizationHelper: AuthorizationHelper;

  public constructor(opts: {
    [AppProviders.logger]: ILogger;
    [AppProviders.updateProfileRepository]: UpdateProfileRepository;
    [AppProviders.getProfileRepository]: GetProfileRepository;
    [AppProviders.sessionHandler]: SessionHandler;
    [AppProviders.getUserRepository]: GetUserRepository;
  }) {
    this.logger = opts[AppProviders.logger];
    this.updateProfileRepository = opts[AppProviders.updateProfileRepository];
    this.authorizationHelper = new AuthorizationHelper({
      sessionHandler: opts[AppProviders.sessionHandler],
      getUserRepository: opts[AppProviders.getUserRepository],
      getProfileRepository: opts[AppProviders.getProfileRepository],
    });
  }

  /**
   * Executes the update profile use case.
   * Verifies authorization before updating the profile.
   *
   * @param input - The input data containing profile ID and fields to update
   * @returns The updated profile data
   * @throws {ForbiddenError} If user is not authorized
   * @throws {NotFoundError} If profile is not found
   */
  public async execute(input: UpdateProfileInput): Promise<UpdateProfileOutput> {
    this.logger.info(
      {
        profileId: input.profileId,
        fieldsToUpdate: {
          firstName: input.firstName !== undefined,
          lastName: input.lastName !== undefined,
          email: input.email !== undefined,
        },
      },
      'update_profile:start',
      UpdateProfileUseCase.name,
    );

    // Check authorization
    await this.authorizationHelper.checkProfileOwnership(input.profileId);

    // Update profile
    const updated = await this.updateProfileRepository.update({
      profileId: input.profileId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
    });

    this.logger.info(
      {
        profileId: updated.id,
        userId: updated.userId,
      },
      'update_profile:success',
      UpdateProfileUseCase.name,
    );

    return {
      id: updated.id,
      userId: updated.userId,
      tenantId: updated.tenantId,
      firstName: updated.firstName,
      lastName: updated.lastName,
      email: updated.email,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }
}
