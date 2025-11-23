import type { IService } from '@/common/interfaces/IService';
import type { ILogger } from '@/common/interfaces/ILogger';
import type { SessionHandler } from '@/common/providers/SessionHandler';
import type { ListProfilesByUserIdRepository } from '../infra/repositories/ListProfilesByUserIdRepository';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { AuthorizationHelper } from './helpers/AuthorizationHelper';
import type { GetUserRepository } from '../infra/repositories/GetUserRepository';
import type { GetProfileRepository } from '../infra/repositories/GetProfileRepository';
import type { ListProfilesResponse } from '../dtos/ListProfiles.dto';

export type ListProfilesByUserInput = Record<string, never>;

export type ListProfilesByUserOutput = ListProfilesResponse;

/**
 * Use case for listing profiles of the authenticated user.
 * Returns all profiles associated with the authenticated user.
 */
export class ListProfilesByUserUseCase
  implements IService<ListProfilesByUserInput, ListProfilesByUserOutput>
{
  private readonly logger: ILogger;
  private readonly listProfilesByUserIdRepository: ListProfilesByUserIdRepository;
  private readonly authorizationHelper: AuthorizationHelper;

  public constructor(opts: {
    [AppProviders.logger]: ILogger;
    [AppProviders.listProfilesByUserIdRepository]: ListProfilesByUserIdRepository;
    [AppProviders.sessionHandler]: SessionHandler;
    [AppProviders.getUserRepository]: GetUserRepository;
    [AppProviders.getProfileRepository]: GetProfileRepository;
  }) {
    this.logger = opts[AppProviders.logger];
    this.listProfilesByUserIdRepository = opts[AppProviders.listProfilesByUserIdRepository];
    this.authorizationHelper = new AuthorizationHelper({
      sessionHandler: opts[AppProviders.sessionHandler],
      getUserRepository: opts[AppProviders.getUserRepository],
      getProfileRepository: opts[AppProviders.getProfileRepository],
    });
  }

  /**
   * Executes the list profiles by user use case.
   * Lists all profiles for the authenticated user.
   *
   * @param _input - Empty input (uses authenticated user from session)
   * @returns List of profiles for the authenticated user
   * @throws {ForbiddenError} If user is not authenticated
   */

  public async execute(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _input: ListProfilesByUserInput = {} as ListProfilesByUserInput,
  ): Promise<ListProfilesByUserOutput> {
    const userId = this.authorizationHelper.getAuthenticatedUserId();

    this.logger.info(
      {
        userId,
      },
      'list_profiles_by_user:start',
      ListProfilesByUserUseCase.name,
    );

    const profiles = await this.listProfilesByUserIdRepository.listByUserId({ userId });

    this.logger.info(
      {
        userId,
        profileCount: profiles.length,
      },
      'list_profiles_by_user:success',
      ListProfilesByUserUseCase.name,
    );

    return {
      profiles: profiles.map((profile) => ({
        id: profile.id,
        userId: profile.userId,
        tenantId: profile.tenantId,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        balance: profile.balance.toString(),
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      })),
    };
  }
}
