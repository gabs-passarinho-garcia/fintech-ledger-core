import type { IService } from '@/common/interfaces/IService';
import type { ILogger } from '@/common/interfaces/ILogger';
import type { SessionHandler } from '@/common/providers/SessionHandler';
import type { ListTenantsByUserRepository } from '../infra/repositories/ListTenantsByUserRepository';
import type { ListAllTenantsRepository } from '../infra/repositories/ListAllTenantsRepository';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { AuthorizationHelper } from '@/models/auth/usecases/helpers/AuthorizationHelper';
import type { GetUserRepository } from '@/models/auth/infra/repositories/GetUserRepository';
import type { GetProfileRepository } from '@/models/auth/infra/repositories/GetProfileRepository';
import type { ListTenantsResponse } from '../dtos/ListTenants.dto';

export type ListTenantsByUserInput = Record<string, never>;

export type ListTenantsByUserOutput = ListTenantsResponse;

/**
 * Use case for listing tenants associated with the authenticated user.
 * Returns all unique tenants from the user's profiles.
 * Master users receive all tenants in the system (non-deleted).
 */
export class ListTenantsByUserUseCase
  implements IService<ListTenantsByUserInput, ListTenantsByUserOutput>
{
  private readonly logger: ILogger;
  private readonly listTenantsByUserRepository: ListTenantsByUserRepository;
  private readonly listAllTenantsRepository: ListAllTenantsRepository;
  private readonly authorizationHelper: AuthorizationHelper;
  private readonly getUserRepository: GetUserRepository;

  public constructor(opts: {
    [AppProviders.logger]: ILogger;
    [AppProviders.listTenantsByUserRepository]: ListTenantsByUserRepository;
    [AppProviders.listAllTenantsRepository]: ListAllTenantsRepository;
    [AppProviders.sessionHandler]: SessionHandler;
    [AppProviders.getUserRepository]: GetUserRepository;
    [AppProviders.getProfileRepository]: GetProfileRepository;
  }) {
    this.logger = opts[AppProviders.logger];
    this.listTenantsByUserRepository = opts[AppProviders.listTenantsByUserRepository];
    this.listAllTenantsRepository = opts[AppProviders.listAllTenantsRepository];
    this.getUserRepository = opts[AppProviders.getUserRepository];
    this.authorizationHelper = new AuthorizationHelper({
      sessionHandler: opts[AppProviders.sessionHandler],
      getUserRepository: opts[AppProviders.getUserRepository],
      getProfileRepository: opts[AppProviders.getProfileRepository],
    });
  }

  /**
   * Executes the list tenants by user use case.
   * Lists all unique tenants associated with the authenticated user's profiles.
   * Master users receive all tenants in the system (non-deleted).
   *
   * @param _input - Empty input (uses authenticated user from session)
   * @returns List of tenants for the authenticated user (all tenants if master)
   * @throws {ForbiddenError} If user is not authenticated
   */
  public async execute(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _input: ListTenantsByUserInput = {} as ListTenantsByUserInput,
  ): Promise<ListTenantsByUserOutput> {
    const userId = this.authorizationHelper.getAuthenticatedUserId();

    this.logger.info(
      {
        userId,
      },
      'list_tenants_by_user:start',
      ListTenantsByUserUseCase.name,
    );

    // Check if user is master
    const user = await this.getUserRepository.findById({ userId });

    if (!user) {
      throw new Error('User not found');
    }

    // Master users receive all tenants (non-deleted)
    const tenants = user.isMaster
      ? await this.listAllTenantsRepository.listAll({ includeDeleted: false })
      : await this.listTenantsByUserRepository.listByUserId({ userId });

    this.logger.info(
      {
        userId,
        tenantCount: tenants.length,
        isMaster: user.isMaster,
      },
      'list_tenants_by_user:success',
      ListTenantsByUserUseCase.name,
    );

    return {
      tenants: tenants.map((tenant) => ({
        id: tenant.id,
        name: tenant.name,
        createdBy: tenant.createdBy,
        createdAt: tenant.createdAt,
        updatedBy: tenant.updatedBy,
        updatedAt: tenant.updatedAt,
        deletedBy: tenant.deletedBy,
        deletedAt: tenant.deletedAt,
      })),
    };
  }
}
