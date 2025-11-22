import type { IService } from '@/common/interfaces/IService';
import type { ILogger } from '@/common/interfaces/ILogger';
import type { SessionHandler } from '@/common/providers/SessionHandler';
import type { ListAllTenantsRepository } from '../infra/repositories/ListAllTenantsRepository';
import { AppProviders } from '@/common/interfaces/IAppContainer';
import { AuthorizationHelper } from '@/models/auth/usecases/helpers/AuthorizationHelper';
import type { GetUserRepository } from '@/models/auth/infra/repositories/GetUserRepository';
import type { GetProfileRepository } from '@/models/auth/infra/repositories/GetProfileRepository';
import type { ListAllTenantsResponse, ListAllTenantsQuery } from '../dtos/ListAllTenants.dto';

export type ListAllTenantsInput = ListAllTenantsQuery;

export type ListAllTenantsOutput = ListAllTenantsResponse;

/**
 * Use case for listing all tenants in the system.
 * Only master users can execute this use case.
 */
export class ListAllTenantsUseCase implements IService<ListAllTenantsInput, ListAllTenantsOutput> {
  private readonly logger: ILogger;
  private readonly listAllTenantsRepository: ListAllTenantsRepository;
  private readonly authorizationHelper: AuthorizationHelper;

  public constructor(opts: {
    [AppProviders.logger]: ILogger;
    [AppProviders.listAllTenantsRepository]: ListAllTenantsRepository;
    [AppProviders.sessionHandler]: SessionHandler;
    [AppProviders.getUserRepository]: GetUserRepository;
    [AppProviders.getProfileRepository]: GetProfileRepository;
  }) {
    this.logger = opts[AppProviders.logger];
    this.listAllTenantsRepository = opts[AppProviders.listAllTenantsRepository];
    this.authorizationHelper = new AuthorizationHelper({
      sessionHandler: opts[AppProviders.sessionHandler],
      getUserRepository: opts[AppProviders.getUserRepository],
      getProfileRepository: opts[AppProviders.getProfileRepository],
    });
  }

  /**
   * Executes the list all tenants use case.
   * Verifies master user privileges before listing tenants.
   *
   * @param input - The input data with optional pagination and includeDeleted flag
   * @returns List of all tenants
   * @throws {ForbiddenError} If user is not a master user
   */
  public async execute(input: ListAllTenantsInput): Promise<ListAllTenantsOutput> {
    this.logger.info(
      {
        includeDeleted: input.includeDeleted,
        skip: input.skip,
        take: input.take,
      },
      'list_all_tenants:start',
      ListAllTenantsUseCase.name,
    );

    // Check master user privileges
    await this.authorizationHelper.requireMaster();

    const tenants = await this.listAllTenantsRepository.listAll({
      includeDeleted: input.includeDeleted,
      skip: input.skip,
      take: input.take,
    });

    this.logger.info(
      {
        tenantCount: tenants.length,
      },
      'list_all_tenants:success',
      ListAllTenantsUseCase.name,
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
