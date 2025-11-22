import type { IService } from '@/common/interfaces/IService';
import type { ILogger } from '@/common/interfaces/ILogger';
import type { SessionHandler } from '@/common/providers/SessionHandler';
import type { GetProfileRepository } from '../infra/repositories/GetProfileRepository';
import type { ListProfilesByUserIdRepository } from '../infra/repositories/ListProfilesByUserIdRepository';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { NotFoundError } from '@/common/errors';
import type { GetProfileResponse } from '../dtos/GetProfile.dto';
import { SessionContextExtractor } from './helpers/SessionContextExtractor';

export type GetMyProfileInput = Record<string, never>;

export type GetMyProfileOutput = GetProfileResponse;

/**
 * Use case for getting the authenticated user's profile.
 * If tenantId is available in session, returns the profile for that tenant.
 * Otherwise, returns the first (most recent) profile for the user.
 */
export class GetMyProfileUseCase implements IService<GetMyProfileInput, GetMyProfileOutput> {
  private readonly logger: ILogger;
  private readonly sessionHandler: SessionHandler;
  private readonly getProfileRepository: GetProfileRepository;
  private readonly listProfilesByUserIdRepository: ListProfilesByUserIdRepository;

  public constructor(opts: {
    [AppProviders.logger]: ILogger;
    [AppProviders.sessionHandler]: SessionHandler;
    [AppProviders.getProfileRepository]: GetProfileRepository;
    [AppProviders.listProfilesByUserIdRepository]: ListProfilesByUserIdRepository;
  }) {
    this.logger = opts[AppProviders.logger];
    this.sessionHandler = opts[AppProviders.sessionHandler];
    this.getProfileRepository = opts[AppProviders.getProfileRepository];
    this.listProfilesByUserIdRepository = opts[AppProviders.listProfilesByUserIdRepository];
  }

  /**
   * Executes the get my profile use case.
   * Returns the authenticated user's profile, prioritizing tenant-specific profile if available.
   *
   * @param _input - Empty input (uses authenticated user from session)
   * @returns The profile data
   * @throws {NotFoundError} If profile is not found
   */
  public async execute(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _input: GetMyProfileInput = {} as GetMyProfileInput,
  ): Promise<GetMyProfileOutput> {
    const session = this.sessionHandler.get();
    const userId = SessionContextExtractor.extractUserId(session);
    const tenantId = session.tenantId;

    this.logger.info(
      {
        userId,
        tenantId,
      },
      'get_my_profile:start',
      GetMyProfileUseCase.name,
    );

    let profile;

    // If tenantId is available, try to find profile by userId and tenantId
    if (tenantId) {
      profile = await this.getProfileRepository.findByUserIdAndTenantId({
        userId,
        tenantId,
      });
    }

    // If no profile found with tenantId, or tenantId not available, get first profile
    if (!profile) {
      const profiles = await this.listProfilesByUserIdRepository.listByUserId({ userId });

      if (profiles.length === 0) {
        throw new NotFoundError({
          message: 'Profile not found for authenticated user',
        });
      }

      // Return the first profile (most recent by default)
      profile = profiles[0];
    }

    this.logger.info(
      {
        profileId: profile.id,
        userId: profile.userId,
        tenantId: profile.tenantId,
      },
      'get_my_profile:success',
      GetMyProfileUseCase.name,
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
