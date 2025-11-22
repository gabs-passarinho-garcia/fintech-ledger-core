import type { IService } from '@/common/interfaces/IService';
import type { ILogger } from '@/common/interfaces/ILogger';
import type { SessionHandler } from '@/common/providers/SessionHandler';
import type { ListTenantsByUserRepository } from '../infra/repositories/ListTenantsByUserRepository';
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
 */
export class ListTenantsByUserUseCase
  implements IService<ListTenantsByUserInput, ListTenantsByUserOutput>
{
  private readonly logger: ILogger;
  private readonly listTenantsByUserRepository: ListTenantsByUserRepository;
  private readonly authorizationHelper: AuthorizationHelper;

  public constructor(opts: {
    [AppProviders.logger]: ILogger;
    [AppProviders.listTenantsByUserRepository]: ListTenantsByUserRepository;
    [AppProviders.sessionHandler]: SessionHandler;
    [AppProviders.getUserRepository]: GetUserRepository;
    [AppProviders.getProfileRepository]: GetProfileRepository;
  }) {
    this.logger = opts[AppProviders.logger];
    this.listTenantsByUserRepository = opts[AppProviders.listTenantsByUserRepository];
    this.authorizationHelper = new AuthorizationHelper({
      sessionHandler: opts[AppProviders.sessionHandler],
      getUserRepository: opts[AppProviders.getUserRepository],
      getProfileRepository: opts[AppProviders.getProfileRepository],
    });
  }

  /**
   * Executes the list tenants by user use case.
   * Lists all unique tenants associated with the authenticated user's profiles.
   *
   * @param _input - Empty input (uses authenticated user from session)
   * @returns List of tenants for the authenticated user
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

    const tenants = await this.listTenantsByUserRepository.listByUserId({ userId });

    this.logger.info(
      {
        userId,
        tenantCount: tenants.length,
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
