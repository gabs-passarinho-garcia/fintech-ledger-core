import type { IService } from '@/common/interfaces/IService';
import type { ILogger } from '@/common/interfaces/ILogger';
import type { SessionHandler } from '@/common/providers/SessionHandler';
import type { GetProfileRepository } from '../infra/repositories/GetProfileRepository';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { AuthorizationHelper } from './helpers/AuthorizationHelper';
import type { GetUserRepository } from '../infra/repositories/GetUserRepository';
import type { GetProfileInput, GetProfileResponse } from '../dtos/GetProfile.dto';

export type GetProfileOutput = GetProfileResponse;

/**
 * Use case for getting a profile by ID.
 * Verifies authorization (owner or master user) before returning the profile.
 */
export class GetProfileUseCase implements IService<GetProfileInput, GetProfileOutput> {
  private readonly logger: ILogger;
  private readonly getProfileRepository: GetProfileRepository;
  private readonly authorizationHelper: AuthorizationHelper;

  public constructor(opts: {
    [AppProviders.logger]: ILogger;
    [AppProviders.getProfileRepository]: GetProfileRepository;
    [AppProviders.sessionHandler]: SessionHandler;
    [AppProviders.getUserRepository]: GetUserRepository;
  }) {
    this.logger = opts[AppProviders.logger];
    this.getProfileRepository = opts[AppProviders.getProfileRepository];
    this.authorizationHelper = new AuthorizationHelper({
      sessionHandler: opts[AppProviders.sessionHandler],
      getUserRepository: opts[AppProviders.getUserRepository],
      getProfileRepository: opts[AppProviders.getProfileRepository],
    });
  }

  /**
   * Executes the get profile use case.
   * Verifies authorization before returning the profile.
   *
   * @param input - The input data containing profile ID
   * @returns The profile data
   * @throws {ForbiddenError} If user is not authorized
   * @throws {NotFoundError} If profile is not found
   */
  public async execute(input: GetProfileInput): Promise<GetProfileOutput> {
    this.logger.info(
      {
        profileId: input.profileId,
      },
      'get_profile:start',
      GetProfileUseCase.name,
    );

    // Check authorization
    await this.authorizationHelper.checkProfileOwnership(input.profileId);

    // Get profile
    const profile = await this.getProfileRepository.findById({ profileId: input.profileId });

    if (!profile) {
      throw new Error('Profile not found after authorization check');
    }

    this.logger.info(
      {
        profileId: profile.id,
        userId: profile.userId,
      },
      'get_profile:success',
      GetProfileUseCase.name,
    );

    return {
      id: profile.id,
      userId: profile.userId,
      tenantId: profile.tenantId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
