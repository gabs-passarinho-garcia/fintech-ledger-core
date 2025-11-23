import type { IService } from '@/common/interfaces/IService';
import type { ILogger } from '@/common/interfaces/ILogger';
import type { SessionHandler } from '@/common/providers/SessionHandler';
import type { ListAllProfilesRepository } from '../infra/repositories/ListAllProfilesRepository';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { AuthorizationHelper } from './helpers/AuthorizationHelper';
import type { GetUserRepository } from '../infra/repositories/GetUserRepository';
import type { GetProfileRepository } from '../infra/repositories/GetProfileRepository';
import type { ListAllProfilesQuery, ListAllProfilesResponse } from '../dtos/ListAllProfiles.dto';

export type ListAllProfilesInput = ListAllProfilesQuery;

export type ListAllProfilesOutput = ListAllProfilesResponse;

/**
 * Use case for listing all profiles in the system.
 * Only master users can execute this use case.
 */
export class ListAllProfilesUseCase
  implements IService<ListAllProfilesInput, ListAllProfilesOutput>
{
  private readonly logger: ILogger;
  private readonly listAllProfilesRepository: ListAllProfilesRepository;
  private readonly authorizationHelper: AuthorizationHelper;

  public constructor(opts: {
    [AppProviders.logger]: ILogger;
    [AppProviders.listAllProfilesRepository]: ListAllProfilesRepository;
    [AppProviders.sessionHandler]: SessionHandler;
    [AppProviders.getUserRepository]: GetUserRepository;
    [AppProviders.getProfileRepository]: GetProfileRepository;
  }) {
    this.logger = opts[AppProviders.logger];
    this.listAllProfilesRepository = opts[AppProviders.listAllProfilesRepository];
    this.authorizationHelper = new AuthorizationHelper({
      sessionHandler: opts[AppProviders.sessionHandler],
      getUserRepository: opts[AppProviders.getUserRepository],
      getProfileRepository: opts[AppProviders.getProfileRepository],
    });
  }

  /**
   * Executes the list all profiles use case.
   * Verifies master user privileges before listing profiles.
   *
   * @param input - The input data with optional pagination and includeDeleted flag
   * @returns List of all profiles with their users
   * @throws {ForbiddenError} If user is not a master user
   */
  public async execute(input: ListAllProfilesInput): Promise<ListAllProfilesOutput> {
    this.logger.info(
      {
        includeDeleted: input.includeDeleted,
        skip: input.skip,
        take: input.take,
      },
      'list_all_profiles:start',
      ListAllProfilesUseCase.name,
    );

    // Check master user privileges
    await this.authorizationHelper.requireMaster();

    const profiles = await this.listAllProfilesRepository.listAll({
      includeDeleted: input.includeDeleted,
      skip: input.skip,
      take: input.take,
    });

    this.logger.info(
      {
        profileCount: profiles.length,
      },
      'list_all_profiles:success',
      ListAllProfilesUseCase.name,
    );

    return {
      profiles: profiles.map((item) => ({
        id: item.profile.id,
        userId: item.profile.userId,
        tenantId: item.profile.tenantId,
        firstName: item.profile.firstName,
        lastName: item.profile.lastName,
        email: item.profile.email,
        balance: item.profile.balance.toString(),
        createdAt: item.profile.createdAt,
        updatedAt: item.profile.updatedAt,
        deletedAt: item.profile.deletedAt,
        user: {
          id: item.user.id,
          username: item.user.username,
          isMaster: item.user.isMaster,
          createdAt: item.user.createdAt,
          updatedAt: item.user.updatedAt,
          deletedAt: item.user.deletedAt,
        },
      })),
    };
  }
}
