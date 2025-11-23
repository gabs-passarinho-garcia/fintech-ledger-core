import type { IService } from '@/common/interfaces/IService';
import type { ILogger } from '@/common/interfaces/ILogger';
import type { SessionHandler } from '@/common/providers/SessionHandler';
import type { ListAllProfilesRepository } from '@/models/auth/infra/repositories/ListAllProfilesRepository';
import type { ListAccountsByProfileIdRepository } from '../infra/repositories/ListAccountsByProfileIdRepository';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { AuthorizationHelper } from '@/models/auth/usecases/helpers/AuthorizationHelper';
import type { GetUserRepository } from '@/models/auth/infra/repositories/GetUserRepository';
import type { GetProfileRepository } from '@/models/auth/infra/repositories/GetProfileRepository';

export interface ProfileWithAccounts {
  id: string;
  userId: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  balance: string;
  createdAt: Date;
  updatedAt: Date;
  accounts: {
    id: string;
    name: string;
    balance: string;
  }[];
}

export type ListProfilesWithAccountsInput = Record<string, never>;

export interface ListProfilesWithAccountsOutput {
  profiles: ProfileWithAccounts[];
}

/**
 * Use case for listing all profiles with their accounts.
 * Only master users can execute this use case.
 */
export class ListProfilesWithAccountsUseCase
  implements IService<ListProfilesWithAccountsInput, ListProfilesWithAccountsOutput>
{
  private readonly logger: ILogger;
  private readonly listAllProfilesRepository: ListAllProfilesRepository;
  private readonly listAccountsByProfileIdRepository: ListAccountsByProfileIdRepository;
  private readonly authorizationHelper: AuthorizationHelper;

  public constructor(opts: {
    [AppProviders.logger]: ILogger;
    [AppProviders.listAllProfilesRepository]: ListAllProfilesRepository;
    [AppProviders.listAccountsByProfileIdRepository]: ListAccountsByProfileIdRepository;
    [AppProviders.sessionHandler]: SessionHandler;
    [AppProviders.getUserRepository]: GetUserRepository;
    [AppProviders.getProfileRepository]: GetProfileRepository;
  }) {
    this.logger = opts[AppProviders.logger];
    this.listAllProfilesRepository = opts[AppProviders.listAllProfilesRepository];
    this.listAccountsByProfileIdRepository = opts[AppProviders.listAccountsByProfileIdRepository];
    this.authorizationHelper = new AuthorizationHelper({
      sessionHandler: opts[AppProviders.sessionHandler],
      getUserRepository: opts[AppProviders.getUserRepository],
      getProfileRepository: opts[AppProviders.getProfileRepository],
    });
  }

  /**
   * Executes the list profiles with accounts use case.
   * Verifies master user privileges before listing profiles.
   *
   * @param _input - Empty input (uses authenticated user from session)
   * @returns List of all profiles with their accounts
   * @throws {ForbiddenError} If user is not a master user
   */
  public async execute(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _input: ListProfilesWithAccountsInput = {} as ListProfilesWithAccountsInput,
  ): Promise<ListProfilesWithAccountsOutput> {
    this.logger.info({}, 'list_profiles_with_accounts:start', ListProfilesWithAccountsUseCase.name);

    // Check master user privileges
    await this.authorizationHelper.requireMaster();

    // List all profiles
    const profiles = await this.listAllProfilesRepository.listAll({
      includeDeleted: false,
      skip: undefined,
      take: undefined,
    });

    // For each profile, get its accounts
    const profilesWithAccounts = await Promise.all(
      profiles.map(async (item) => {
        const accounts = await this.listAccountsByProfileIdRepository.findByProfileId({
          profileId: item.profile.id,
          tenantId: item.profile.tenantId,
        });

        return {
          id: item.profile.id,
          userId: item.profile.userId,
          tenantId: item.profile.tenantId,
          firstName: item.profile.firstName,
          lastName: item.profile.lastName,
          email: item.profile.email,
          balance: item.profile.balance.toString(),
          createdAt: item.profile.createdAt,
          updatedAt: item.profile.updatedAt,
          accounts: accounts.map((account) => ({
            id: account.id,
            name: account.name,
            balance: account.balance.toString(),
          })),
        };
      }),
    );

    this.logger.info(
      {
        profileCount: profilesWithAccounts.length,
      },
      'list_profiles_with_accounts:success',
      ListProfilesWithAccountsUseCase.name,
    );

    return {
      profiles: profilesWithAccounts,
    };
  }
}
