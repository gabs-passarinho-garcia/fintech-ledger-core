import type { IService } from '@/common/interfaces/IService';
import type { ILogger } from '@/common/interfaces/ILogger';
import type { SessionHandler } from '@/common/providers/SessionHandler';
import type { ListAllUsersRepository } from '../infra/repositories/ListAllUsersRepository';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { AuthorizationHelper } from './helpers/AuthorizationHelper';
import type { GetUserRepository } from '../infra/repositories/GetUserRepository';
import type { GetProfileRepository } from '../infra/repositories/GetProfileRepository';
import type { ListAllUsersQuery, ListAllUsersResponse } from '../dtos/ListAllUsers.dto';

export type ListAllUsersInput = ListAllUsersQuery;

export type ListAllUsersOutput = ListAllUsersResponse;

/**
 * Use case for listing all users in the system.
 * Only master users can execute this use case.
 */
export class ListAllUsersUseCase implements IService<ListAllUsersInput, ListAllUsersOutput> {
  private readonly logger: ILogger;
  private readonly listAllUsersRepository: ListAllUsersRepository;
  private readonly authorizationHelper: AuthorizationHelper;

  public constructor(opts: {
    [AppProviders.logger]: ILogger;
    [AppProviders.listAllUsersRepository]: ListAllUsersRepository;
    [AppProviders.sessionHandler]: SessionHandler;
    [AppProviders.getUserRepository]: GetUserRepository;
    [AppProviders.getProfileRepository]: GetProfileRepository;
  }) {
    this.logger = opts[AppProviders.logger];
    this.listAllUsersRepository = opts[AppProviders.listAllUsersRepository];
    this.authorizationHelper = new AuthorizationHelper({
      sessionHandler: opts[AppProviders.sessionHandler],
      getUserRepository: opts[AppProviders.getUserRepository],
      getProfileRepository: opts[AppProviders.getProfileRepository],
    });
  }

  /**
   * Executes the list all users use case.
   * Verifies master user privileges before listing users.
   *
   * @param input - The input data with optional pagination and includeDeleted flag
   * @returns List of all users with their profiles
   * @throws {ForbiddenError} If user is not a master user
   */
  public async execute(input: ListAllUsersInput): Promise<ListAllUsersOutput> {
    this.logger.info(
      {
        includeDeleted: input.includeDeleted,
        skip: input.skip,
        take: input.take,
      },
      'list_all_users:start',
      ListAllUsersUseCase.name,
    );

    // Check master user privileges
    await this.authorizationHelper.requireMaster();

    const users = await this.listAllUsersRepository.listAll({
      includeDeleted: input.includeDeleted,
      skip: input.skip,
      take: input.take,
    });

    this.logger.info(
      {
        userCount: users.length,
      },
      'list_all_users:success',
      ListAllUsersUseCase.name,
    );

    return {
      users: users.map((item) => ({
        id: item.user.id,
        username: item.user.username,
        isMaster: item.user.isMaster,
        createdAt: item.user.createdAt,
        updatedAt: item.user.updatedAt,
        deletedAt: item.user.deletedAt,
        profiles: item.profiles.map((profile) => ({
          id: profile.id,
          userId: profile.userId,
          tenantId: profile.tenantId,
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
          deletedAt: profile.deletedAt,
        })),
      })),
    };
  }
}
