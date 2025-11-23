import type { IService } from '@/common/interfaces/IService';
import type { ILogger } from '@/common/interfaces/ILogger';
import type { SessionHandler } from '@/common/providers/SessionHandler';
import type { GetProfileRepository } from '@/models/auth/infra/repositories/GetProfileRepository';
import type { GetUserRepository } from '@/models/auth/infra/repositories/GetUserRepository';
import type { ListAccountsByProfileIdRepository } from '../infra/repositories/ListAccountsByProfileIdRepository';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { NotFoundError } from '@/common/errors';
import { SessionContextExtractor } from '@/models/auth/usecases/helpers/SessionContextExtractor';
import { AuthorizationHelper } from '@/models/auth/usecases/helpers/AuthorizationHelper';

export interface AccountOutput {
  id: string;
  tenantId: string;
  profileId: string | null;
  name: string;
  balance: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListAccountsByProfileInput {
  profileId: string;
}

export interface ListAccountsByProfileOutput {
  accounts: AccountOutput[];
}

/**
 * Use case for listing accounts by profile ID.
 * Can be used by master users to list accounts for any profile.
 */
export class ListAccountsByProfileUseCase
  implements IService<ListAccountsByProfileInput, ListAccountsByProfileOutput>
{
  private readonly logger: ILogger;
  private readonly sessionHandler: SessionHandler;
  private readonly getProfileRepository: GetProfileRepository;
  private readonly getUserRepository: GetUserRepository;
  private readonly listAccountsByProfileIdRepository: ListAccountsByProfileIdRepository;
  private readonly authorizationHelper: AuthorizationHelper;

  public constructor(opts: {
    [AppProviders.logger]: ILogger;
    [AppProviders.sessionHandler]: SessionHandler;
    [AppProviders.getProfileRepository]: GetProfileRepository;
    [AppProviders.getUserRepository]: GetUserRepository;
    [AppProviders.listAccountsByProfileIdRepository]: ListAccountsByProfileIdRepository;
  }) {
    this.logger = opts[AppProviders.logger];
    this.sessionHandler = opts[AppProviders.sessionHandler];
    this.getProfileRepository = opts[AppProviders.getProfileRepository];
    this.getUserRepository = opts[AppProviders.getUserRepository];
    this.listAccountsByProfileIdRepository = opts[AppProviders.listAccountsByProfileIdRepository];
    this.authorizationHelper = new AuthorizationHelper({
      sessionHandler: opts[AppProviders.sessionHandler],
      getUserRepository: opts[AppProviders.getUserRepository],
      getProfileRepository: opts[AppProviders.getProfileRepository],
    });
  }

  /**
   * Executes the list accounts by profile use case.
   * Master users can list accounts for any profile, using the profile's tenant.
   * Regular users can only list accounts for profiles in their current tenant.
   *
   * @param input - The input data containing profileId
   * @returns The accounts data
   * @throws {NotFoundError} If profile is not found
   */
  public async execute(input: ListAccountsByProfileInput): Promise<ListAccountsByProfileOutput> {
    const session = this.sessionHandler.get();
    const sessionTenantId = SessionContextExtractor.extractTenantId(session);
    const userId = this.authorizationHelper.getAuthenticatedUserId();

    this.logger.info(
      {
        profileId: input.profileId,
        sessionTenantId,
        userId,
      },
      'list_accounts_by_profile:start',
      ListAccountsByProfileUseCase.name,
    );

    // Verify profile exists
    const profile = await this.getProfileRepository.findById({
      profileId: input.profileId,
    });

    if (!profile) {
      throw new NotFoundError({
        message: `Profile with ID ${input.profileId} not found`,
      });
    }

    // Check if user is master
    const user = await this.getUserRepository.findById({ userId });

    if (!user) {
      throw new Error('User not found');
    }

    // Master users can access any profile, use the profile's tenant
    // Regular users can only access profiles in their current tenant
    const tenantId = user.isMaster ? profile.tenantId : sessionTenantId;

    // Verify profile belongs to the tenant (for non-master users, this was already checked above)
    if (!user.isMaster && profile.tenantId !== sessionTenantId) {
      throw new NotFoundError({
        message: `Profile with ID ${input.profileId} not found for tenant ${sessionTenantId}`,
      });
    }

    // Get accounts for the profile
    // Use the calculated tenantId: profile's tenant for master users, session tenant for regular users
    const accounts = await this.listAccountsByProfileIdRepository.findByProfileId({
      profileId: input.profileId,
      tenantId,
    });

    this.logger.info(
      {
        profileId: input.profileId,
        accountCount: accounts.length,
      },
      'list_accounts_by_profile:success',
      ListAccountsByProfileUseCase.name,
    );

    return {
      accounts: accounts.map((account) => ({
        id: account.id,
        tenantId: account.tenantId,
        profileId: account.profileId,
        name: account.name,
        balance: account.balance.toString(),
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      })),
    };
  }
}
